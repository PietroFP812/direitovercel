<?php
$allowedIPs = ['127.0.0.1', '::1'];
$adminKey   = getenv('LEX_ADMIN_KEY') ?: 'lex-admin-2024';
$keyOk      = isset($_GET['key']) && $_GET['key'] === $adminKey;
if (!in_array($_SERVER['REMOTE_ADDR'], $allowedIPs) && !$keyOk) {
    http_response_code(403);
    exit('<p style="font-family:sans-serif;padding:20px">403 — Acesso restrito.</p>');
}
require_once __DIR__ . '/api/config/db.php';

$pdo  = getDB();
$hash = password_hash('admin123', PASSWORD_BCRYPT);

$stmt = $pdo->prepare("UPDATE usuarios SET senha_hash = ? WHERE email = 'admin@lexstudio.com'");
$stmt->execute([$hash]);

if ($stmt->rowCount() === 0) {
    $pdo->prepare("
        INSERT INTO usuarios (nome, sobrenome, email, senha_hash, provider, plano, ativo, email_verificado)
        VALUES ('Admin', 'Lex', 'admin@lexstudio.com', ?, 'local', 'anual', 1, 1)
    ")->execute([$hash]);
}

echo '<p style="font-family:sans-serif;padding:20px">
  ✅ Pronto!<br><br>
  <strong>E-mail:</strong> admin@lexstudio.com<br>
  <strong>Senha:</strong> admin123<br><br>
  <a href="index.html">→ Ir para o Lex Studio</a>
</p>';
