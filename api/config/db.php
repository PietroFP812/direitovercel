<?php
define('DB_PATH', __DIR__ . '/../../lex_studio.db');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $isNew = !file_exists(DB_PATH);

        $pdo = new PDO('sqlite:' . DB_PATH, null, null, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec('PRAGMA journal_mode = WAL');
        $pdo->exec('PRAGMA foreign_keys = ON');

        // Só executa o schema se o banco acabou de ser criado
        if ($isNew) {
            $schema = file_get_contents(__DIR__ . '/../../lex_studio.sql');
            $pdo->exec($schema);
        }

        // Migrations incrementais (seguras em banco existente)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS tentativas_login (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                ip        TEXT NOT NULL,
                email     TEXT NOT NULL,
                criado_em TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_tl_ip ON tentativas_login(ip, criado_em);

            CREATE TABLE IF NOT EXISTS pagamentos (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                plano      TEXT NOT NULL,
                valor      REAL NOT NULL,
                status     TEXT NOT NULL DEFAULT 'aprovado',
                metodo     TEXT NOT NULL DEFAULT 'cartao',
                ultimos_4  TEXT,
                criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_pag_usuario ON pagamentos(usuario_id);
        ");
    }
    return $pdo;
}
