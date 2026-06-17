'use strict'
const bcrypt = require('bcryptjs')
const { getDB } = require('../../lib/db')
const {
  setCorsHeaders, respondOk, respondError, getBody,
  gerarToken, getUsuarioAutenticado, makeSessionCookie, parseCookies
} = require('../../lib/helpers')
const { emailReset } = require('../../lib/mailer')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query?.action || ''
  const sql = getDB()

  // ── POST login ───────────────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'login') {
    const body = await getBody(req)
    const email = (body.email || '').trim()
    const senha = body.senha || ''
    if (!email || !senha) return respondError(res, 'E-mail e senha são obrigatórios.')

    const ip = ((req.headers['x-forwarded-for'] || '') + '').split(',')[0].trim() || '0.0.0.0'

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM tentativas_login
      WHERE ip = ${ip} AND criado_em > NOW() - INTERVAL '15 minutes'
    `
    if (count >= 5) return respondError(res, 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.', 429)

    const users = await sql`
      SELECT id, nome, sobrenome, email, senha_hash, plano, tema, ativo
      FROM usuarios WHERE email = ${email}
    `
    const user = users[0]

    if (!user || !bcrypt.compareSync(senha, user.senha_hash || '')) {
      await sql`INSERT INTO tentativas_login (ip, email) VALUES (${ip}, ${email})`
      return respondError(res, 'E-mail ou senha incorretos.', 401)
    }
    if (!user.ativo) return respondError(res, 'Conta desativada. Entre em contato com o suporte.', 403)

    await sql`DELETE FROM tentativas_login WHERE ip = ${ip} AND email = ${email}`

    const token = gerarToken()
    const expira = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const ua = (req.headers['user-agent'] || '').substring(0, 500)

    await sql`INSERT INTO sessoes (id, usuario_id, ip, user_agent, expira_em) VALUES (${token}, ${user.id}, ${ip}, ${ua}, ${expira})`
    await sql`UPDATE usuarios SET ultimo_login = NOW() WHERE id = ${user.id}`
    await sql`DELETE FROM sessoes WHERE expira_em < NOW()`
    await sql`INSERT INTO logs_acesso (usuario_id, acao, ip, user_agent) VALUES (${user.id}, 'login', ${ip}, ${ua})`

    res.setHeader('Set-Cookie', makeSessionCookie(token))
    return respondOk(res, {
      token,
      usuario: { id: user.id, nome: user.nome, sobrenome: user.sobrenome, email: user.email, plano: user.plano, tema: user.tema }
    }, 'Login realizado com sucesso.')
  }

  // ── POST register ────────────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'register') {
    const body = await getBody(req)
    const nome = (body.nome || '').trim()
    const sobrenome = (body.sobrenome || '').trim()
    const email = (body.email || '').trim()
    const senha = body.senha || ''

    if (!nome || !email || !senha) return respondError(res, 'Nome, e-mail e senha são obrigatórios.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respondError(res, 'E-mail inválido.')
    if (senha.length < 6) return respondError(res, 'A senha deve ter no mínimo 6 caracteres.')

    const ip = ((req.headers['x-forwarded-for'] || '') + '').split(',')[0].trim() || '0.0.0.0'

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM tentativas_login
      WHERE ip = ${ip} AND email = '__cadastro__' AND criado_em > NOW() - INTERVAL '1 hour'
    `
    if (count >= 3) return respondError(res, 'Muitos cadastros deste IP. Aguarde 1 hora.', 429)
    await sql`INSERT INTO tentativas_login (ip, email) VALUES (${ip}, '__cadastro__')`

    const existing = await sql`SELECT id FROM usuarios WHERE email = ${email}`
    if (existing[0]) return respondError(res, 'E-mail já cadastrado.')

    const hash = bcrypt.hashSync(senha, 12)
    const verifyToken = gerarToken()

    const [{ id: userId }] = await sql`
      INSERT INTO usuarios (nome, sobrenome, email, senha_hash, token_verificacao)
      VALUES (${nome}, ${sobrenome}, ${email}, ${hash}, ${verifyToken})
      RETURNING id
    `

    const sessToken = gerarToken()
    const expira = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const ua = (req.headers['user-agent'] || '').substring(0, 500)

    await sql`INSERT INTO sessoes (id, usuario_id, ip, user_agent, expira_em) VALUES (${sessToken}, ${userId}, ${ip}, ${ua}, ${expira})`
    await sql`INSERT INTO logs_acesso (usuario_id, acao, ip, user_agent) VALUES (${userId}, 'register', ${ip}, ${ua})`

    res.setHeader('Set-Cookie', makeSessionCookie(sessToken))
    return respondOk(res, {
      token: sessToken,
      usuario: { id: userId, nome, sobrenome, email, plano: 'free', tema: 'dark' }
    }, 'Conta criada com sucesso.')
  }

  // ── POST logout ──────────────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'logout') {
    const token = req.headers['x-session-token'] || parseCookies(req.headers.cookie || '').lex_session
    if (token) {
      await sql`DELETE FROM sessoes WHERE id = ${token}`
      res.setHeader('Set-Cookie', makeSessionCookie('', true))
    }
    return respondOk(res, {}, 'Logout realizado.')
  }

  // ── GET me ───────────────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'me') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    return respondOk(res, { usuario: user })
  }

  // ── PUT tema ─────────────────────────────────────────────────────────────────
  if (req.method === 'PUT' && action === 'tema') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const tema = body.tema || 'dark'
    if (!['dark', 'light'].includes(tema)) return respondError(res, 'Tema inválido.')
    await sql`UPDATE usuarios SET tema = ${tema} WHERE id = ${user.id}`
    return respondOk(res, {}, 'Tema atualizado.')
  }

  // ── PUT atualizar_perfil ─────────────────────────────────────────────────────
  if (req.method === 'PUT' && action === 'atualizar_perfil') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const nome = (body.nome || '').trim()
    const sobrenome = (body.sobrenome || '').trim()
    const email = (body.email || '').trim()

    if (!nome) return respondError(res, 'Nome é obrigatório.')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respondError(res, 'E-mail inválido.')

    if (email && email !== user.email) {
      const check = await sql`SELECT id FROM usuarios WHERE email = ${email} AND id != ${user.id}`
      if (check[0]) return respondError(res, 'E-mail já está em uso.')
    }

    const newEmail = email || user.email
    await sql`UPDATE usuarios SET nome = ${nome}, sobrenome = ${sobrenome}, email = ${newEmail} WHERE id = ${user.id}`
    const [updated] = await sql`SELECT id, nome, sobrenome, email, plano, tema FROM usuarios WHERE id = ${user.id}`
    return respondOk(res, { usuario: updated }, 'Perfil atualizado.')
  }

  // ── PUT alterar_senha ────────────────────────────────────────────────────────
  if (req.method === 'PUT' && action === 'alterar_senha') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const senha_atual = body.senha_atual || ''
    const senha_nova = body.senha_nova || ''

    if (!senha_atual || !senha_nova) return respondError(res, 'Senha atual e nova são obrigatórias.')
    if (senha_nova.length < 6) return respondError(res, 'A nova senha deve ter no mínimo 6 caracteres.')

    const [row] = await sql`SELECT senha_hash, provider FROM usuarios WHERE id = ${user.id}`
    if (row?.provider !== 'local') return respondError(res, 'Conta OAuth — senha gerenciada pelo provedor.')
    if (!bcrypt.compareSync(senha_atual, row.senha_hash || '')) return respondError(res, 'Senha atual incorreta.', 401)

    const newHash = bcrypt.hashSync(senha_nova, 12)
    await sql`UPDATE usuarios SET senha_hash = ${newHash} WHERE id = ${user.id}`

    const tokenAtual = req.headers['x-session-token'] || parseCookies(req.headers.cookie || '').lex_session || ''
    await sql`DELETE FROM sessoes WHERE usuario_id = ${user.id} AND id != ${tokenAtual}`
    return respondOk(res, {}, 'Senha alterada com sucesso.')
  }

  // ── POST solicitar_reset ─────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'solicitar_reset') {
    const body = await getBody(req)
    const email = (body.email || '').trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respondError(res, 'E-mail inválido.')

    const users = await sql`SELECT id, nome, provider FROM usuarios WHERE email = ${email} AND ativo = TRUE`
    const user = users[0]

    if (!user || user.provider !== 'local') {
      return respondOk(res, { dev_link: null }, 'Se o e-mail existir, você receberá um link em breve.')
    }

    const token = gerarToken(24)
    const expira = new Date(Date.now() + 60 * 60 * 1000)
    await sql`UPDATE usuarios SET token_reset_senha = ${token}, token_reset_expira_em = ${expira} WHERE id = ${user.id}`

    const appUrl = process.env.APP_URL || `https://${req.headers.host}`
    const resetLink = `${appUrl}/reset_senha.html?token=${token}`
    const enviado = await emailReset(email, user.nome, resetLink)

    if (enviado) return respondOk(res, {}, 'Se o e-mail existir na base, você receberá o link em breve.')
    return respondOk(res, { dev_link: resetLink }, 'Link gerado (configure SMTP no Vercel para enviar e-mail).')
  }

  // ── POST resetar_senha ───────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'resetar_senha') {
    const body = await getBody(req)
    const token = (body.token || '').trim()
    const senha = body.senha || ''

    if (!token) return respondError(res, 'Token inválido.')
    if (senha.length < 6) return respondError(res, 'A senha deve ter no mínimo 6 caracteres.')

    const users = await sql`
      SELECT id FROM usuarios
      WHERE token_reset_senha = ${token} AND token_reset_expira_em > NOW() AND ativo = TRUE
    `
    if (!users[0]) return respondError(res, 'Link inválido ou expirado. Solicite um novo.', 400)

    const hash = bcrypt.hashSync(senha, 12)
    await sql`
      UPDATE usuarios SET senha_hash = ${hash}, token_reset_senha = NULL, token_reset_expira_em = NULL
      WHERE id = ${users[0].id}
    `
    return respondOk(res, {}, 'Senha redefinida com sucesso. Faça login.')
  }

  return respondError(res, 'Ação não encontrada.', 404)
}
