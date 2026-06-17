'use strict'
const nodemailer = require('nodemailer')

function getTransport() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''
  if (!user || !pass || user === 'seu@gmail.com') return null
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
}

async function emailReset(toEmail, toName, link) {
  const transport = getTransport()
  if (!transport) return false

  const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@lexstudio.com'
  const fromName  = process.env.SMTP_FROM_NAME  || 'Lex Studio'

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Lex Studio</title></head>
<body style="margin:0;padding:0;background:#0b0c0f;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
  <table width="560" cellpadding="0" cellspacing="0"
         style="background:#111318;border-radius:12px;overflow:hidden;border:1px solid #262b36">
    <tr><td style="padding:28px 40px;border-bottom:1px solid #1a1f2a;text-align:center">
      <span style="font-size:22px;font-weight:900;color:#c9a84c;letter-spacing:-0.5px">⚖️ Lex Studio</span>
    </td></tr>
    <tr><td style="padding:40px 40px 32px">
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#eeebe2">Recuperar sua senha</h1>
      <p style="margin:0 0 16px;color:#8e8b82;font-size:15px;line-height:1.6">
        Olá, <strong style="color:#eeebe2">${toName}</strong>!<br>
        Recebemos uma solicitação para redefinir a senha da sua conta.
      </p>
      <p style="margin:0 0 28px;color:#8e8b82;font-size:15px;line-height:1.6">
        Este link é válido por <strong style="color:#c9a84c">1 hora</strong>.
      </p>
      <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
        <a href="${link}"
           style="display:inline-block;padding:14px 32px;background:#c9a84c;color:#0b0c0f;
                  font-size:15px;font-weight:700;text-decoration:none;border-radius:8px">
          Redefinir senha →
        </a>
      </td></tr></table>
      <p style="margin:28px 0 0;font-size:13px;color:#4a4844;line-height:1.6">
        Se você não solicitou isso, ignore este e-mail. Nenhuma alteração será feita.
      </p>
    </td></tr>
    <tr><td style="padding:20px 40px;background:#0d0f14;text-align:center">
      <p style="margin:0;font-size:12px;color:#4a4844">© 2026 Lex Studio · Plataforma de Estudos Jurídicos</p>
    </td></tr>
  </table>
</td></tr></table>
</body>
</html>`

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: `"${toName}" <${toEmail}>`,
      subject: 'Recuperação de Senha — Lex Studio',
      html
    })
    return true
  } catch (e) {
    console.error('[Lex Email]', e.message)
    return false
  }
}

module.exports = { emailReset }
