<?php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/gemini.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Método não permitido.', 405);
}

getUsuarioAutenticado();

$body       = getBody();
$messages   = $body['messages']   ?? [];
$system     = $body['system']     ?? '';
$max_tokens = min((int)($body['max_tokens'] ?? 1000), 2000);

if (empty($messages)) {
    respondError('messages é obrigatório.');
}

// Converte formato Anthropic → Gemini
// Anthropic: { role: 'user'|'assistant', content: string }
// Gemini:    { role: 'user'|'model',     parts: [{ text: string }] }
$contents = [];
foreach ($messages as $msg) {
    $role = ($msg['role'] === 'assistant') ? 'model' : 'user';
    $text = is_array($msg['content'])
        ? implode(' ', array_column($msg['content'], 'text'))
        : (string)($msg['content'] ?? '');
    $contents[] = ['role' => $role, 'parts' => [['text' => $text]]];
}

$payload = [
    'contents'         => $contents,
    'generationConfig' => [
        'maxOutputTokens' => $max_tokens,
        'temperature'     => 0.7,
    ],
];

if (!empty($system)) {
    $payload['systemInstruction'] = ['parts' => [['text' => $system]]];
}

$url = 'https://generativelanguage.googleapis.com/v1beta/models/'
     . GEMINI_MODEL . ':generateContent';

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'X-goog-api-key: ' . GEMINI_API_KEY,
    ],
    CURLOPT_TIMEOUT        => 60,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!$response) {
    respondError('Erro ao conectar com a IA. Tente novamente.', 502);
}

$data = json_decode($response, true);

if ($httpCode !== 200) {
    respondError($data['error']['message'] ?? 'Erro na IA.', $httpCode);
}

$text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

// Retorna no mesmo formato que o frontend espera (compatível com Anthropic)
respondOk(['content' => [['type' => 'text', 'text' => $text]]]);
