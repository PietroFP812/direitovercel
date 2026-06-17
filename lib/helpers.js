'use strict'
const crypto = require('crypto')
const { getDB } = require('./db')

function setCorsHeaders(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token')
}

function respondError(res, msg, status = 400) {
  res.status(status).json({ erro: true, mensagem: msg })
}

function respondOk(res, data = {}, msg = 'ok') {
  res.status(200).json({ sucesso: true, mensagem: msg, ...data })
}

async function getBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {}
    return req.body || {}
  }
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}) }
      catch (_) { resolve({}) }
    })
  })
}

function gerarToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const idx = c.indexOf('=')
      if (idx < 0) return [c.trim(), '']
      return [c.slice(0, idx).trim(), decodeURIComponent(c.slice(idx + 1).trim())]
    })
  )
}

function makeSessionCookie(token, del = false) {
  const expires = del
    ? new Date(0).toUTCString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
  const value = del ? '' : token
  return `lex_session=${value}; Path=/; HttpOnly; SameSite=Strict; Secure; Expires=${expires}`
}

async function getUsuarioAutenticado(req, res, sql) {
  if (!sql) sql = getDB()
  const token = req.headers['x-session-token']
    || parseCookies(req.headers.cookie || '').lex_session
    || null

  if (!token) {
    respondError(res, 'Não autenticado.', 401)
    return null
  }

  const rows = await sql`
    SELECT u.id, u.nome, u.sobrenome, u.email, u.plano, u.tema
    FROM sessoes s
    JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.id = ${token} AND s.expira_em > NOW() AND u.ativo = TRUE
  `

  if (!rows[0]) {
    respondError(res, 'Sessão inválida ou expirada.', 401)
    return null
  }
  return rows[0]
}

module.exports = {
  setCorsHeaders,
  respondError,
  respondOk,
  getBody,
  gerarToken,
  parseCookies,
  makeSessionCookie,
  getUsuarioAutenticado
}
