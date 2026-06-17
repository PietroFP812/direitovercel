<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── GET /api/progresso/ — Resumo geral ──────────────────────────────────────
if ($method === 'GET' && $action === '') {
    $user = getUsuarioAutenticado();
    $pdo  = getDB();

    // Progresso por área
    $stmt = $pdo->prepare("
        SELECT a.id, a.titulo, a.icone,
               COALESCE(pa.topicos_vistos, 0) AS topicos_vistos,
               COALESCE(pa.total_topicos, 0)  AS total_topicos,
               COALESCE(pa.porcentagem, 0)    AS porcentagem,
               COALESCE(pa.concluida, 0)      AS concluida,
               pa.ultimo_acesso
        FROM areas a
        LEFT JOIN progresso_areas pa ON pa.area_id = a.id AND pa.usuario_id = ?
        WHERE a.ativo = 1 ORDER BY a.ordem
    ");
    $stmt->execute([$user['id']]);
    $areas = $stmt->fetchAll();

    // Stats gerais
    $stats = $pdo->prepare("
        SELECT
          COUNT(DISTINCT s.id)                          AS total_simulados,
          COALESCE(ROUND(AVG(s.porcentagem),1), 0)      AS media_simulados,
          COALESCE(MAX(s.porcentagem), 0)               AS melhor_simulado,
          COUNT(DISTINCT CASE WHEN pa.concluida=1 THEN pa.area_id END) AS areas_concluidas,
          COUNT(DISTINCT fa.artigo_id)                  AS artigos_favoritados
        FROM usuarios u
        LEFT JOIN simulados s         ON s.usuario_id = u.id AND s.concluido = 1
        LEFT JOIN progresso_areas pa  ON pa.usuario_id = u.id
        LEFT JOIN favoritos_artigos fa ON fa.usuario_id = u.id
        WHERE u.id = ?
    ");
    $stats->execute([$user['id']]);

    respondOk(['areas' => $areas, 'stats' => $stats->fetch()]);
}

respondError('Ação não encontrada.', 404);
