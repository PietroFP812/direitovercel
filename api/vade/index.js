'use strict'
const { getDB } = require('../../lib/db')
const { setCorsHeaders, respondOk, respondError, getBody, getUsuarioAutenticado } = require('../../lib/helpers')

async function fetchArticleDetails(sql, artigos) {
  for (const art of artigos) {
    art.mais_cobrado = Boolean(art.mais_cobrado)
    const pars = await sql`SELECT rotulo, texto FROM vade_paragrafos WHERE artigo_id = ${art.id} ORDER BY ordem`
    art.paragrafos = pars
    const incs = await sql`SELECT rotulo, texto FROM vade_incisos WHERE artigo_id = ${art.id} ORDER BY ordem`
    art.incisos = incs
  }
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query?.action || ''
  const sql = getDB()

  // ── GET estrutura completa ───────────────────────────────────────────────────
  if (req.method === 'GET' && action === '') {
    await getUsuarioAutenticado(req, res, sql)
    const partes = await sql`SELECT id, codigo, titulo, subtitulo, range_arts FROM vade_partes ORDER BY ordem`

    for (const parte of partes) {
      const caps = await sql`SELECT id, titulo FROM vade_capitulos WHERE parte_id = ${parte.id} ORDER BY ordem`
      for (const cap of caps) {
        const arts = await sql`SELECT id, numero, caput, mais_cobrado, nota FROM vade_artigos WHERE capitulo_id = ${cap.id} ORDER BY ordem`
        await fetchArticleDetails(sql, arts)
        cap.artigos = arts
      }
      parte.capitulos = caps
    }
    return respondOk(res, { partes })
  }

  // ── GET estrutura (TOC) ──────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'estrutura') {
    await getUsuarioAutenticado(req, res, sql)
    const partes = await sql`SELECT id, codigo, titulo, subtitulo, range_arts FROM vade_partes ORDER BY ordem`
    for (const parte of partes) {
      parte.capitulos = await sql`SELECT id, titulo FROM vade_capitulos WHERE parte_id = ${parte.id} ORDER BY ordem`
    }
    return respondOk(res, { partes })
  }

  // ── GET por_parte ────────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'por_parte') {
    await getUsuarioAutenticado(req, res, sql)
    const parte_id = parseInt(req.query?.parte_id || '0')
    if (!parte_id) return respondError(res, 'parte_id é obrigatório.')

    const caps = await sql`SELECT id, titulo FROM vade_capitulos WHERE parte_id = ${parte_id} ORDER BY ordem`
    for (const cap of caps) {
      const arts = await sql`SELECT id, numero, caput, mais_cobrado, nota FROM vade_artigos WHERE capitulo_id = ${cap.id} ORDER BY ordem`
      await fetchArticleDetails(sql, arts)
      cap.artigos = arts
    }
    return respondOk(res, { capitulos: caps })
  }

  // ── GET buscar ───────────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'buscar') {
    await getUsuarioAutenticado(req, res, sql)
    const q = (req.query?.q || '').trim()
    if (q.length < 2) return respondError(res, 'Digite pelo menos 2 caracteres.')

    const like = `%${q}%`
    const results = await sql`
      SELECT va.id, va.numero, va.caput, va.mais_cobrado,
             vc.titulo AS capitulo, vp.titulo AS parte
      FROM vade_artigos va
      JOIN vade_capitulos vc ON vc.id = va.capitulo_id
      JOIN vade_partes    vp ON vp.id = vc.parte_id
      WHERE va.numero ILIKE ${like} OR va.caput ILIKE ${like} OR va.nota ILIKE ${like}
      LIMIT 30
    `
    results.forEach(r => { r.mais_cobrado = Boolean(r.mais_cobrado) })
    return respondOk(res, { resultados: results, total: results.length })
  }

  // ── POST favoritar ───────────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'favoritar') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const body = await getBody(req)
    const artigo_id = parseInt(body.artigo_id || '0')
    if (!artigo_id) return respondError(res, 'artigo_id é obrigatório.')

    await sql`
      INSERT INTO favoritos_artigos (usuario_id, artigo_id) VALUES (${user.id}, ${artigo_id})
      ON CONFLICT DO NOTHING
    `
    return respondOk(res, {}, 'Artigo favoritado.')
  }

  // ── DELETE favoritar ─────────────────────────────────────────────────────────
  if (req.method === 'DELETE' && action === 'favoritar') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return
    const artigo_id = parseInt(req.query?.artigo_id || '0')
    if (!artigo_id) return respondError(res, 'artigo_id é obrigatório.')

    await sql`DELETE FROM favoritos_artigos WHERE usuario_id = ${user.id} AND artigo_id = ${artigo_id}`
    return respondOk(res, {}, 'Favorito removido.')
  }

  // ── GET favoritos ────────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'favoritos') {
    const user = await getUsuarioAutenticado(req, res, sql)
    if (!user) return

    const favs = await sql`
      SELECT va.id, va.numero, va.caput
      FROM favoritos_artigos fa
      JOIN vade_artigos va ON va.id = fa.artigo_id
      WHERE fa.usuario_id = ${user.id}
      ORDER BY fa.criado_em DESC
    `
    return respondOk(res, { favoritos: favs })
  }

  return respondError(res, 'Ação não encontrada.', 404)
}
