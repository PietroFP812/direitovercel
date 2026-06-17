<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── POST /api/pagamento/?action=assinar ─────────────────────────────────────
if ($method === 'POST' && $action === 'assinar') {
    $user = getUsuarioAutenticado();
    $body = getBody();

    $plano    = trim($body['plano']    ?? '');
    $metodo   = trim($body['metodo']   ?? 'cartao');
    $ultimos4 = trim($body['ultimos4'] ?? '');

    if (!in_array($plano, ['pro', 'anual'])) respondError('Plano inválido.');
    if (!in_array($metodo, ['cartao', 'pix', 'boleto'])) respondError('Método inválido.');

    $valores = ['pro' => 29.90, 'anual' => 228.00];
    $valor   = $valores[$plano];

    $pdo = getDB();

    $pdo->prepare("
        INSERT INTO pagamentos (usuario_id, plano, valor, status, metodo, ultimos_4)
        VALUES (?, ?, ?, 'aprovado', ?, ?)
    ")->execute([$user['id'], $plano, $valor, $metodo, $ultimos4 ?: null]);

    $pdo->prepare("UPDATE usuarios SET plano = ? WHERE id = ?")
        ->execute([$plano, $user['id']]);

    respondOk([
        'plano'  => $plano,
        'valor'  => $valor,
        'status' => 'aprovado',
    ], 'Assinatura ativada com sucesso!');
}

// ─── GET /api/pagamento/?action=historico ────────────────────────────────────
if ($method === 'GET' && $action === 'historico') {
    $user = getUsuarioAutenticado();
    $pdo  = getDB();

    $stmt = $pdo->prepare("
        SELECT plano, valor, status, metodo, ultimos_4, criado_em
        FROM pagamentos
        WHERE usuario_id = ?
        ORDER BY criado_em DESC
    ");
    $stmt->execute([$user['id']]);

    respondOk(['pagamentos' => $stmt->fetchAll()]);
}

respondError('Ação não encontrada.', 404);
