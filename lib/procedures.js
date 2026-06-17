'use strict'

async function spMarcarTopicoVisto(sql, usuario_id, topico_id) {
  const areaRows = await sql`SELECT area_id FROM topicos WHERE id = ${topico_id}`
  if (!areaRows[0]) return
  const area_id = areaRows[0].area_id

  await sql`
    INSERT INTO progresso_topicos (usuario_id, topico_id, visto, visto_em)
    VALUES (${usuario_id}, ${topico_id}, TRUE, NOW())
    ON CONFLICT(usuario_id, topico_id) DO UPDATE SET
      visto    = TRUE,
      visto_em = CASE WHEN progresso_topicos.visto = FALSE THEN NOW() ELSE progresso_topicos.visto_em END
  `

  const [{ total }] = await sql`
    SELECT COUNT(*)::int AS total FROM topicos WHERE area_id = ${area_id} AND ativo = TRUE
  `
  const [{ vistos }] = await sql`
    SELECT COUNT(*)::int AS vistos
    FROM progresso_topicos pt
    JOIN topicos t ON t.id = pt.topico_id
    WHERE pt.usuario_id = ${usuario_id} AND t.area_id = ${area_id} AND pt.visto = TRUE
  `
  const pct = total > 0 ? Math.round((vistos / total) * 100 * 100) / 100 : 0
  const concluida = total > 0 && vistos >= total

  await sql`
    INSERT INTO progresso_areas (usuario_id, area_id, topicos_vistos, total_topicos, porcentagem, concluida, ultimo_acesso)
    VALUES (${usuario_id}, ${area_id}, ${vistos}, ${total}, ${pct}, ${concluida}, NOW())
    ON CONFLICT(usuario_id, area_id) DO UPDATE SET
      topicos_vistos = ${vistos},
      total_topicos  = ${total},
      porcentagem    = ${pct},
      concluida      = ${concluida},
      ultimo_acesso  = NOW()
  `
}

async function spToggleRevisao(sql, usuario_id, topico_id) {
  await sql`
    INSERT INTO progresso_topicos (usuario_id, topico_id, revisao, revisao_em)
    VALUES (${usuario_id}, ${topico_id}, TRUE, NOW())
    ON CONFLICT(usuario_id, topico_id) DO UPDATE SET
      revisao    = CASE WHEN progresso_topicos.revisao = TRUE THEN FALSE ELSE TRUE END,
      revisao_em = CASE WHEN progresso_topicos.revisao = FALSE THEN NOW() ELSE NULL END
  `
}

async function spFinalizarSimulado(sql, simulado_id, tempo_segundos) {
  const [r] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE correta = TRUE)::int  AS acertos,
      COUNT(*) FILTER (WHERE correta = FALSE AND opcao_id IS NOT NULL)::int AS erros,
      COUNT(*)::int AS total
    FROM simulado_respostas WHERE simulado_id = ${simulado_id}
  `
  const pct = r.total > 0 ? Math.round((r.acertos / r.total) * 100 * 100) / 100 : 0

  await sql`
    UPDATE simulados SET
      acertos        = ${r.acertos},
      erros          = ${r.erros},
      total_questoes = ${r.total},
      porcentagem    = ${pct},
      tempo_segundos = ${tempo_segundos},
      concluido      = TRUE,
      concluido_em   = NOW()
    WHERE id = ${simulado_id}
  `

  return { acertos: r.acertos, erros: r.erros, total: r.total, porcentagem: pct }
}

module.exports = { spMarcarTopicoVisto, spToggleRevisao, spFinalizarSimulado }
