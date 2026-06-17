'use strict'
const { getDB } = require('../../lib/db')
const { setCorsHeaders, respondOk, respondError, getBody, getUsuarioAutenticado } = require('../../lib/helpers')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const sql = getDB()
  const user = await getUsuarioAutenticado(req, res, sql)
  if (!user) return

  const area_id = parseInt(req.query?.area_id || '0')
  if (!area_id) return respondError(res, 'area_id é obrigatório.')

  // ── GET ───────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const rows = await sql`
      SELECT conteudo, caracteres, atualizado_em
      FROM anotacoes WHERE usuario_id = ${user.id} AND area_id = ${area_id}
    `
    const nota = rows[0] || { conteudo: '', caracteres: 0, atualizado_em: null }
    return respondOk(res, { anotacao: nota })
  }

  // ── POST ──────────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = await getBody(req)
    const conteudo = body.conteudo || ''
    if (conteudo.length > 50000) return respondError(res, 'Anotação muito longa (máximo 50.000 caracteres).')
    const chars = conteudo.length

    await sql`
      INSERT INTO anotacoes (usuario_id, area_id, conteudo, caracteres)
      VALUES (${user.id}, ${area_id}, ${conteudo}, ${chars})
      ON CONFLICT(usuario_id, area_id) DO UPDATE SET
        conteudo      = ${conteudo},
        caracteres    = ${chars},
        atualizado_em = NOW()
    `
    return respondOk(res, { caracteres: chars }, 'Anotação salva.')
  }

  // ── DELETE ───────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    await sql`DELETE FROM anotacoes WHERE usuario_id = ${user.id} AND area_id = ${area_id}`
    return respondOk(res, {}, 'Anotação removida.')
  }

  return respondError(res, 'Método não permitido.', 405)
}
