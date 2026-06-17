<?php
// importar_cc.php — Importa o Código Civil completo do Planalto.gov.br
// Acesse: http://localhost/lex-studio/importar_cc.php
// Execute apenas UMA VEZ para popular o banco com os 2046 artigos.

$allowedIPs = ['127.0.0.1', '::1'];
$adminKey   = getenv('LEX_ADMIN_KEY') ?: 'lex-admin-2024';
$keyOk      = isset($_GET['key']) && $_GET['key'] === $adminKey;
if (!in_array($_SERVER['REMOTE_ADDR'], $allowedIPs) && !$keyOk) {
    http_response_code(403);
    exit('<p style="font-family:sans-serif;padding:20px">403 — Acesso restrito.</p>');
}

set_time_limit(300);
ini_set('memory_limit', '256M');
require_once __DIR__ . '/api/config/db.php';

header('Content-Type: text/html; charset=utf-8');

?><!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Importar Código Civil — Lex Studio</title>
<style>
  body  { background:#0d0d0d; color:#ccc; font-family:monospace; font-size:13px; padding:24px; line-height:1.6 }
  h2   { color:#c9a84c; border-bottom:1px solid #333; padding-bottom:8px }
  .ok  { color:#4caf50 } .err { color:#f44336 } .info { color:#29b6f6 }
  .hd  { color:#ffeb3b; font-weight:bold } .dim { color:#555 }
  pre  { margin:2px 0 }
</style>
</head>
<body>
<h2>📥 Importador — Código Civil Brasileiro (Lei 10.406/2002)</h2>
<?php

function out(string $msg, string $cls = ''): void {
    $tag = $cls ? "<pre class=\"$cls\">" : '<pre>';
    echo $tag . htmlspecialchars($msg) . "</pre>\n";
    flush();
    ob_flush();
}

$pdo = getDB();

// ── 1. Garante tabelas ────────────────────────────────────────────────────────
$pdo->exec("
    CREATE TABLE IF NOT EXISTS vade_partes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL, titulo TEXT NOT NULL, subtitulo TEXT, range_arts TEXT,
        ordem INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS vade_capitulos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parte_id INTEGER NOT NULL REFERENCES vade_partes(id) ON DELETE CASCADE,
        titulo TEXT NOT NULL, ordem INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS vade_artigos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        capitulo_id INTEGER NOT NULL REFERENCES vade_capitulos(id) ON DELETE CASCADE,
        numero TEXT NOT NULL, caput TEXT NOT NULL DEFAULT '', mais_cobrado INTEGER NOT NULL DEFAULT 0,
        nota TEXT, ordem INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS vade_paragrafos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artigo_id INTEGER NOT NULL REFERENCES vade_artigos(id) ON DELETE CASCADE,
        rotulo TEXT NOT NULL, texto TEXT NOT NULL, ordem INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS vade_incisos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artigo_id INTEGER NOT NULL REFERENCES vade_artigos(id) ON DELETE CASCADE,
        rotulo TEXT NOT NULL, texto TEXT NOT NULL, ordem INTEGER NOT NULL DEFAULT 0
    );
");
out('✅ Tabelas verificadas/criadas.', 'ok');

// ── 2. Limpa dados anteriores ─────────────────────────────────────────────────
$pdo->exec('DELETE FROM vade_partes');
out('🗑  Dados anteriores removidos.', 'info');

// ── 3. Download (ou leitura local) ───────────────────────────────────────────
// Se ?local=1 for passado, lê cc.htm da pasta raiz do projeto (baixado manualmente)
$localFile = __DIR__ . '/cc.htm';
if (isset($_GET['local']) && file_exists($localFile)) {
    $html    = file_get_contents($localFile);
    $usedUrl = $localFile;
    out(sprintf('📂 Lendo arquivo local: %s (%.1f KB)', $localFile, strlen($html) / 1024), 'ok');
    goto parse_html;
}

// Verifica se cURL está disponível
if (!function_exists('curl_init')) {
    out('❌ cURL não está habilitado no PHP. Habilite a extensão curl no php.ini do XAMPP.', 'err');
    echo '</body></html>';
    exit;
}

$urls = [
    'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
    'https://www.planalto.gov.br/ccivil_03/leis/2002/L10406compilada.htm',
    'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
    'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilado.htm',
    'https://www.planalto.gov.br/ccivil_03/_ato2002-2006/2002/lei/l10406compilado.htm',
];

$html = false;
$usedUrl = '';
foreach ($urls as $url) {
    out("⬇️  Tentando: $url", 'info');
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 5,
        CURLOPT_TIMEOUT        => 90,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_ENCODING       => '',
        CURLOPT_HTTPHEADER     => ['Accept-Language: pt-BR,pt;q=0.9', 'Accept: text/html,application/xhtml+xml'],
    ]);
    $result = curl_exec($ch);
    $code   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cerr   = curl_error($ch);
    $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    curl_close($ch);

    out("   HTTP $code — $cerr", $code >= 200 && $code < 300 ? 'ok' : 'err');

    if ($result && $code >= 200 && $code < 300 && strlen($result) > 50000) {
        $html    = $result;
        $usedUrl = $finalUrl;
        out(sprintf('✅ Download OK — %.1f KB de: %s', strlen($html) / 1024, $usedUrl), 'ok');
        break;
    }
}

if (!$html) {
    out('', '');
    out('❌ Não foi possível baixar o Código Civil de nenhuma URL.', 'err');
    out('   Verifique se o XAMPP tem acesso à internet (firewall/proxy).', 'err');
    out('   Tente abrir uma das URLs acima no navegador e salvar como "cc.htm"', 'err');
    out('   no diretório C:\xampp\htdocs\lex-studio\ e execute:', 'err');
    out('   http://localhost/lex-studio/importar_cc.php?local=1', 'err');
    echo '</body></html>';
    exit;
}

parse_html:
// ── 4. Normaliza encoding ─────────────────────────────────────────────────────
// Planalto pode enviar Windows-1252; detecta e converte
if (!mb_check_encoding($html, 'UTF-8')) {
    $html = mb_convert_encoding($html, 'UTF-8', 'Windows-1252');
}

// Converte superscript ordinal: <sup>o</sup> → º, <sup>a</sup> → ª
$html = preg_replace('/<sup[^>]*>\s*o\s*<\/sup>/i', 'º', $html);
$html = preg_replace('/<sup[^>]*>\s*a\s*<\/sup>/i', 'ª', $html);
$html = preg_replace('/<sup[^>]*>([^<]+)<\/sup>/i', '$1', $html);

// ── 5. Parse DOM ──────────────────────────────────────────────────────────────
libxml_use_internal_errors(true);
$dom = new DOMDocument('1.0', 'UTF-8');
$dom->loadHTML('<meta charset="UTF-8">' . $html, LIBXML_NOERROR | LIBXML_NOWARNING);
libxml_clear_errors();
$xp = new DOMXPath($dom);

// Tenta localizar a área principal de conteúdo
$root = null;
foreach (['//td[@class="textoNorma"]', '//div[@id="corpo"]', '//div[@class="corpo"]'] as $q) {
    $r = $xp->query($q);
    if ($r && $r->length > 0) { $root = $r->item(0); break; }
}

$nodes = $root ? $xp->query('.//p', $root) : $xp->query('//p');
out('Parágrafos encontrados: ' . $nodes->length, 'info');

// ── 6. Extrai texto de cada <p> ───────────────────────────────────────────────
$lines = [];
foreach ($nodes as $node) {
    $t = trim(preg_replace('/\s+/', ' ', $node->textContent));
    if ($t !== '' && strlen($t) < 5000) {
        $lines[] = $t;
    }
}
out('Linhas não-vazias: ' . count($lines), 'info');

// ── 7. Classifica cada linha ──────────────────────────────────────────────────
// Tipos: LIVRO | TITULO | CAP | SEC | ART | PAR | INC | ALI | TXT
$els = [];
foreach ($lines as $line) {
    $t = $line;

    if (preg_match('/^LIVRO\s+[IVXLC]+/u', $t)) {
        $els[] = ['tipo' => 'LIVRO', 'valor' => $t]; continue;
    }
    if (preg_match('/^T[IÍ]TULO\s+[IVXLC]+/u', $t)) {
        $els[] = ['tipo' => 'TITULO', 'valor' => $t]; continue;
    }
    if (preg_match('/^CAP[IÍ]TULO\s+[IVXLC]+/u', $t)) {
        $els[] = ['tipo' => 'CAP', 'valor' => $t]; continue;
    }
    if (preg_match('/^SE[ÇC][ÃA]O\s+[IVXLC]+/u', $t)) {
        $els[] = ['tipo' => 'SEC', 'valor' => $t]; continue;
    }
    if (preg_match('/^Art\.\s*\d+[º°oa]?/u', $t)) {
        $els[] = ['tipo' => 'ART', 'valor' => $t]; continue;
    }
    if (preg_match('/^(Parágrafo único\.|§\s*\d+[º°]?)\s+/u', $t)) {
        $els[] = ['tipo' => 'PAR', 'valor' => $t]; continue;
    }
    if (preg_match('/^[IVXLC]+\s*[–\-]\s*/u', $t) && strlen($t) < 600) {
        $els[] = ['tipo' => 'INC', 'valor' => $t]; continue;
    }
    if (preg_match('/^[a-z]\)\s+/u', $t)) {
        $els[] = ['tipo' => 'ALI', 'valor' => $t]; continue;
    }
    $els[] = ['tipo' => 'TXT', 'valor' => $t];
}
out('Elementos classificados: ' . count($els), 'info');

// ── 8. Insere no banco ────────────────────────────────────────────────────────
$stmParte = $pdo->prepare('INSERT INTO vade_partes (codigo, titulo, subtitulo, range_arts, ordem) VALUES (?,?,?,?,?)');
$stmCap   = $pdo->prepare('INSERT INTO vade_capitulos (parte_id, titulo, ordem) VALUES (?,?,?)');
$stmArt   = $pdo->prepare('INSERT INTO vade_artigos (capitulo_id, numero, caput, mais_cobrado, ordem) VALUES (?,?,?,0,?)');
$stmPar   = $pdo->prepare('INSERT INTO vade_paragrafos (artigo_id, rotulo, texto, ordem) VALUES (?,?,?,?)');
$stmInc   = $pdo->prepare('INSERT INTO vade_incisos (artigo_id, rotulo, texto, ordem) VALUES (?,?,?,?)');

$parteId  = null;
$capId    = null;
$artId    = null;
$parteOrd = 0;
$capOrd   = 0;
$artOrd   = 0;
$parOrd   = 0;
$incOrd   = 0;
$totalArts = 0;

// Helper: subtítulo vem no TXT imediatamente após o heading
function nextTxt(array &$els, int $i): string {
    if (isset($els[$i + 1]) && $els[$i + 1]['tipo'] === 'TXT') {
        return $els[$i + 1]['valor'];
    }
    return '';
}

function normalizeNum(string $s): string {
    $s = preg_replace('/(\d)o\b/', '$1º', $s);
    $s = preg_replace('/(\d)a\b/', '$1ª', $s);
    return $s;
}

$pdo->beginTransaction();

foreach ($els as $i => $el) {
    $tipo  = $el['tipo'];
    $valor = $el['valor'];

    switch ($tipo) {

        case 'LIVRO':
            $sub     = nextTxt($els, $i);
            $titulo  = $valor . ($sub ? ' — ' . $sub : '');
            $codigo  = 'l' . (++$parteOrd);
            $stmParte->execute([$codigo, $titulo, $sub ?: null, null, $parteOrd]);
            $parteId = (int)$pdo->lastInsertId();
            $capId   = null;
            $capOrd  = 0;
            out("  📗 $titulo", 'hd');
            break;

        case 'CAP':
            if (!$parteId) break;
            $sub    = nextTxt($els, $i);
            $titulo = $valor . ($sub ? ' — ' . $sub : '');
            $stmCap->execute([$parteId, $titulo, ++$capOrd]);
            $capId  = (int)$pdo->lastInsertId();
            $artOrd = 0;
            break;

        case 'SEC':
            if (!$parteId) break;
            $sub    = nextTxt($els, $i);
            $titulo = $valor . ($sub ? ' — ' . $sub : '');
            // Seção vira subcapítulo
            $stmCap->execute([$parteId, $titulo, ++$capOrd]);
            $capId  = (int)$pdo->lastInsertId();
            $artOrd = 0;
            break;

        case 'ART':
            if (!$parteId) break;
            if (!$capId) {
                // Artigo sem capítulo: cria um genérico
                $stmCap->execute([$parteId, 'Disposições Gerais', ++$capOrd]);
                $capId  = (int)$pdo->lastInsertId();
                $artOrd = 0;
            }
            if (preg_match('/^(Art\.\s*\d+[º°oa]?)\s*(.*)/su', $valor, $m)) {
                $numero = normalizeNum(trim($m[1]));
                $caput  = trim($m[2]);
                $stmArt->execute([$capId, $numero, $caput, ++$artOrd]);
                $artId = (int)$pdo->lastInsertId();
                $parOrd = 0;
                $incOrd = 0;
                $totalArts++;
            }
            break;

        case 'PAR':
            if (!$artId) break;
            if (preg_match('/^(Parágrafo único\.)\s*(.*)/su', $valor, $m)) {
                $rotulo = $m[1];
                $texto  = trim($m[2]);
            } elseif (preg_match('/^(§\s*\d+[º°oa]?)\s*(.*)/su', $valor, $m)) {
                $rotulo = normalizeNum(trim($m[1]));
                $texto  = trim($m[2]);
            } else {
                break;
            }
            $stmPar->execute([$artId, $rotulo, $texto, ++$parOrd]);
            $incOrd = 0;
            break;

        case 'INC':
            if (!$artId) break;
            if (preg_match('/^([IVXLC]+)\s*[–\-]\s*(.*)/su', $valor, $m)) {
                $stmInc->execute([$artId, trim($m[1]), trim($m[2]), ++$incOrd]);
            }
            break;

        // TITULO, ALI, TXT — ignorados como itens principais (usados apenas como look-ahead)
    }
}

$pdo->commit();

// ── 9. Marca artigos mais cobrados ────────────────────────────────────────────
$hotNums = [
    '1','2','3','4','5','7','11','12','13','14','20','21','22','50',
    '70','75','79','82','92','98','99','104','107','112','113','121',
    '138','145','151','156','157','166','167','171','178','186','187',
    '188','189','197','202','205','206','207','233','234','247','257',
    '264','265','275','283','317','389','393','394','395','396','397',
    '401','402','403','404','408','412','418','421','422','472','473',
    '475','476','478','480','481','490','491','492','593','594','596',
    '597','598','600','618','619','620','622','625','625','626','630',
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
];

$hotPlaceholders = implode(',', array_fill(0, count($hotNums), '?'));
$hotParams = array_map(fn($n) => 'Art. ' . $n . 'º', $hotNums);
// Também tenta sem º (por inconsistências do parser)
$hotParamsAlt = array_map(fn($n) => 'Art. ' . $n, $hotNums);
$allHot = array_merge($hotParams, $hotParamsAlt);
$pl = implode(',', array_fill(0, count($allHot), '?'));
$pdo->prepare("UPDATE vade_artigos SET mais_cobrado=1 WHERE numero IN ($pl)")->execute($allHot);

$hotCount = (int)$pdo->query("SELECT COUNT(*) FROM vade_artigos WHERE mais_cobrado=1")->fetchColumn();

// ── 10. Sumário final ─────────────────────────────────────────────────────────
out('', '');
out('════════════════════════════════════════', 'ok');
out('✅  IMPORTAÇÃO CONCLUÍDA!', 'ok');
out("    Artigos totais : $totalArts", 'ok');
out("    Mais cobrados  : $hotCount", 'ok');
out('════════════════════════════════════════', 'ok');
out('', '');

$partes = $pdo->query('SELECT vp.id, vp.titulo, COUNT(DISTINCT vc.id) AS ncap, COUNT(va.id) AS nart
    FROM vade_partes vp
    LEFT JOIN vade_capitulos vc ON vc.parte_id = vp.id
    LEFT JOIN vade_artigos va ON va.capitulo_id = vc.id
    GROUP BY vp.id ORDER BY vp.ordem')->fetchAll();

out('Livros importados:', 'info');
foreach ($partes as $p) {
    out("  [{$p['id']}] {$p['titulo']} — {$p['ncap']} cap, {$p['nart']} arts", 'info');
}

out('', '');
out('Agora acesse: http://localhost/lex-studio/app/vade.html', 'hd');

echo '</body></html>';
