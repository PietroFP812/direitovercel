'use strict'
// seed/gerar_questoes_ia.js — Gera questões de simulado com IA (Gemini), no estilo
// de provas de concurso e da OAB, usando o texto real do Código Civil (já importado
// no banco) como base para reduzir erro de citação de artigo.
//
// Este script NÃO mexe em vade_partes/vade_capitulos/vade_artigos (Código Civil) —
// só lê essas tabelas para embasar as questões. Não insere nada no banco: escreve um
// arquivo de revisão em seed/questoes_ia/ pra você conferir antes de mesclar em
// seed/questoes.js.
//
// Uso:
//   $env:GEMINI_API_KEY="..."
//   $env:DATABASE_URL="postgresql://..."   # opcional, só pra embasar com o texto real do CC
//   node seed/gerar_questoes_ia.js --area 3 --quantidade 10

const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('❌  GEMINI_API_KEY não definida.')
  console.error('    PowerShell: $env:GEMINI_API_KEY="..." ; node seed/gerar_questoes_ia.js --area 1 --quantidade 10')
  process.exit(1)
}

const GEMINI_MODEL = 'gemini-2.0-flash'

// ── Áreas (mesmos ids/títulos de lex_studio_postgres.sql) ────────────────────
// range: [artigo_inicial, artigo_final] no Código Civil, quando a área é coberta
// pelo CC. Áreas como Consumidor e DIP não estão no CC (são leis próprias), então
// ficam sem embasamento automático — a IA usa conhecimento geral e a revisão
// humana precisa ser mais cuidadosa nessas.
const AREAS = {
  1:  { titulo: 'Parte Geral — Pessoas e Bens',        range: [1, 103] },
  2:  { titulo: 'Obrigações',                          range: [233, 420] },
  3:  { titulo: 'Contratos',                           range: [421, 853] },
  4:  { titulo: 'Responsabilidade Civil',              range: [927, 965] },
  5:  { titulo: 'Direito das Coisas',                  range: [1196, 1510] },
  6:  { titulo: 'Direito de Família',                  range: [1511, 1783] },
  7:  { titulo: 'Direito das Sucessões',                range: [1784, 2027] },
  8:  { titulo: 'Direito Empresarial',                 range: [966, 1195] },
  9:  { titulo: 'Direito do Consumidor',               range: null },
  10: { titulo: 'Direito Internacional Privado',       range: null },
  11: { titulo: 'Fatos e Negócios Jurídicos',           range: [104, 232] },
  12: { titulo: 'Prescrição e Decadência',              range: [189, 211] },
}

function parseArgs() {
  const argv = process.argv.slice(2)
  const get = (flag, def) => {
    const i = argv.indexOf(flag)
    return i === -1 ? def : argv[i + 1]
  }
  return {
    area: parseInt(get('--area', '0')),
    quantidade: Math.min(parseInt(get('--quantidade', '10')), 30),
  }
}

// ── Busca o texto real dos artigos da área (grounding) ────────────────────────
async function buscarArtigosReais(range) {
  if (!range || !process.env.DATABASE_URL) return { texto: '', numeros: new Set() }

  const sql = neon(process.env.DATABASE_URL)
  const [ini, fim] = range
  const artigos = await sql`
    SELECT numero, caput FROM vade_artigos
    WHERE regexp_replace(numero, '[^0-9]', '', 'g') != ''
      AND regexp_replace(numero, '[^0-9]', '', 'g')::int BETWEEN ${ini} AND ${fim}
    ORDER BY id
    LIMIT 120
  `
  const numeros = new Set(artigos.map(a => a.numero.replace(/[º°]/g, '').trim()))
  const texto = artigos.map(a => `${a.numero} ${a.caput}`).join('\n')
  return { texto, numeros }
}

// ── Pega enunciados já existentes na área, pra IA não repetir ─────────────────
function enunciadosExistentes(area_id) {
  const questoesPath = path.join(__dirname, 'questoes.js')
  const src = fs.readFileSync(questoesPath, 'utf8')
  const bancoMatch = src.match(/const banco = \[([\s\S]*)\]\s*\n\s*async function main/)
  if (!bancoMatch) return []
  const linhas = bancoMatch[1].match(/^\[(\d+),'((?:[^'\\]|\\.)*)'/gm) || []
  return linhas
    .map(l => l.match(/^\[(\d+),'((?:[^'\\]|\\.)*)'/))
    .filter(m => m && parseInt(m[1]) === area_id)
    .map(m => m[2])
}

// ── Prompt ─────────────────────────────────────────────────────────────────────
function montarPrompt({ area, quantidade, textoArtigos, existentes }) {
  const base = `Você é um professor de Direito Civil especializado em bancas de concurso público e no Exame de Ordem (OAB). Gere ${quantidade} questões de múltipla escolha (4 alternativas, A a D, exatamente 1 correta) sobre "${area.titulo}", no ESTILO REAL das provas da FGV (OAB), CESPE/Cebraspe, FCC e Vunesp: enunciados objetivos, muitas vezes com um caso concreto curto, alternativas plausíveis e parecidas entre si (sem "isca" óbvia), e a alternativa correta variando entre A, B, C e D (não sempre a mesma letra).

Cada questão precisa de uma "explicacao" bem elaborada: cite o artigo exato do Código Civil que resolve a questão, explique o raciocínio jurídico e, quando fizer sentido, diferencie da alternativa mais parecida (o "distrator" mais forte).

Varie a dificuldade entre "facil", "medio" e "dificil".

REGRA CRÍTICA: só cite números de artigo que você tenha certeza que existem no Código Civil brasileiro (Lei 10.406/2002). Se não tiver certeza absoluta do número exato, não cite um número — descreva o instituto sem o número do artigo. Nunca invente um número de artigo.`

  const grounding = textoArtigos
    ? `\n\nTexto real dos artigos do Código Civil desta área (use como base, cite os números exatamente como aparecem aqui):\n"""\n${textoArtigos}\n"""`
    : `\n\nEsta área não corresponde a artigos do Código Civil (é lei especial). Use seu conhecimento geral da legislação pertinente, mas seja conservador ao citar número de artigo/lei.`

  const evitar = existentes.length
    ? `\n\nNÃO repita (nem parafraseie de forma óbvia) estes enunciados já existentes:\n${existentes.map(e => '- ' + e).join('\n')}`
    : ''

  return base + grounding + evitar
}

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      enunciado: { type: 'STRING' },
      explicacao: { type: 'STRING' },
      dificuldade: { type: 'STRING', enum: ['facil', 'medio', 'dificil'] },
      alternativas: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            letra: { type: 'STRING', enum: ['A', 'B', 'C', 'D'] },
            texto: { type: 'STRING' },
            correta: { type: 'BOOLEAN' },
          },
          required: ['letra', 'texto', 'correta'],
        },
      },
    },
    required: ['enunciado', 'explicacao', 'dificuldade', 'alternativas'],
  },
}

async function chamarGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 8000,
      temperature: 0.8,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(120000),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`)
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
  return JSON.parse(text)
}

// ── Validação + checagem de citação de artigo ─────────────────────────────────
function validar(questoes, numerosReais) {
  const avisos = []
  const validas = []

  for (const q of questoes) {
    const corretas = (q.alternativas || []).filter(a => a.correta)
    if (corretas.length !== 1 || q.alternativas.length !== 4) {
      avisos.push(`⚠️  Descartada (formato inválido): "${(q.enunciado || '').slice(0, 60)}..."`)
      continue
    }

    if (numerosReais && numerosReais.size > 0) {
      const citados = [...(q.explicacao || '').matchAll(/Art(?:igo|\.)?\s*(\d+)/gi)].map(m => m[1])
      const desconhecidos = citados.filter(n => ![...numerosReais].some(real => real.includes(n)))
      if (desconhecidos.length) {
        avisos.push(`⚠️  REVISAR — cita art. ${desconhecidos.join(', ')} que não achei no trecho fornecido: "${q.enunciado.slice(0, 60)}..."`)
      }
    }

    validas.push(q)
  }
  return { validas, avisos }
}

// ── Formata no formato do banco de seed/questoes.js ──────────────────────────
function paraFormatoBanco(area_id, questoes) {
  const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  return questoes.map(q => {
    const altsLiteral = '[' + q.alternativas.map(a =>
      `['${a.letra}','${esc(a.texto)}',${a.correta ? 'true' : 'false'}]`
    ).join(',') + ']'
    return `[${area_id},'${esc(q.enunciado)}',\n '${esc(q.explicacao)}','${q.dificuldade}',\n ${altsLiteral}],`
  }).join('\n\n')
}

async function main() {
  const { area, quantidade } = parseArgs()
  if (!area || !AREAS[area]) {
    console.error('❌  Use --area <1-12>. Áreas disponíveis:')
    for (const [id, a] of Object.entries(AREAS)) console.error(`    ${id}: ${a.titulo}`)
    process.exitCode = 1
    return
  }

  const areaInfo = AREAS[area]
  console.log(`📚  Área ${area}: ${areaInfo.titulo}`)
  console.log(`🔎  Buscando texto real do CC para embasar (grounding)...`)
  const { texto, numeros } = await buscarArtigosReais(areaInfo.range)
  console.log(texto ? `    ${numeros.size} artigos encontrados como base.` : '    Sem embasamento do CC (área de lei especial ou DATABASE_URL não definida).')

  const existentes = enunciadosExistentes(area)
  console.log(`    ${existentes.length} questões já existentes nesta área (evitando repetição).`)

  const prompt = montarPrompt({ area: areaInfo, quantidade, textoArtigos: texto, existentes })

  console.log(`🤖  Gerando ${quantidade} questões com Gemini...`)
  const geradas = await chamarGemini(prompt)

  const { validas, avisos } = validar(geradas, numeros)
  console.log(`✅  ${validas.length}/${geradas.length} questões passaram na validação de formato.`)
  if (avisos.length) {
    console.log('\n--- AVISOS PARA REVISÃO MANUAL ---')
    avisos.forEach(a => console.log(a))
  }

  const outDir = path.join(__dirname, 'questoes_ia')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, `area_${area}_${Date.now()}.js`)
  const header = `// Gerado por IA em ${new Date().toISOString()} — área ${area} (${areaInfo.titulo})\n` +
    `// REVISAR antes de colar no array "banco" de seed/questoes.js.\n` +
    (avisos.length ? `// ${avisos.length} aviso(s) de citação de artigo — ver console acima.\n` : '') +
    `\n`
  fs.writeFileSync(outFile, header + paraFormatoBanco(area, validas) + '\n')

  console.log(`\n💾  Salvo em: ${outFile}`)
  console.log('   Revise o conteúdo e as citações de artigo antes de colar em seed/questoes.js.')
}

main().catch(err => { console.error('❌', err.message); process.exitCode = 1 })
