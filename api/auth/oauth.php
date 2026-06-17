<?php
// ─── Google OAuth 2.0 — Handler (init + callback) ────────────────────────────
// Este arquivo usa redirects, não JSON, por isso é separado do index.php.

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/oauth.php';

session_start();

$action = $_GET['action'] ?? '';

// ── Verifica credenciais configuradas ────────────────────────────────────────
function googleConfigured(): bool {
    return GOOGLE_CLIENT_ID !== '' && GOOGLE_CLIENT_ID !== 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com';
}

function gerarTokenOAuth(int $bytes = 32): string {
    return bin2hex(random_bytes($bytes));
}

// ─── Iniciar fluxo OAuth ─────────────────────────────────────────────────────
if ($action === 'init') {
    if (!googleConfigured()) {
        header('Location: ' . APP_URL . '/index.html?oauth_error=not_configured');
        exit;
    }

    $state = gerarTokenOAuth(16);
    $_SESSION['oauth_state'] = $state;

    $params = http_build_query([
        'client_id'     => GOOGLE_CLIENT_ID,
        'redirect_uri'  => GOOGLE_REDIRECT_URI,
        'response_type' => 'code',
        'scope'         => 'openid email profile',
        'state'         => $state,
        'access_type'   => 'online',
        'prompt'        => 'select_account',
    ]);

    header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . $params);
    exit;
}

// ─── Callback do Google ───────────────────────────────────────────────────────
if ($action === 'callback') {
    $code  = $_GET['code']  ?? '';
    $state = $_GET['state'] ?? '';
    $error = $_GET['error'] ?? '';

    if ($error || !$code) {
        header('Location: ' . APP_URL . '/index.html?oauth_error=' . urlencode($error ?: 'cancelled'));
        exit;
    }

    // Verifica state (CSRF)
    if (!isset($_SESSION['oauth_state']) || $_SESSION['oauth_state'] !== $state) {
        header('Location: ' . APP_URL . '/index.html?oauth_error=invalid_state');
        exit;
    }
    unset($_SESSION['oauth_state']);

    // Troca code por access_token
    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'code'          => $code,
            'client_id'     => GOOGLE_CLIENT_ID,
            'client_secret' => GOOGLE_CLIENT_SECRET,
            'redirect_uri'  => GOOGLE_REDIRECT_URI,
            'grant_type'    => 'authorization_code',
        ]),
        CURLOPT_TIMEOUT => 15,
    ]);
    $tokenResp = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (empty($tokenResp['access_token'])) {
        header('Location: ' . APP_URL . '/index.html?oauth_error=token_failed');
        exit;
    }

    // Busca info do usuário
    $ch = curl_init('https://www.googleapis.com/oauth2/v2/userinfo');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $tokenResp['access_token']],
        CURLOPT_TIMEOUT        => 10,
    ]);
    $userInfo = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (empty($userInfo['email'])) {
        header('Location: ' . APP_URL . '/index.html?oauth_error=userinfo_failed');
        exit;
    }

    // Encontra ou cria usuário
    $pdo       = getDB();
    $googleId  = $userInfo['id']           ?? '';
    $email     = $userInfo['email']        ?? '';
    $nome      = $userInfo['given_name']   ?? explode(' ', $userInfo['name'] ?? 'Usuário')[0];
    $sobrenome = $userInfo['family_name']  ?? (explode(' ', $userInfo['name'] ?? '') [1] ?? '');

    // Primeiro tenta pelo provider_id
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE provider = 'google' AND provider_id = ?");
    $stmt->execute([$googleId]);
    $userId = $stmt->fetchColumn();

    // Depois tenta pelo e-mail
    if (!$userId) {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $userId = $stmt->fetchColumn();
        if ($userId) {
            // Vincula conta existente ao Google
            $pdo->prepare("UPDATE usuarios SET provider = 'google', provider_id = ?, email_verificado = 1 WHERE id = ?")
                ->execute([$googleId, $userId]);
        }
    }

    // Cria novo usuário se não existe
    if (!$userId) {
        $pdo->prepare("
            INSERT INTO usuarios (nome, sobrenome, email, provider, provider_id, plano, ativo, email_verificado)
            VALUES (?, ?, ?, 'google', ?, 'free', 1, 1)
        ")->execute([$nome, $sobrenome, $email, $googleId]);
        $userId = (int)$pdo->lastInsertId();
    }

    // Verifica se conta está ativa
    $checkAtivo = $pdo->prepare("SELECT ativo FROM usuarios WHERE id = ?");
    $checkAtivo->execute([$userId]);
    if (!$checkAtivo->fetchColumn()) {
        header('Location: ' . APP_URL . '/index.html?oauth_error=account_disabled');
        exit;
    }

    // Cria sessão
    $token  = bin2hex(random_bytes(32));
    $expira = date('Y-m-d H:i:s', strtotime('+30 days'));
    $ip     = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua     = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

    $pdo->prepare("INSERT INTO sessoes (id, usuario_id, ip, user_agent, expira_em) VALUES (?,?,?,?,?)")
        ->execute([$token, $userId, $ip, $ua, $expira]);
    $pdo->prepare("UPDATE usuarios SET ultimo_login = datetime('now') WHERE id = ?")
        ->execute([$userId]);

    // Busca dados do usuário para passar ao frontend
    $info = $pdo->prepare("SELECT id, nome, sobrenome, email, plano, tema FROM usuarios WHERE id = ?");
    $info->execute([$userId]);
    $userData = $info->fetch(PDO::FETCH_ASSOC);

    require_once __DIR__ . '/../config/helpers.php';
    setSessionCookie($token);

    // Redireciona para app com token e dados codificados
    $payload = base64_encode(json_encode(['token' => $token, 'usuario' => $userData]));
    header('Location: ' . APP_URL . '/app/home.html?oauth=' . urlencode($payload));
    exit;
}

header('Location: ' . APP_URL . '/index.html');
exit;
