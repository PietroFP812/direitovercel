---
name: project-vercel-migration
description: Lex Studio foi migrado de PHP+SQLite local para Vercel+Neon PostgreSQL
metadata:
  type: project
---

Projeto lex-studio convertido de PHP+SQLite para Vercel (Node.js serverless + Neon PostgreSQL).

**Why:** usuário queria hospedar o site no Vercel para deploy fácil.

**How to apply:** Para próximas mudanças no backend, editar os arquivos `.js` em `api/` e `lib/`, não os `.php` (que ficam mas não são executados).

Mudanças feitas:
- `package.json` — dependências Node.js (`@neondatabase/serverless`, `bcryptjs`, `nodemailer`)
- `vercel.json` — config Vercel
- `.vercelignore` — exclui arquivos PHP do bundle
- `lib/db.js`, `lib/helpers.js`, `lib/procedures.js`, `lib/mailer.js` — equivalentes Node.js dos config PHP
- `api/auth/index.js`, `api/auth/oauth.js`, `api/ia/index.js`, `api/vade/index.js`, `api/progresso/index.js`, `api/simulados/index.js`, `api/anotacoes/index.js`, `api/areas/index.js`, `api/pagamento/index.js` — handlers Node.js
- `lex_studio_postgres.sql` — schema PostgreSQL (Neon)
- `app/*.html` — API_BASE de `/lex-studio/api` → `/api`
- `index.html` — OAuth URL de `oauth.php?action=init` → `oauth?action=init`

**Variáveis de ambiente necessárias no Vercel:**
- `DATABASE_URL` — Neon connection string
- `GEMINI_API_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `APP_URL` — URL do deployment (ex: https://lex-studio.vercel.app)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`
