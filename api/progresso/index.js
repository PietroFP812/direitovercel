'use strict'
const { getDB } = require('../../lib/db')
const { setCorsHeaders, respondOk, respondError, getUsuarioAutenticado } = require('../../lib/helpers')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return respondError(res, 'Ação não encontrada.', 404)

  const sql = getDB()
  const user = await getUsuarioAutenticado(req, res, sql)
  if (!user) return

  const areas = await sql`
    SELECT a.id, a.titulo, a.icone,
           COALESCE(pa.topicos_vistos, 0) AS topicos_vistos,
           COALESCE(pa.total_topicos, 0)  AS total_topicos,
           COALESCE(pa.porcentagem, 0)    AS porcentagem,
           COALESCE(pa.concluida, FALSE)  AS concluida,
           pa.ultimo_acesso
    FROM areas a
    LEFT JOIN progresso_areas pa ON pa.area_id = a.id AND pa.usuario_id = ${user.id}
    WHERE a.ativo = TRUE ORDER BY a.ordem
  `

  const [stats] = await sql`
    SELECT
      COUNT(DISTINCT s.id)::int                          AS total_simulados,
      COALESCE(ROUND(AVG(s.porcentagem)::numeric, 1), 0) AS media_simulados,
      COALESCE(MAX(s.porcentagem), 0)                    AS melhor_simulado,
      COUNT(DISTINCT CASE WHEN pa.concluida THEN pa.area_id END)::int AS areas_concluidas,
      COUNT(DISTINCT fa.artigo_id)::int                  AS artigos_favoritados
    FROM usuarios u
    LEFT JOIN simulados s          ON s.usuario_id = u.id AND s.concluido = TRUE
    LEFT JOIN progresso_areas pa   ON pa.usuario_id = u.id
    LEFT JOIN favoritos_artigos fa ON fa.usuario_id = u.id
    WHERE u.id = ${user.id}
  `

  return respondOk(res, { areas, stats })
}
