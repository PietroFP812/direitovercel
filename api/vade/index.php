<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── GET /api/vade/ — Estrutura completa ─────────────────────────────────────
if ($method === 'GET' && $action === '') {
    getUsuarioAutenticado();
    $pdo = getDB();

    $partes = $pdo->query("SELECT id, codigo, titulo, subtitulo, range_arts FROM vade_partes ORDER BY ordem")->fetchAll();

    foreach ($partes as &$parte) {
        $caps = $pdo->prepare("SELECT id, titulo FROM vade_capitulos WHERE parte_id = ? ORDER BY ordem");
        $caps->execute([$parte['id']]);
        $parte['capitulos'] = $caps->fetchAll();

        foreach ($parte['capitulos'] as &$cap) {
            $arts = $pdo->prepare("
                SELECT id, numero, caput, mais_cobrado, nota
                FROM vade_artigos WHERE capitulo_id = ? ORDER BY ordem
            ");
            $arts->execute([$cap['id']]);
            $cap['artigos'] = $arts->fetchAll();

            foreach ($cap['artigos'] as &$art) {
                $art['mais_cobrado'] = (bool)$art['mais_cobrado'];

                $pars = $pdo->prepare("SELECT rotulo, texto FROM vade_paragrafos WHERE artigo_id = ? ORDER BY ordem");
                $pars->execute([$art['id']]);
                $art['paragrafos'] = $pars->fetchAll();

                $incs = $pdo->prepare("SELECT rotulo, texto FROM vade_incisos WHERE artigo_id = ? ORDER BY ordem");
                $incs->execute([$art['id']]);
                $art['incisos'] = $incs->fetchAll();
            }
        }
    }

    respondOk(['partes' => $partes]);
}

// ─── GET /api/vade/?action=estrutura ─────────────────────────────────────────
// Retorna partes + capitulos (sem artigos) para o TOC
if ($method === 'GET' && $action === 'estrutura') {
    getUsuarioAutenticado();
    $pdo    = getDB();
    $partes = $pdo->query("SELECT id, codigo, titulo, subtitulo, range_arts FROM vade_partes ORDER BY ordem")->fetchAll();
    foreach ($partes as &$parte) {
        $s = $pdo->prepare("SELECT id, titulo FROM vade_capitulos WHERE parte_id = ? ORDER BY ordem");
        $s->execute([$parte['id']]);
        $parte['capitulos'] = $s->fetchAll();
    }
    respondOk(['partes' => $partes]);
}

// ─── GET /api/vade/?action=por_parte&parte_id=X ───────────────────────────────
// Retorna artigos, parágrafos e incisos de UMA parte (lazy-load)
if ($method === 'GET' && $action === 'por_parte') {
    getUsuarioAutenticado();
    $parte_id = (int)($_GET['parte_id'] ?? 0);
    if (!$parte_id) respondError('parte_id é obrigatório.');

    $pdo  = getDB();
    $caps = $pdo->prepare("SELECT id, titulo FROM vade_capitulos WHERE parte_id = ? ORDER BY ordem");
    $caps->execute([$parte_id]);
    $capitulos = $caps->fetchAll();

    foreach ($capitulos as &$cap) {
        $arts = $pdo->prepare("
            SELECT id, numero, caput, mais_cobrado, nota
            FROM vade_artigos WHERE capitulo_id = ? ORDER BY ordem
        ");
        $arts->execute([$cap['id']]);
        $cap['artigos'] = $arts->fetchAll();

        foreach ($cap['artigos'] as &$art) {
            $art['mais_cobrado'] = (bool)$art['mais_cobrado'];

            $pars = $pdo->prepare("SELECT rotulo, texto FROM vade_paragrafos WHERE artigo_id = ? ORDER BY ordem");
            $pars->execute([$art['id']]);
            $art['paragrafos'] = $pars->fetchAll();

            $incs = $pdo->prepare("SELECT rotulo, texto FROM vade_incisos WHERE artigo_id = ? ORDER BY ordem");
            $incs->execute([$art['id']]);
            $art['incisos'] = $incs->fetchAll();
        }
    }
    respondOk(['capitulos' => $capitulos]);
}

// ─── GET /api/vade/?action=buscar&q=texto ────────────────────────────────────
if ($method === 'GET' && $action === 'buscar') {
    getUsuarioAutenticado();
    $q   = trim($_GET['q'] ?? '');
    if (strlen($q) < 2) respondError('Digite pelo menos 2 caracteres.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("
        SELECT va.id, va.numero, va.caput, va.mais_cobrado,
               vc.titulo AS capitulo, vp.titulo AS parte
        FROM vade_artigos va
        JOIN vade_capitulos vc ON vc.id = va.capitulo_id
        JOIN vade_partes    vp ON vp.id = vc.parte_id
        WHERE va.numero LIKE ?
           OR va.caput  LIKE ?
           OR va.nota   LIKE ?
        LIMIT 30
    ");
    $like = '%' . $q . '%';
    $stmt->execute([$like, $like, $like]);
    $results = $stmt->fetchAll();

    foreach ($results as &$r) {
        $r['mais_cobrado'] = (bool)$r['mais_cobrado'];
    }

    respondOk(['resultados' => $results, 'total' => count($results)]);
}

// ─── POST /api/vade/?action=favoritar ────────────────────────────────────────
if ($method === 'POST' && $action === 'favoritar') {
    $user     = getUsuarioAutenticado();
    $body     = getBody();
    $artigo_id = (int)($body['artigo_id'] ?? 0);
    if (!$artigo_id) respondError('artigo_id é obrigatório.');

    $pdo = getDB();
    $pdo->prepare("
        INSERT OR IGNORE INTO favoritos_artigos (usuario_id, artigo_id) VALUES (?,?)
    ")->execute([$user['id'], $artigo_id]);

    respondOk([], 'Artigo favoritado.');
}

// ─── DELETE /api/vade/?action=favoritar&artigo_id=X ──────────────────────────
if ($method === 'DELETE' && $action === 'favoritar') {
    $user     = getUsuarioAutenticado();
    $artigo_id = (int)($_GET['artigo_id'] ?? 0);
    if (!$artigo_id) respondError('artigo_id é obrigatório.');

    getDB()->prepare("DELETE FROM favoritos_artigos WHERE usuario_id = ? AND artigo_id = ?")
           ->execute([$user['id'], $artigo_id]);

    respondOk([], 'Favorito removido.');
}

// ─── GET /api/vade/?action=favoritos ─────────────────────────────────────────
if ($method === 'GET' && $action === 'favoritos') {
    $user = getUsuarioAutenticado();
    $pdo  = getDB();

    $stmt = $pdo->prepare("
        SELECT va.id, va.numero, va.caput
        FROM favoritos_artigos fa
        JOIN vade_artigos va ON va.id = fa.artigo_id
        WHERE fa.usuario_id = ?
        ORDER BY fa.criado_em DESC
    ");
    $stmt->execute([$user['id']]);
    respondOk(['favoritos' => $stmt->fetchAll()]);
}

respondError('Ação não encontrada.', 404);
