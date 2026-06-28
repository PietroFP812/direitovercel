'use strict'
const { getDB } = require('../../lib/db')
const { gerarToken, makeSessionCookie, parseCookies } = require('../../lib/helpers')

const APP_URL = () => process.env.APP_URL || ''

function getRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI
    || `${APP_URL()}/api/auth/oauth?action=callback`
}

function googleConfigured() {
  const id = process.env.GOOGLE_CLIENT_ID || ''
  return id !== '' && !id.includes('SEU_CLIENT_ID')
}

module.exports = async function handler(req, res) {
  const action = req.query?.action || ''

  // ── Iniciar OAuth ──────────────────────────────────────────────────────────
  if (action === 'init') {
    if (!googleConfigured()) {
      res.writeHead(302, { Location: `${APP_URL()}/index.html?oauth_error=not_configured` })
      return res.end()
    }

    const state = gerarToken(16)
    const stateExpires = new Date(Date.now() + 10 * 60 * 1000).toUTCString()

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: getRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account'
    })

    res.setHeader('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=${stateExpires}`)
    res.writeHead(302, { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}` })
    return res.end()
  }

  // ── Callback do Google ─────────────────────────────────────────────────────
  if (action === 'callback') {
    const code = req.query.code || ''
    const state = req.query.state || ''
    const error = req.query.error || ''

    if (error || !code) {
      res.writeHead(302, { Location: `${APP_URL()}/index.html?oauth_error=${encodeURIComponent(error || 'cancelled')}` })
      return res.end()
    }

    const cookies = parseCookies(req.headers.cookie || '')
    if (!cookies.oauth_state || cookies.oauth_state !== state) {
      res.writeHead(302, { Location: `${APP_URL()}/index.html?oauth_error=invalid_state` })
      return res.end()
    }

    // Limpa state cookie
    const clearState = `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=${new Date(0).toUTCString()}`

    // Troca code por access_token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: getRedirectUri(),
        grant_type: 'authorization_code'
      }).toString()
    })
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      res.writeHead(302, { Location: `${APP_URL()}/index.html?oauth_error=token_failed` })
      return res.end()
    }

    // Busca info do usuário
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const userInfo = await userRes.json()

    if (!userInfo.email) {
      res.writeHead(302, { Location: `${APP_URL()}/index.html?oauth_error=userinfo_failed` })
      return res.end()
    }

    const sql = getDB()
    const googleId = userInfo.id || ''
    const email = userInfo.email || ''
    const nome = userInfo.given_name || email.split('@')[0]
    const sobrenome = userInfo.family_name || ''

    // Encontra ou cria usuário
    let byProvider = await sql`SELECT id FROM usuarios WHERE provider = 'google' AND provider_id = ${googleId}`
    let userId = byProvider[0]?.id

    if (!userId) {
      const byEmail = await sql`SELECT id FROM usuarios WHERE email = ${email}`
      userId = byEmail[0]?.id
      if (userId) {
        await sql`UPDATE usuarios SET provider = 'google', provider_id = ${googleId}, email_verificado = TRUE WHERE id = ${userId}`
      }
    }

    if (!userId) {
      const [{ id }] = await sql`
        INSERT INTO usuarios (nome, sobrenome, email, provider, provider_id, plano, ativo, email_verificado)
        VALUES (${nome}, ${sobrenome}, ${email}, 'google', ${googleId}, 'free', TRUE, TRUE)
        RETURNING id
      `
      userId = id
    }

    const [check] = await sql`SELECT ativo FROM usuarios WHERE id = ${userId}`
    if (!check?.ativo) {
      res.writeHead(302, { Location: `${APP_URL()}/index.html?oauth_error=account_disabled` })
      return res.end()
    }

    const token = gerarToken()
    const expira = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const ip = ((req.headers['x-forwarded-for'] || '') + '').split(',')[0].trim() || '0.0.0.0'
    const ua = (req.headers['user-agent'] || '').substring(0, 500)

    await sql`INSERT INTO sessoes (id, usuario_id, ip, user_agent, expira_em) VALUES (${token}, ${userId}, ${ip}, ${ua}, ${expira})`
    await sql`UPDATE usuarios SET ultimo_login = NOW() WHERE id = ${userId}`

    const [userData] = await sql`SELECT id, nome, sobrenome, email, plano, tema FROM usuarios WHERE id = ${userId}`
    const payload = Buffer.from(JSON.stringify({ token, usuario: userData })).toString('base64')

    res.setHeader('Set-Cookie', [clearState, makeSessionCookie(token)])
    res.writeHead(302, { Location: `${APP_URL()}/app/home.html?oauth=${encodeURIComponent(payload)}` })
    return res.end()
  }

  res.writeHead(302, { Location: `${APP_URL()}/index.html` })
  res.end()
}
