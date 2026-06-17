<?php
// ─── Headers CORS + JSON ──────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─── Resposta JSON ────────────────────────────────────────────────────────────
function respond(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function respondError(string $msg, int $status = 400): void {
    respond(['erro' => true, 'mensagem' => $msg], $status);
}

function respondOk(mixed $data = [], string $msg = 'ok'): void {
    respond(array_merge(['sucesso' => true, 'mensagem' => $msg], is_array($data) ? $data : ['data' => $data]));
}

// ─── Body JSON da requisição ──────────────────────────────────────────────────
function getBody(): array {
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?? []) : [];
}

// ─── Autenticação por sessão ──────────────────────────────────────────────────
function getUsuarioAutenticado(): array {
    require_once __DIR__ . '/db.php';

    $token = $_SERVER['HTTP_X_SESSION_TOKEN']
          ?? $_COOKIE['lex_session']
          ?? null;

    if (!$token) respondError('Não autenticado.', 401);

    $pdo  = getDB();
    $stmt = $pdo->prepare("
        SELECT u.id, u.nome, u.sobrenome, u.email, u.plano, u.tema
        FROM sessoes s
        JOIN usuarios u ON u.id = s.usuario_id
        WHERE s.id = ? AND s.expira_em > datetime('now') AND u.ativo = 1
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) respondError('Sessão inválida ou expirada.', 401);
    return $user;
}

// ─── Gerar token seguro ───────────────────────────────────────────────────────
function gerarToken(int $bytes = 32): string {
    return bin2hex(random_bytes($bytes));
}

// ─── Cookie de sessão seguro ──────────────────────────────────────────────────
function setSessionCookie(string $token, bool $delete = false): void {
    setcookie('lex_session', $delete ? '' : $token, [
        'expires'  => $delete ? time() - 3600 : strtotime('+30 days'),
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Strict',
        'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    ]);
}
