'use strict'
const { setCorsHeaders, respondOk, respondError, getBody, getUsuarioAutenticado } = require('../../lib/helpers')
const { getDB } = require('../../lib/db')

const GEMINI_MODEL = 'gemini-2.0-flash'

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return respondError(res, 'Método não permitido.', 405)

  const sql = getDB()
  const user = await getUsuarioAutenticado(req, res, sql)
  if (!user) return

  const body = await getBody(req)
  const messages = body.messages || []
  const system = body.system || ''
  const max_tokens = Math.min(parseInt(body.max_tokens || '1000'), 2000)

  if (!messages.length) return respondError(res, 'messages é obrigatório.')

  // Converte formato Anthropic → Gemini
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: Array.isArray(msg.content) ? msg.content.map(c => c.text).join(' ') : String(msg.content || '') }]
  }))

  const payload = {
    contents,
    generationConfig: { maxOutputTokens: max_tokens, temperature: 0.7 }
  }
  if (system) payload.systemInstruction = { parts: [{ text: system }] }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

  let data, httpCode
  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY || ''
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000)
    })
    httpCode = geminiRes.status
    data = await geminiRes.json()
  } catch (e) {
    return respondError(res, 'Erro ao conectar com a IA. Tente novamente.', 502)
  }

  if (httpCode !== 200) {
    return respondError(res, data?.error?.message || 'Erro na IA.', httpCode)
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return respondOk(res, { content: [{ type: 'text', text }] })
}
