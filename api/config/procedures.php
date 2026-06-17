<?php
// Equivalentes PHP das stored procedures (SQLite não suporta procedures)

function sp_marcar_topico_visto(PDO $pdo, int $usuario_id, int $topico_id): void {
    // Busca área do tópico
    $area = $pdo->prepare("SELECT area_id FROM topicos WHERE id = ?");
    $area->execute([$topico_id]);
    $area_id = $area->fetchColumn();
    if (!$area_id) return;

    // Upsert progresso do tópico (preserva visto_em original)
    $pdo->prepare("
        INSERT INTO progresso_topicos (usuario_id, topico_id, visto, visto_em)
        VALUES (?, ?, 1, datetime('now'))
        ON CONFLICT(usuario_id, topico_id) DO UPDATE SET
            visto    = 1,
            visto_em = CASE WHEN visto = 0 THEN datetime('now') ELSE visto_em END
    ")->execute([$usuario_id, $topico_id]);

    // Recalcula totais da área
    $total = $pdo->prepare("SELECT COUNT(*) FROM topicos WHERE area_id = ? AND ativo = 1");
    $total->execute([$area_id]);
    $v_total = (int)$total->fetchColumn();

    $vistos = $pdo->prepare("
        SELECT COUNT(*) FROM progresso_topicos pt
        JOIN topicos t ON t.id = pt.topico_id
        WHERE pt.usuario_id = ? AND t.area_id = ? AND pt.visto = 1
    ");
    $vistos->execute([$usuario_id, $area_id]);
    $v_vistos = (int)$vistos->fetchColumn();

    $pct      = $v_total > 0 ? round(($v_vistos / $v_total) * 100, 2) : 0;
    $concluida = ($v_total > 0 && $v_vistos >= $v_total) ? 1 : 0;

    $pdo->prepare("
        INSERT INTO progresso_areas (usuario_id, area_id, topicos_vistos, total_topicos, porcentagem, concluida, ultimo_acesso)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(usuario_id, area_id) DO UPDATE SET
            topicos_vistos = excluded.topicos_vistos,
            total_topicos  = excluded.total_topicos,
            porcentagem    = excluded.porcentagem,
            concluida      = excluded.concluida,
            ultimo_acesso  = datetime('now')
    ")->execute([$usuario_id, $area_id, $v_vistos, $v_total, $pct, $concluida]);
}


function sp_toggle_revisao(PDO $pdo, int $usuario_id, int $topico_id): void {
    $pdo->prepare("
        INSERT INTO progresso_topicos (usuario_id, topico_id, revisao, revisao_em)
        VALUES (?, ?, 1, datetime('now'))
        ON CONFLICT(usuario_id, topico_id) DO UPDATE SET
            revisao    = CASE WHEN revisao = 1 THEN 0 ELSE 1 END,
            revisao_em = CASE WHEN revisao = 0 THEN datetime('now') ELSE NULL END
    ")->execute([$usuario_id, $topico_id]);
}


function sp_finalizar_simulado(PDO $pdo, int $simulado_id, int $tempo_segundos): array {
    $stmt = $pdo->prepare("
        SELECT
            COALESCE(SUM(correta), 0) AS acertos,
            COALESCE(SUM(CASE WHEN correta = 0 AND opcao_id IS NOT NULL THEN 1 ELSE 0 END), 0) AS erros,
            COUNT(*) AS total
        FROM simulado_respostas WHERE simulado_id = ?
    ");
    $stmt->execute([$simulado_id]);
    $r = $stmt->fetch();

    $pct = $r['total'] > 0 ? round(($r['acertos'] / $r['total']) * 100, 2) : 0;

    $pdo->prepare("
        UPDATE simulados SET
            acertos        = ?,
            erros          = ?,
            total_questoes = ?,
            porcentagem    = ?,
            tempo_segundos = ?,
            concluido      = 1,
            concluido_em   = datetime('now')
        WHERE id = ?
    ")->execute([$r['acertos'], $r['erros'], $r['total'], $pct, $tempo_segundos, $simulado_id]);

    return ['acertos' => (int)$r['acertos'], 'erros' => (int)$r['erros'], 'total' => (int)$r['total'], 'porcentagem' => $pct];
}


function sp_limpar_sessoes_expiradas(PDO $pdo): void {
    $pdo->exec("DELETE FROM sessoes WHERE expira_em < datetime('now')");
}


function sp_resumo_progresso(PDO $pdo, int $usuario_id): array {
    $stmt = $pdo->prepare("
        SELECT
            (SELECT COUNT(*) FROM progresso_topicos WHERE usuario_id = :uid AND visto = 1)   AS topicos_concluidos,
            (SELECT COUNT(*) FROM topicos WHERE ativo = 1)                                    AS topicos_total,
            (SELECT COUNT(*) FROM progresso_topicos WHERE usuario_id = :uid AND revisao = 1) AS topicos_revisao,
            (SELECT COUNT(*) FROM simulados WHERE usuario_id = :uid AND concluido = 1)       AS simulados_feitos,
            (SELECT COALESCE(SUM(acertos),0) FROM simulados WHERE usuario_id = :uid AND concluido = 1) AS total_acertos,
            (SELECT COALESCE(SUM(total_questoes),0) FROM simulados WHERE usuario_id = :uid AND concluido = 1) AS total_questoes,
            (SELECT COALESCE(AVG(porcentagem),0) FROM simulados WHERE usuario_id = :uid AND concluido = 1) AS media_porcentagem,
            (SELECT porcentagem  FROM simulados WHERE usuario_id = :uid AND concluido = 1 ORDER BY concluido_em DESC LIMIT 1) AS ultimo_simulado_pct,
            (SELECT concluido_em FROM simulados WHERE usuario_id = :uid AND concluido = 1 ORDER BY concluido_em DESC LIMIT 1) AS ultimo_simulado_em,
            (SELECT COUNT(*) FROM favoritos_artigos WHERE usuario_id = :uid) AS artigos_favoritos
    ");
    $stmt->execute([':uid' => $usuario_id]);
    return $stmt->fetch() ?: [];
}
