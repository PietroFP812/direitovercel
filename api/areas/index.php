<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/procedures.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── GET /api/areas/ — Lista todas as áreas ───────────────────────────────────
if ($method === 'GET' && $action === '') {
    $user = getUsuarioAutenticado();
    $pdo  = getDB();

    $areas = $pdo->query("
        SELECT id, titulo, descricao, tags, icone, ordem, nivel_plano
        FROM areas WHERE ativo = 1 ORDER BY ordem
    ")->fetchAll();

    // Adiciona progresso do usuário em cada área
    $prog = $pdo->prepare("
        SELECT area_id, topicos_vistos, total_topicos, porcentagem, concluida
        FROM progresso_areas WHERE usuario_id = ?
    ");
    $prog->execute([$user['id']]);
    $progressoMap = [];
    foreach ($prog->fetchAll() as $p) {
        $progressoMap[$p['area_id']] = $p;
    }

    foreach ($areas as &$area) {
        $area['tags'] = json_decode($area['tags'] ?? '[]', true);
        $p = $progressoMap[$area['id']] ?? null;
        $area['progresso'] = $p ? [
            'topicos_vistos' => (int)$p['topicos_vistos'],
            'total_topicos'  => (int)$p['total_topicos'],
            'porcentagem'    => (float)$p['porcentagem'],
            'concluida'      => (bool)$p['concluida'],
        ] : ['topicos_vistos' => 0, 'total_topicos' => 0, 'porcentagem' => 0, 'concluida' => false];
        // Bloqueia área se plano insuficiente
        $area['bloqueada'] = ($area['nivel_plano'] === 'pro' || $area['nivel_plano'] === 'anual')
                          && $user['plano'] === 'free';
    }

    respondOk(['areas' => $areas]);
}

// ─── GET /api/areas/?action=topicos&area_id=X ────────────────────────────────
if ($method === 'GET' && $action === 'topicos') {
    $user    = getUsuarioAutenticado();
    $area_id = (int)($_GET['area_id'] ?? 0);
    if (!$area_id) respondError('area_id é obrigatório.');

    $pdo = getDB();

    // Verifica se área existe e se usuário tem acesso
    $area = $pdo->prepare("SELECT id, titulo, nivel_plano FROM areas WHERE id = ? AND ativo = 1");
    $area->execute([$area_id]);
    $areaData = $area->fetch();
    if (!$areaData) respondError('Área não encontrada.', 404);

    if (($areaData['nivel_plano'] === 'pro' || $areaData['nivel_plano'] === 'anual') && $user['plano'] === 'free') {
        respondError('Plano Pro necessário para acessar esta área.', 403);
    }

    // Busca tópicos
    $stmt = $pdo->prepare("SELECT id, titulo, conteudo, nota, ordem FROM topicos WHERE area_id = ? AND ativo = 1 ORDER BY ordem");
    $stmt->execute([$area_id]);
    $topicos = $stmt->fetchAll();

    foreach ($topicos as &$t) {
        // Itens do tópico
        $itens = $pdo->prepare("SELECT texto FROM topico_itens WHERE topico_id = ? ORDER BY ordem");
        $itens->execute([$t['id']]);
        $t['itens'] = array_column($itens->fetchAll(), 'texto');

        // Nota do tópico (campo único em topicos.nota)
        $t['notas'] = $t['nota'] ? [$t['nota']] : [];

        // Progresso do usuário neste tópico
        $visto = $pdo->prepare("SELECT visto, revisao FROM progresso_topicos WHERE usuario_id = ? AND topico_id = ?");
        $visto->execute([$user['id'], $t['id']]);
        $v = $visto->fetch();
        $t['visto']   = $v ? (bool)$v['visto']   : false;
        $t['revisao'] = $v ? (bool)$v['revisao']  : false;
    }

    respondOk(['area' => $areaData, 'topicos' => $topicos]);
}

// ─── POST /api/areas/?action=marcar_topico ────────────────────────────────────
if ($method === 'POST' && $action === 'marcar_topico') {
    $user     = getUsuarioAutenticado();
    $body     = getBody();
    $topico_id = (int)($body['topico_id'] ?? 0);
    if (!$topico_id) respondError('topico_id é obrigatório.');

    $pdo = getDB();
    sp_marcar_topico_visto($pdo, $user['id'], $topico_id);

    respondOk([], 'Tópico marcado como visto.');
}

// ─── POST /api/areas/?action=toggle_revisao ───────────────────────────────────
if ($method === 'POST' && $action === 'toggle_revisao') {
    $user      = getUsuarioAutenticado();
    $body      = getBody();
    $topico_id = (int)($body['topico_id'] ?? 0);
    if (!$topico_id) respondError('topico_id é obrigatório.');

    $pdo = getDB();
    sp_toggle_revisao($pdo, $user['id'], $topico_id);

    // Retorna novo estado
    $stmt = $pdo->prepare("SELECT revisao FROM progresso_topicos WHERE usuario_id = ? AND topico_id = ?");
    $stmt->execute([$user['id'], $topico_id]);
    $row = $stmt->fetch();

    respondOk(['revisao' => (bool)($row['revisao'] ?? false)], 'Revisão atualizada.');
}

// ─── GET /api/areas/?action=topicos_revisao ───────────────────────────────────
if ($method === 'GET' && $action === 'topicos_revisao') {
    $user = getUsuarioAutenticado();
    $pdo  = getDB();

    $stmt = $pdo->prepare("
        SELECT t.id, t.titulo, t.area_id, a.titulo AS area_titulo,
               pt.revisao_em
        FROM progresso_topicos pt
        JOIN topicos t ON t.id = pt.topico_id
        JOIN areas   a ON a.id = t.area_id
        WHERE pt.usuario_id = ? AND pt.revisao = 1 AND t.ativo = 1
        ORDER BY pt.revisao_em DESC
    ");
    $stmt->execute([$user['id']]);

    respondOk(['topicos' => $stmt->fetchAll()]);
}

respondError('Ação não encontrada.', 404);
