<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/procedures.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── GET /api/simulados/?action=questoes&area_id=X&total=10 ──────────────────
if ($method === 'GET' && $action === 'questoes') {
    $user    = getUsuarioAutenticado();
    $area_id = (int)($_GET['area_id'] ?? 0);
    $total   = min((int)($_GET['total'] ?? 10), 20);
    $pdo     = getDB();

    // IDs já respondidos pelo usuário nesta área (de todos os simulados concluídos)
    if ($area_id > 0) {
        $vistas = $pdo->prepare("
            SELECT DISTINCT sr.questao_id
            FROM simulado_respostas sr
            JOIN simulados s ON s.id = sr.simulado_id
            WHERE s.usuario_id = ? AND s.area_id = ?
        ");
        $vistas->execute([$user['id'], $area_id]);
    } else {
        $vistas = $pdo->prepare("
            SELECT DISTINCT sr.questao_id
            FROM simulado_respostas sr
            JOIN simulados s ON s.id = sr.simulado_id
            WHERE s.usuario_id = ?
        ");
        $vistas->execute([$user['id']]);
    }
    $ids_vistos = array_column($vistas->fetchAll(), 'questao_id');

    $reiniciou = false;

    // Monta query excluindo já vistas
    function buscarQuestoes($pdo, $area_id, $total, $excluir) {
        $placeholders = $excluir ? implode(',', array_fill(0, count($excluir), '?')) : '';
        $where_area   = $area_id > 0 ? 'AND q.area_id = ?' : '';
        $where_excl   = $excluir ? "AND q.id NOT IN ($placeholders)" : '';
        $sql = "SELECT q.id, q.enunciado, q.explicacao, q.dificuldade FROM questoes q
                WHERE q.ativo = 1 $where_area $where_excl ORDER BY RANDOM() LIMIT ?";
        $params = [];
        if ($area_id > 0) $params[] = $area_id;
        foreach ($excluir as $id) $params[] = $id;
        $params[] = $total;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    $questoes = buscarQuestoes($pdo, $area_id, $total, $ids_vistos);

    // Se não há novas suficientes, reinicia o ciclo
    if (count($questoes) < $total) {
        $reiniciou = true;
        $questoes  = buscarQuestoes($pdo, $area_id, $total, []);
    }

    // Busca opções de cada questão
    foreach ($questoes as &$q) {
        $opts = $pdo->prepare("SELECT id, letra, texto, correta FROM questao_opcoes WHERE questao_id = ? ORDER BY ordem");
        $opts->execute([$q['id']]);
        $q['opcoes'] = $opts->fetchAll();
        foreach ($q['opcoes'] as &$o) {
            $o['correta'] = (bool)$o['correta'];
        }
    }

    respondOk(['questoes' => $questoes, 'reiniciou' => $reiniciou]);
}

// ─── POST /api/simulados/?action=iniciar ─────────────────────────────────────
if ($method === 'POST' && $action === 'iniciar') {
    $user    = getUsuarioAutenticado();
    $body    = getBody();
    $area_id = isset($body['area_id']) && $body['area_id'] !== null && $body['area_id'] !== '' ? (int)$body['area_id'] : null;
    $total   = min((int)($body['total'] ?? 10), 20);

    $pdo = getDB();
    $pdo->prepare("
        INSERT INTO simulados (usuario_id, area_id, total_questoes)
        VALUES (?, ?, ?)
    ")->execute([$user['id'], $area_id, $total]);

    respondOk(['simulado_id' => (int)$pdo->lastInsertId()], 'Simulado iniciado.');
}

// ─── POST /api/simulados/?action=responder ────────────────────────────────────
if ($method === 'POST' && $action === 'responder') {
    $user        = getUsuarioAutenticado();
    $body        = getBody();
    $simulado_id = (int)($body['simulado_id'] ?? 0);
    $questao_id  = (int)($body['questao_id']  ?? 0);
    $opcao_id    = (int)($body['opcao_id']    ?? 0);
    $tempo_ms    = (int)($body['tempo_ms']    ?? 0);

    if (!$simulado_id || !$questao_id) respondError('simulado_id e questao_id são obrigatórios.');

    $pdo = getDB();

    // Verifica que o simulado pertence ao usuário e ainda está em aberto
    $own = $pdo->prepare("SELECT id FROM simulados WHERE id = ? AND usuario_id = ? AND concluido = 0");
    $own->execute([$simulado_id, $user['id']]);
    if (!$own->fetch()) respondError('Simulado não encontrado.', 404);

    // Verifica se opção é correta
    $opcao = $pdo->prepare("SELECT correta FROM questao_opcoes WHERE id = ? AND questao_id = ?");
    $opcao->execute([$opcao_id, $questao_id]);
    $op = $opcao->fetch();
    $correta = $op ? (int)$op['correta'] : 0;

    $pdo->prepare("
        INSERT INTO simulado_respostas (simulado_id, questao_id, opcao_id, correta, tempo_ms)
        VALUES (?,?,?,?,?)
    ")->execute([$simulado_id, $questao_id, $opcao_id ?: null, $correta, $tempo_ms]);

    respondOk(['correta' => (bool)$correta]);
}

// ─── POST /api/simulados/?action=finalizar ────────────────────────────────────
if ($method === 'POST' && $action === 'finalizar') {
    $user        = getUsuarioAutenticado();
    $body        = getBody();
    $simulado_id = (int)($body['simulado_id'] ?? 0);
    $tempo       = (int)($body['tempo_segundos'] ?? 0);
    if (!$simulado_id) respondError('simulado_id é obrigatório.');

    $pdo = getDB();

    // Verifica que o simulado pertence ao usuário
    $own = $pdo->prepare("SELECT id FROM simulados WHERE id = ? AND usuario_id = ?");
    $own->execute([$simulado_id, $user['id']]);
    if (!$own->fetch()) respondError('Simulado não encontrado.', 404);

    $resultado = sp_finalizar_simulado($pdo, $simulado_id, $tempo);

    respondOk(['resultado' => $resultado], 'Simulado finalizado.');
}

// ─── GET /api/simulados/?action=historico ────────────────────────────────────
if ($method === 'GET' && $action === 'historico') {
    $user = getUsuarioAutenticado();
    $pdo  = getDB();

    $stmt = $pdo->prepare("
        SELECT s.id, s.total_questoes, s.acertos, s.erros, s.porcentagem,
               s.tempo_segundos, s.iniciado_em, s.concluido_em,
               a.titulo AS area
        FROM simulados s
        LEFT JOIN areas a ON a.id = s.area_id
        WHERE s.usuario_id = ? AND s.concluido = 1
        ORDER BY s.concluido_em DESC
        LIMIT 20
    ");
    $stmt->execute([$user['id']]);
    respondOk(['historico' => $stmt->fetchAll()]);
}

respondError('Ação não encontrada.', 404);
