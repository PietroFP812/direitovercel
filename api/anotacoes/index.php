<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

$method  = $_SERVER['REQUEST_METHOD'];
$area_id = (int)($_GET['area_id'] ?? 0);

// ─── GET /api/anotacoes/?area_id=X ───────────────────────────────────────────
if ($method === 'GET') {
    $user = getUsuarioAutenticado();
    if (!$area_id) respondError('area_id é obrigatório.');

    $stmt = getDB()->prepare("
        SELECT conteudo, caracteres, atualizado_em
        FROM anotacoes WHERE usuario_id = ? AND area_id = ?
    ");
    $stmt->execute([$user['id'], $area_id]);
    $nota = $stmt->fetch();

    respondOk(['anotacao' => $nota ?: ['conteudo' => '', 'caracteres' => 0, 'atualizado_em' => null]]);
}

// ─── POST /api/anotacoes/?area_id=X ──────────────────────────────────────────
if ($method === 'POST') {
    $user    = getUsuarioAutenticado();
    $body    = getBody();
    $conteudo = $body['conteudo'] ?? '';
    if (!$area_id) respondError('area_id é obrigatório.');
    if (mb_strlen($conteudo) > 50000) respondError('Anotação muito longa (máximo 50.000 caracteres).');

    $pdo  = getDB();
    $chars = mb_strlen($conteudo);

    $pdo->prepare("
        INSERT INTO anotacoes (usuario_id, area_id, conteudo, caracteres)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(usuario_id, area_id) DO UPDATE SET
            conteudo      = excluded.conteudo,
            caracteres    = excluded.caracteres,
            atualizado_em = datetime('now')
    ")->execute([$user['id'], $area_id, $conteudo, $chars]);

    respondOk(['caracteres' => $chars], 'Anotação salva.');
}

// ─── DELETE /api/anotacoes/?area_id=X ────────────────────────────────────────
if ($method === 'DELETE') {
    $user = getUsuarioAutenticado();
    if (!$area_id) respondError('area_id é obrigatório.');

    getDB()->prepare("DELETE FROM anotacoes WHERE usuario_id = ? AND area_id = ?")->execute([$user['id'], $area_id]);
    respondOk([], 'Anotação removida.');
}

respondError('Método não permitido.', 405);
