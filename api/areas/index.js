'use strict'
const { getDB } = require('../../lib/db')
const { setCorsHeaders, respondOk, respondError, getBody, getUsuarioAutenticado } = require('../../lib/helpers')
const { spMarcarTopicoVisto, spToggleRevisao } = require('../../lib/procedures')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query?.action || ''
  const sql = getDB()

  // ── GET lista de áreas ────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === '') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return

    const areas = await sql`
      SELECT id, titulo, descricao, tags, icone, ordem, nivel_plano
      FROM areas WHERE ativo = TRUE ORDER BY ordem
    `

    const progRows = await sql`
      SELECT area_id, topicos_vistos, total_topicos, porcentagem, concluida
      FROM progresso_areas WHERE usuario_id = ${user.id}
    `
    const progressoMap = Object.fromEntries(progRows.map(p => [p.area_id, p]))

    for (const area of areas) {
      area.tags = typeof area.tags === 'string' ? JSON.parse(area.tags || '[]') : (area.tags || [])
      const p = progressoMap[area.id]
      area.progresso = p
        ? { topicos_vistos: p.topicos_vistos, total_topicos: p.total_topicos, porcentagem: parseFloat(p.porcentagem), concluida: Boolean(p.concluida) }
        : { topicos_vistos: 0, total_topicos: 0, porcentagem: 0, concluida: false }
      area.bloqueada = (area.nivel_plano === 'pro' || area.nivel_plano === 'anual') && user.plano === 'free'
    }

    return respondOk(res, { areas })
  }

  // ── GET tópicos de uma área ──────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'topicos') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const area_id = parseInt(req.query?.area_id || '0')
    if (!area_id) return respondError(res, 'area_id é obrigatório.')

    const [areaData] = await sql`SELECT id, titulo, nivel_plano FROM areas WHERE id = ${area_id} AND ativo = TRUE`
    if (!areaData) return respondError(res, 'Área não encontrada.', 404)
    if ((areaData.nivel_plano === 'pro' || areaData.nivel_plano === 'anual') && user.plano === 'free') {
      return respondError(res, 'Plano Pro necessário para acessar esta área.', 403)
    }

    const topicos = await sql`SELECT id, titulo, conteudo, nota, ordem FROM topicos WHERE area_id = ${area_id} AND ativo = TRUE ORDER BY ordem`

    for (const t of topicos) {
      const itensRows = await sql`SELECT texto FROM topico_itens WHERE topico_id = ${t.id} ORDER BY ordem`
      t.itens = itensRows.map(r => r.texto)
      t.notas = t.nota ? [t.nota] : []

      const [visto] = await sql`SELECT visto, revisao FROM progresso_topicos WHERE usuario_id = ${user.id} AND topico_id = ${t.id}`
      t.visto   = Boolean(visto?.visto)
      t.revisao = Boolean(visto?.revisao)
    }

    return respondOk(res, { area: areaData, topicos })
  }

  // ── POST marcar_topico ────────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'marcar_topico') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const topico_id = parseInt(body.topico_id || '0')
    if (!topico_id) return respondError(res, 'topico_id é obrigatório.')

    await spMarcarTopicoVisto(sql, user.id, topico_id)
    return respondOk(res, {}, 'Tópico marcado como visto.')
  }

  // ── POST toggle_revisao ───────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'toggle_revisao') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const topico_id = parseInt(body.topico_id || '0')
    if (!topico_id) return respondError(res, 'topico_id é obrigatório.')

    await spToggleRevisao(sql, user.id, topico_id)
    const [row] = await sql`SELECT revisao FROM progresso_topicos WHERE usuario_id = ${user.id} AND topico_id = ${topico_id}`
    return respondOk(res, { revisao: Boolean(row?.revisao) }, 'Revisão atualizada.')
  }

  // ── GET topicos_revisao ───────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'topicos_revisao') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return

    const topicos = await sql`
      SELECT t.id, t.titulo, t.area_id, a.titulo AS area_titulo, pt.revisao_em
      FROM progresso_topicos pt
      JOIN topicos t ON t.id = pt.topico_id
      JOIN areas   a ON a.id = t.area_id
      WHERE pt.usuario_id = ${user.id} AND pt.revisao = TRUE AND t.ativo = TRUE
      ORDER BY pt.revisao_em DESC
    `
    return respondOk(res, { topicos })
  }

  return respondError(res, 'Ação não encontrada.', 404)
}
