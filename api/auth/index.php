<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/procedures.php';
require_once __DIR__ . '/../config/email.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── POST /api/auth/?action=login ────────────────────────────────────────────
if ($method === 'POST' && $action === 'login') {
    $body  = getBody();
    $email = trim($body['email'] ?? '');
    $senha = $body['senha'] ?? '';

    if (!$email || !$senha) respondError('E-mail e senha são obrigatórios.');

    $pdo = getDB();
    $ip  = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    // Rate limiting: bloqueia após 5 tentativas falhas em 15 minutos
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM tentativas_login
        WHERE ip = ? AND criado_em > datetime('now', '-15 minutes')
    ");
    $stmt->execute([$ip]);
    if ((int)$stmt->fetchColumn() >= 5) {
        respondError('Muitas tentativas de login. Aguarde 15 minutos e tente novamente.', 429);
    }

    $stmt = $pdo->prepare("SELECT id, nome, sobrenome, email, senha_hash, plano, tema, ativo FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($senha, $user['senha_hash'])) {
        // Registra tentativa falha
        $pdo->prepare("INSERT INTO tentativas_login (ip, email) VALUES (?,?)")
            ->execute([$ip, $email]);
        respondError('E-mail ou senha incorretos.', 401);
    }
    if (!$user['ativo']) {
        respondError('Conta desativada. Entre em contato com o suporte.', 403);
    }

    // Login bem-sucedido: limpa tentativas deste IP/email
    $pdo->prepare("DELETE FROM tentativas_login WHERE ip = ? AND email = ?")
        ->execute([$ip, $email]);

    // Cria sessão (expira em 30 dias)
    $token    = gerarToken();
    $expira   = date('Y-m-d H:i:s', strtotime('+30 days'));
    $ip       = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua       = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

    $pdo->prepare("INSERT INTO sessoes (id, usuario_id, ip, user_agent, expira_em) VALUES (?,?,?,?,?)")
        ->execute([$token, $user['id'], $ip, $ua, $expira]);

    // Atualiza ultimo_login
    $pdo->prepare("UPDATE usuarios SET ultimo_login = datetime('now') WHERE id = ?")
        ->execute([$user['id']]);

    // Limpa sessões expiradas (manutenção silenciosa)
    sp_limpar_sessoes_expiradas($pdo);

    // Log
    $pdo->prepare("INSERT INTO logs_acesso (usuario_id, acao, ip, user_agent) VALUES (?,?,?,?)")
        ->execute([$user['id'], 'login', $ip, $ua]);

    setSessionCookie($token);

    respondOk([
        'token' => $token,
        'usuario' => [
            'id'       => $user['id'],
            'nome'     => $user['nome'],
            'sobrenome'=> $user['sobrenome'],
            'email'    => $user['email'],
            'plano'    => $user['plano'],
            'tema'     => $user['tema'],
        ]
    ], 'Login realizado com sucesso.');
}

// ─── POST /api/auth/?action=register ─────────────────────────────────────────
if ($method === 'POST' && $action === 'register') {
    $body      = getBody();
    $nome      = trim($body['nome']      ?? '');
    $sobrenome = trim($body['sobrenome'] ?? '');
    $email     = trim($body['email']     ?? '');
    $senha     = $body['senha']          ?? '';

    if (!$nome || !$email || !$senha) respondError('Nome, e-mail e senha são obrigatórios.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respondError('E-mail inválido.');
    if (strlen($senha) < 6) respondError('A senha deve ter no mínimo 6 caracteres.');

    $pdo = getDB();
    $ip  = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    // Rate limit: máx 3 cadastros por IP por hora
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM tentativas_login
        WHERE ip = ? AND email = '__cadastro__' AND criado_em > datetime('now', '-1 hour')
    ");
    $stmt->execute([$ip]);
    if ((int)$stmt->fetchColumn() >= 3) {
        respondError('Muitos cadastros deste IP. Aguarde 1 hora.', 429);
    }
    $pdo->prepare("INSERT INTO tentativas_login (ip, email) VALUES (?,?)")
        ->execute([$ip, '__cadastro__']);

    // Verifica e-mail duplicado
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) respondError('E-mail já cadastrado.');

    $hash  = password_hash($senha, PASSWORD_BCRYPT);
    $token = gerarToken();

    $pdo->prepare("
        INSERT INTO usuarios (nome, sobrenome, email, senha_hash, token_verificacao)
        VALUES (?,?,?,?,?)
    ")->execute([$nome, $sobrenome, $email, $hash, $token]);

    $userId = $pdo->lastInsertId();

    // Cria sessão imediata
    $sessToken = gerarToken();
    $expira    = date('Y-m-d H:i:s', strtotime('+30 days'));
    $ip        = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua        = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

    $pdo->prepare("INSERT INTO sessoes (id, usuario_id, ip, user_agent, expira_em) VALUES (?,?,?,?,?)")
        ->execute([$sessToken, $userId, $ip, $ua, $expira]);

    $pdo->prepare("INSERT INTO logs_acesso (usuario_id, acao, ip, user_agent) VALUES (?,?,?,?)")
        ->execute([$userId, 'register', $ip, $ua]);

    setcookie('lex_session', $sessToken, strtotime('+30 days'), '/', '', false, true);

    respondOk([
        'token' => $sessToken,
        'usuario' => [
            'id'       => $userId,
            'nome'     => $nome,
            'sobrenome'=> $sobrenome,
            'email'    => $email,
            'plano'    => 'free',
            'tema'     => 'dark',
        ]
    ], 'Conta criada com sucesso.');
}

// ─── POST /api/auth/?action=logout ───────────────────────────────────────────
if ($method === 'POST' && $action === 'logout') {
    $token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? $_COOKIE['lex_session'] ?? null;
    if ($token) {
        getDB()->prepare("DELETE FROM sessoes WHERE id = ?")->execute([$token]);
        setSessionCookie('', true);
    }
    respondOk([], 'Logout realizado.');
}

// ─── GET /api/auth/?action=me ─────────────────────────────────────────────────
if ($method === 'GET' && $action === 'me') {
    $user = getUsuarioAutenticado();
    respondOk(['usuario' => $user]);
}

// ─── PUT /api/auth/?action=tema ──────────────────────────────────────────────
if ($method === 'PUT' && $action === 'tema') {
    $user = getUsuarioAutenticado();
    $body = getBody();
    $tema = $body['tema'] ?? 'dark';
    if (!in_array($tema, ['dark', 'light'])) respondError('Tema inválido.');
    getDB()->prepare("UPDATE usuarios SET tema = ? WHERE id = ?")->execute([$tema, $user['id']]);
    respondOk([], 'Tema atualizado.');
}

// ─── PUT /api/auth/?action=atualizar_perfil ───────────────────────────────────
if ($method === 'PUT' && $action === 'atualizar_perfil') {
    $user = getUsuarioAutenticado();
    $body = getBody();
    $nome      = trim($body['nome']      ?? '');
    $sobrenome = trim($body['sobrenome'] ?? '');
    $email     = trim($body['email']     ?? '');

    if (!$nome) respondError('Nome é obrigatório.');
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) respondError('E-mail inválido.');

    $pdo = getDB();

    if ($email && $email !== $user['email']) {
        $check = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
        $check->execute([$email, $user['id']]);
        if ($check->fetch()) respondError('E-mail já está em uso.');
    }

    $newEmail = $email ?: $user['email'];
    $pdo->prepare("UPDATE usuarios SET nome = ?, sobrenome = ?, email = ? WHERE id = ?")
        ->execute([$nome, $sobrenome, $newEmail, $user['id']]);

    $updated = $pdo->prepare("SELECT id, nome, sobrenome, email, plano, tema FROM usuarios WHERE id = ?");
    $updated->execute([$user['id']]);
    respondOk(['usuario' => $updated->fetch()], 'Perfil atualizado.');
}

// ─── PUT /api/auth/?action=alterar_senha ─────────────────────────────────────
if ($method === 'PUT' && $action === 'alterar_senha') {
    $user = getUsuarioAutenticado();
    $body = getBody();
    $senha_atual = $body['senha_atual'] ?? '';
    $senha_nova  = $body['senha_nova']  ?? '';

    if (!$senha_atual || !$senha_nova) respondError('Senha atual e nova são obrigatórias.');
    if (strlen($senha_nova) < 6) respondError('A nova senha deve ter no mínimo 6 caracteres.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT senha_hash, provider FROM usuarios WHERE id = ?");
    $stmt->execute([$user['id']]);
    $row  = $stmt->fetch();

    if ($row['provider'] !== 'local') respondError('Conta OAuth — senha gerenciada pelo provedor.');
    if (!password_verify($senha_atual, $row['senha_hash'])) respondError('Senha atual incorreta.', 401);

    $pdo->prepare("UPDATE usuarios SET senha_hash = ? WHERE id = ?")
        ->execute([password_hash($senha_nova, PASSWORD_BCRYPT), $user['id']]);

    // Invalida todas as sessões exceto a atual (força logout em outros dispositivos)
    $tokenAtual = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? $_COOKIE['lex_session'] ?? '';
    $pdo->prepare("DELETE FROM sessoes WHERE usuario_id = ? AND id != ?")
        ->execute([$user['id'], $tokenAtual]);

    respondOk([], 'Senha alterada com sucesso.');
}

// ─── POST /api/auth/?action=solicitar_reset ───────────────────────────────────
if ($method === 'POST' && $action === 'solicitar_reset') {
    $body  = getBody();
    $email = trim($body['email'] ?? '');
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) respondError('E-mail inválido.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT id, nome, provider FROM usuarios WHERE email = ? AND ativo = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Responde igual mesmo sem encontrar (evita enumeração de e-mails)
    if (!$user || $user['provider'] !== 'local') {
        respondOk(['dev_link' => null], 'Se o e-mail existir, você receberá um link em breve.');
    }

    $token  = gerarToken(24);
    $expira = date('Y-m-d H:i:s', strtotime('+1 hour'));
    $pdo->prepare("UPDATE usuarios SET token_reset_senha = ?, token_reset_expira_em = ? WHERE id = ?")
        ->execute([$token, $expira, $user['id']]);

    $resetLink = (isset($_SERVER['HTTP_HOST']) ? 'http://' . $_SERVER['HTTP_HOST'] : 'http://localhost')
               . '/lex-studio/reset_senha.html?token=' . $token;

    $enviado = emailReset($email, $user['nome'], $resetLink);

    if ($enviado) {
        respondOk([], 'Se o e-mail existir na base, você receberá o link em breve.');
    } else {
        // Fallback dev: retorna link quando SMTP não está configurado
        respondOk(['dev_link' => $resetLink], 'Link gerado (configure SMTP_USER/SMTP_PASS no .env para enviar por e-mail).');
    }
}

// ─── POST /api/auth/?action=resetar_senha ────────────────────────────────────
if ($method === 'POST' && $action === 'resetar_senha') {
    $body  = getBody();
    $token = trim($body['token'] ?? '');
    $senha = $body['senha'] ?? '';

    if (!$token) respondError('Token inválido.');
    if (strlen($senha) < 6) respondError('A senha deve ter no mínimo 6 caracteres.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("
        SELECT id FROM usuarios
        WHERE token_reset_senha = ?
          AND token_reset_expira_em > datetime('now')
          AND ativo = 1
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) respondError('Link inválido ou expirado. Solicite um novo.', 400);

    $pdo->prepare("
        UPDATE usuarios SET
            senha_hash            = ?,
            token_reset_senha     = NULL,
            token_reset_expira_em = NULL
        WHERE id = ?
    ")->execute([password_hash($senha, PASSWORD_BCRYPT), $user['id']]);

    respondOk([], 'Senha redefinida com sucesso. Faça login.');
}

respondError('Ação não encontrada.', 404);
