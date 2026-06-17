'use strict'
const { getDB } = require('../../lib/db')
const { setCorsHeaders, respondOk, respondError, getBody, getUsuarioAutenticado } = require('../../lib/helpers')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query?.action || ''
  const sql = getDB()

  // ── POST assinar ──────────────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'assinar') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const plano = (body.plano || '').trim()
    const metodo = (body.metodo || 'cartao').trim()
    const ultimos4 = (body.ultimos4 || '').trim() || null

    if (!['pro', 'anual'].includes(plano)) return respondError(res, 'Plano inválido.')
    if (!['cartao', 'pix', 'boleto'].includes(metodo)) return respondError(res, 'Método inválido.')

    const valores = { pro: 29.90, anual: 228.00 }
    const valor = valores[plano]

    await sql`
      INSERT INTO pagamentos (usuario_id, plano, valor, status, metodo, ultimos_4)
      VALUES (${user.id}, ${plano}, ${valor}, 'aprovado', ${metodo}, ${ultimos4})
    `
    await sql`UPDATE usuarios SET plano = ${plano} WHERE id = ${user.id}`

    return respondOk(res, { plano, valor, status: 'aprovado' }, 'Assinatura ativada com sucesso!')
  }

  // ── GET historico ─────────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'historico') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return

    const pagamentos = await sql`
      SELECT plano, valor, status, metodo, ultimos_4, criado_em
      FROM pagamentos WHERE usuario_id = ${user.id} ORDER BY criado_em DESC
    `
    return respondOk(res, { pagamentos })
  }

  return respondError(res, 'Ação não encontrada.', 404)
}
