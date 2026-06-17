'use strict'
const { getDB } = require('../../lib/db')
const { setCorsHeaders, respondOk, respondError, getBody, getUsuarioAutenticado } = require('../../lib/helpers')
const { spFinalizarSimulado } = require('../../lib/procedures')

async function buscarQuestoes(sql, area_id, total, excluir) {
  const hasArea = area_id > 0
  const hasExcluir = excluir.length > 0

  if (hasArea && hasExcluir) {
    return sql`
      SELECT q.id, q.enunciado, q.explicacao, q.dificuldade FROM questoes q
      WHERE q.ativo = TRUE AND q.area_id = ${area_id}
        AND NOT (q.id = ANY(${excluir}))
      ORDER BY RANDOM() LIMIT ${total}
    `
  }
  if (hasArea) {
    return sql`
      SELECT q.id, q.enunciado, q.explicacao, q.dificuldade FROM questoes q
      WHERE q.ativo = TRUE AND q.area_id = ${area_id}
      ORDER BY RANDOM() LIMIT ${total}
    `
  }
  if (hasExcluir) {
    return sql`
      SELECT q.id, q.enunciado, q.explicacao, q.dificuldade FROM questoes q
      WHERE q.ativo = TRUE AND NOT (q.id = ANY(${excluir}))
      ORDER BY RANDOM() LIMIT ${total}
    `
  }
  return sql`
    SELECT q.id, q.enunciado, q.explicacao, q.dificuldade FROM questoes q
    WHERE q.ativo = TRUE
    ORDER BY RANDOM() LIMIT ${total}
  `
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query?.action || ''
  const sql = getDB()

  // ── GET questoes ─────────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'questoes') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const area_id = parseInt(req.query?.area_id || '0')
    const total = Math.min(parseInt(req.query?.total || '10'), 20)

    const vistaRows = area_id > 0
      ? await sql`
          SELECT DISTINCT sr.questao_id FROM simulado_respostas sr
          JOIN simulados s ON s.id = sr.simulado_id
          WHERE s.usuario_id = ${user.id} AND s.area_id = ${area_id}
        `
      : await sql`
          SELECT DISTINCT sr.questao_id FROM simulado_respostas sr
          JOIN simulados s ON s.id = sr.simulado_id
          WHERE s.usuario_id = ${user.id}
        `

    const ids_vistos = vistaRows.map(r => r.questao_id)
    let questoes = await buscarQuestoes(sql, area_id, total, ids_vistos)
    let reiniciou = false

    if (questoes.length < total) {
      reiniciou = true
      questoes = await buscarQuestoes(sql, area_id, total, [])
    }

    for (const q of questoes) {
      const opts = await sql`SELECT id, letra, texto, correta FROM questao_opcoes WHERE questao_id = ${q.id} ORDER BY ordem`
      opts.forEach(o => { o.correta = Boolean(o.correta) })
      q.opcoes = opts
    }

    return respondOk(res, { questoes, reiniciou })
  }

  // ── POST iniciar ─────────────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'iniciar') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const area_id = (body.area_id !== null && body.area_id !== '') ? parseInt(body.area_id) : null
    const total = Math.min(parseInt(body.total || '10'), 20)

    const [{ id }] = await sql`
      INSERT INTO simulados (usuario_id, area_id, total_questoes) VALUES (${user.id}, ${area_id}, ${total}) RETURNING id
    `
    return respondOk(res, { simulado_id: id }, 'Simulado iniciado.')
  }

  // ── POST responder ───────────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'responder') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const simulado_id = parseInt(body.simulado_id || '0')
    const questao_id = parseInt(body.questao_id || '0')
    const opcao_id = parseInt(body.opcao_id || '0') || null
    const tempo_ms = parseInt(body.tempo_ms || '0')

    if (!simulado_id || !questao_id) return respondError(res, 'simulado_id e questao_id são obrigatórios.')

    const own = await sql`SELECT id FROM simulados WHERE id = ${simulado_id} AND usuario_id = ${user.id} AND concluido = FALSE`
    if (!own[0]) return respondError(res, 'Simulado não encontrado.', 404)

    let correta = false
    if (opcao_id) {
      const [op] = await sql`SELECT correta FROM questao_opcoes WHERE id = ${opcao_id} AND questao_id = ${questao_id}`
      correta = Boolean(op?.correta)
    }

    await sql`
      INSERT INTO simulado_respostas (simulado_id, questao_id, opcao_id, correta, tempo_ms)
      VALUES (${simulado_id}, ${questao_id}, ${opcao_id}, ${correta}, ${tempo_ms})
      ON CONFLICT(simulado_id, questao_id) DO UPDATE SET opcao_id = ${opcao_id}, correta = ${correta}, tempo_ms = ${tempo_ms}
    `
    return respondOk(res, { correta })
  }

  // ── POST finalizar ───────────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'finalizar') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const simulado_id = parseInt(body.simulado_id || '0')
    const tempo = parseInt(body.tempo_segundos || '0')
    if (!simulado_id) return respondError(res, 'simulado_id é obrigatório.')

    const own = await sql`SELECT id FROM simulados WHERE id = ${simulado_id} AND usuario_id = ${user.id}`
    if (!own[0]) return respondError(res, 'Simulado não encontrado.', 404)

    const resultado = await spFinalizarSimulado(sql, simulado_id, tempo)
    return respondOk(res, { resultado }, 'Simulado finalizado.')
  }

  // ── GET historico ────────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'historico') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return

    const historico = await sql`
      SELECT s.id, s.total_questoes, s.acertos, s.erros, s.porcentagem,
             s.tempo_segundos, s.iniciado_em, s.concluido_em,
             a.titulo AS area
      FROM simulados s
      LEFT JOIN areas a ON a.id = s.area_id
      WHERE s.usuario_id = ${user.id} AND s.concluido = TRUE
      ORDER BY s.concluido_em DESC LIMIT 20
    `
    return respondOk(res, { historico })
  }

  return respondError(res, 'Ação não encontrada.', 404)
}
