<?php
// ─── Google OAuth 2.0 — Credenciais ──────────────────────────────────────────
// Configure em: https://console.cloud.google.com/apis/credentials
// Redirect URI autorizado: http://localhost/lex-studio/api/auth/oauth.php?action=callback
require_once __DIR__ . '/env.php';

define('GOOGLE_CLIENT_ID',     getenv('GOOGLE_CLIENT_ID')     ?: '');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');

// Usa APP_URL do .env diretamente; fallback constrói com HTTP_HOST
$_oauth_base = rtrim(getenv('APP_URL') ?: ('http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/lex-studio'), '/');
define('GOOGLE_REDIRECT_URI', getenv('GOOGLE_REDIRECT_URI') ?: $_oauth_base . '/api/auth/oauth.php?action=callback');
define('APP_URL',             $_oauth_base);
