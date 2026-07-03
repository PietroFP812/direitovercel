'use strict'
// seed/importar_cc.js — Importa o Código Civil do Planalto.gov.br para o Neon
//
// Uso:
//   $env:DATABASE_URL="postgresql://..."  # PowerShell
//   node seed/importar_cc.js
//
// Para usar arquivo local (caso o Planalto esteja fora):
//   node seed/importar_cc.js --local cc.htm

const { neon } = require('@neondatabase/serverless')
const https = require('https')
const http  = require('http')
const fs    = require('fs')
const path  = require('path')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL não definida.')
  console.error('    PowerShell: $env:DATABASE_URL="postgresql://..." ; node seed/importar_cc.js')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

// ── Download ──────────────────────────────────────────────────────────────────
function download(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
        const next = new URL(res.headers.location, url).toString()
        console.log(`   → redirect: ${next}`)
        resolve(download(next, redirects - 1))
        return
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }))
    })
    req.on('error', reject)
    req.setTimeout(90000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

// ── HTML helpers ──────────────────────────────────────────────────────────────
function stripTags(html) {
  return html
    .replace(/<sup[^>]*>\s*o\s*<\/sup>/gi, 'º')
    .replace(/<sup[^>]*>\s*a\s*<\/sup>/gi, 'ª')
    .replace(/<sup[^>]*>([^<]+)<\/sup>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function extractParagraphs(html) {
  // Tenta isolar o conteúdo principal
  const tdMatch = html.match(/<td[^>]*class="textoNorma"[^>]*>([\s\S]*?)<\/td>/i)
  const content = tdMatch ? tdMatch[1] : html

  const results = []
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let m
  while ((m = pRegex.exec(content)) !== null) {
    const t = stripTags(m[1])
    if (t && t.length < 5000) results.push(t)
  }
  return results
}

// ── Classificador (igual à lógica PHP) ───────────────────────────────────────
function classify(lines) {
  return lines.map(valor => {
    if (/^LIVRO\s+[IVXLC]+/u.test(valor))         return { tipo: 'LIVRO', valor }
    if (/^T[IÍ]TULO\s+[IVXLC]+/u.test(valor))     return { tipo: 'TITULO', valor }
    if (/^CAP[IÍ]TULO\s+[IVXLC]+/u.test(valor))   return { tipo: 'CAP', valor }
    if (/^SE[ÇC][ÃA]O\s+[IVXLC]+/u.test(valor))   return { tipo: 'SEC', valor }
    if (/^Art\.\s*\d+[º°oa]?/u.test(valor))        return { tipo: 'ART', valor }
    if (/^(Parágrafo único\.|§\s*\d+[º°]?)\s+/u.test(valor)) return { tipo: 'PAR', valor }
    if (/^[IVXLC]+\s*[–\-]\s*/u.test(valor) && valor.length < 600) return { tipo: 'INC', valor }
    if (/^[a-z]\)\s+/u.test(valor))                return { tipo: 'ALI', valor }
    return { tipo: 'TXT', valor }
  })
}

function normalizeNum(s) {
  return s.replace(/(\d)o\b/, '$1º').replace(/(\d)a\b/, '$1ª')
}

function nextTxt(els, i) {
  return (els[i + 1] && els[i + 1].tipo === 'TXT') ? els[i + 1].valor : ''
}

// ── Artigos mais cobrados ─────────────────────────────────────────────────────
const HOT = new Set([
  '1','2','3','4','5','7','11','12','13','14','20','21','22','50',
  '70','75','79','82','92','98','99','104','107','112','113','121',
  '138','145','151','156','157','166','167','171','178','186','187',
  '188','189','197','202','205','206','207','233','234','247','257',
  '264','265','275','283','317','389','393','394','395','396','397',
  '401','402','403','404','408','412','418','421','422','472','473',
  '475','476','478','480','481','490','491','492','593','594','596',
  '597','598','600','618','619','620','622','625','626','630',
  '638','721','722','726','729','736','749','757','762','765','772',
  '793','797','798','818','819','820','821','844','845','846','878',
  '879','880','884','932','933','936','937','938','941','942','943',
  '944','945','946','947','948','949','950','951','952','953','954',
  '955','957','966','981','985','986','990','1003','1005','1016',
  '1017','1042','1052','1053','1054','1055','1060','1066','1067',
  '1078','1086','1088','1094','1102','1103','1110','1116','1118',
  '1121','1128','1142','1147','1148','1150','1153','1154','1155',
  '1156','1165','1166','1171','1179','1182','1196','1197','1200',
  '1201','1203','1204','1208','1210','1223','1225','1228','1231',
  '1238','1239','1240','1241','1242','1243','1244','1245','1247',
  '1248','1255','1258','1260','1276','1277','1278','1288','1291',
  '1300','1314','1320','1333','1334','1336','1337','1338','1341',
  '1345','1351','1352','1357','1361','1368','1379','1385','1391',
  '1394','1416','1419','1421','1422','1428','1437','1451','1458',
  '1511','1513','1514','1517','1520','1521','1523','1525','1528',
  '1566','1571','1576','1577','1580','1583','1584','1585','1586',
  '1588','1591','1593','1596','1597','1598','1599','1601','1603',
  '1609','1610','1614','1616','1630','1632','1633','1634','1635',
  '1636','1641','1647','1649','1657','1660','1667','1668','1672',
  '1676','1694','1695','1696','1700','1707','1710','1714','1716',
  '1784','1786','1787','1788','1789','1790','1791','1792','1793',
  '1794','1795','1796','1799','1800','1801','1802','1803','1804',
  '1805','1806','1807','1808','1809','1810','1812','1813','1814',
  '1816','1818','1819','1820','1823','1824','1825','1826','1827',
  '1828','1830','1831','1832','1833','1834','1835','1836','1837',
  '1838','1839','1840','1841','1842','1845','1846','1847','1848',
  '1849','1850','1857','1858','1860','1862','1863','1864','1865',
  '1866','1867','1868','1873','1874','1875','1878','1882','1883',
  '1884','1887','1890','1891','1893','1894','1897','1898','1900',
  '1909','1910','1911','1912','1913','1916','1917','1918','1919',
  '1920','1921','1923','1925','1928','1929','1930','1932','1933',
  '1934','1935','1936','1937','1938','1941','1944','1945','1946',
  '1947','1948','1949','1952','1953','1958','1960','1961','1963',
  '1964','1966','1967','1968','1973','1975','1976','1982','1986',
  '1987','1989','1990','1991','2003','2004','2005','2006','2007',
  '2008','2009','2012','2013','2014','2015','2017','2018','2019',
  '2020','2021','2022','2023','2024','2025','2026','2027',
])

function isMaisCobrado(numero) {
  const m = numero.match(/Art\.\s*(\d+)/)
  return m ? HOT.has(m[1]) : false
}

// ── Inserção no banco ─────────────────────────────────────────────────────────
async function inserir(els) {
  let parteId  = null
  let capId    = null
  let artId    = null
  let parteOrd = 0
  let capOrd   = 0
  let artOrd   = 0
  let parOrd   = 0
  let incOrd   = 0
  let totalArts = 0

  for (let i = 0; i < els.length; i++) {
    const { tipo, valor } = els[i]

    if (tipo === 'LIVRO') {
      const sub    = nextTxt(els, i)
      const titulo = valor + (sub ? ' — ' + sub : '')
      const codigo = 'l' + (++parteOrd)
      const [{ id }] = await sql`
        INSERT INTO vade_partes (codigo, titulo, subtitulo, range_arts, ordem)
        VALUES (${codigo}, ${titulo}, ${sub || null}, ${null}, ${parteOrd})
        RETURNING id
      `
      parteId = id; capId = null; capOrd = 0
      console.log(`  📗 ${titulo}`)
      continue
    }

    if (tipo === 'CAP' || tipo === 'SEC') {
      if (!parteId) continue
      const sub    = nextTxt(els, i)
      const titulo = valor + (sub ? ' — ' + sub : '')
      const [{ id }] = await sql`
        INSERT INTO vade_capitulos (parte_id, titulo, ordem)
        VALUES (${parteId}, ${titulo}, ${++capOrd})
        RETURNING id
      `
      capId = id; artOrd = 0
      continue
    }

    if (tipo === 'ART') {
      if (!parteId) continue
      if (!capId) {
        const [{ id }] = await sql`
          INSERT INTO vade_capitulos (parte_id, titulo, ordem)
          VALUES (${parteId}, ${'Disposições Gerais'}, ${++capOrd})
          RETURNING id
        `
        capId = id; artOrd = 0
      }
      const m = valor.match(/^(Art\.\s*\d+[º°oa]?)\s*([\s\S]*)/u)
      if (m) {
        const numero = normalizeNum(m[1].trim())
        const caput  = m[2].trim()
        const [{ id }] = await sql`
          INSERT INTO vade_artigos (capitulo_id, numero, caput, mais_cobrado, ordem)
          VALUES (${capId}, ${numero}, ${caput}, ${isMaisCobrado(numero)}, ${++artOrd})
          RETURNING id
        `
        artId = id; parOrd = 0; incOrd = 0; totalArts++
      }
      continue
    }

    if (tipo === 'PAR') {
      if (!artId) continue
      let rotulo, texto
      const pu = valor.match(/^(Parágrafo único\.)\s*([\s\S]*)/u)
      const ps = valor.match(/^(§\s*\d+[º°oa]?)\s*([\s\S]*)/u)
      if (pu)      { rotulo = pu[1]; texto = pu[2].trim() }
      else if (ps) { rotulo = normalizeNum(ps[1].trim()); texto = ps[2].trim() }
      else continue
      await sql`
        INSERT INTO vade_paragrafos (artigo_id, rotulo, texto, ordem)
        VALUES (${artId}, ${rotulo}, ${texto}, ${++parOrd})
      `
      incOrd = 0
      continue
    }

    if (tipo === 'INC') {
      if (!artId) continue
      const m = valor.match(/^([IVXLC]+)\s*[–\-]\s*([\s\S]*)/u)
      if (m) {
        await sql`
          INSERT INTO vade_incisos (artigo_id, rotulo, texto, ordem)
          VALUES (${artId}, ${m[1].trim()}, ${m[2].trim()}, ${++incOrd})
        `
      }
      continue
    }
    // TITULO, ALI, TXT — ignorados como itens principais
  }

  return totalArts
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const localFlag = process.argv.indexOf('--local')
  let html

  if (localFlag !== -1) {
    const localFile = process.argv[localFlag + 1] || 'cc.htm'
    const filePath  = path.resolve(localFile)
    if (!fs.existsSync(filePath)) {
      console.error(`❌  Arquivo não encontrado: ${filePath}`)
      process.exit(1)
    }
    html = fs.readFileSync(filePath, 'latin1')
    console.log(`📂  Lendo arquivo local: ${filePath}`)
  } else {
    const urls = [
      'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
      'https://www.planalto.gov.br/ccivil_03/leis/2002/L10406compilada.htm',
      'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
      'https://www.planalto.gov.br/ccivil_03/_ato2002-2006/2002/lei/l10406compilado.htm',
    ]
    html = null
    for (const url of urls) {
      process.stdout.write(`⬇️   Tentando: ${url} ... `)
      try {
        const { status, body } = await download(url)
        if (status >= 200 && status < 300 && body.length > 50000) {
          html = body.toString('latin1')
          console.log(`OK (${Math.round(body.length / 1024)} KB)`)
          break
        }
        console.log(`HTTP ${status}`)
      } catch (e) {
        console.log(`ERRO: ${e.message}`)
      }
    }

    if (!html) {
      console.error('\n❌  Não foi possível baixar o Código Civil.')
      console.error('    Baixe manualmente e execute:')
      console.error('    node seed/importar_cc.js --local cc.htm')
      process.exit(1)
    }
  }

  console.log('🔍  Extraindo parágrafos...')
  const lines = extractParagraphs(html)
  console.log(`    ${lines.length} parágrafos encontrados`)

  const els = classify(lines)
  console.log(`    ${els.length} elementos classificados`)

  console.log('🗑  Removendo dados anteriores...')
  await sql`DELETE FROM vade_partes`

  console.log('💾  Inserindo no banco...')
  const total = await inserir(els)

  // Marca mais cobrados (UPDATE extra como fallback)
  await sql`
    UPDATE vade_artigos SET mais_cobrado = TRUE
    WHERE numero ~ '^Art\. [0-9]+'
      AND regexp_replace(numero, '^Art\. ([0-9]+).*', '\1') = ANY(${[...HOT]})
  `

  const [{ cnt }] = await sql`SELECT COUNT(*) AS cnt FROM vade_artigos`
  const [{ hot }] = await sql`SELECT COUNT(*) AS hot FROM vade_artigos WHERE mais_cobrado = TRUE`
  const [{ partes }] = await sql`SELECT COUNT(*) AS partes FROM vade_partes`

  console.log('\n✅  IMPORTAÇÃO CONCLUÍDA!')
  console.log(`    Livros   : ${partes}`)
  console.log(`    Artigos  : ${cnt}`)
  console.log(`    Mais cob.: ${hot}`)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
