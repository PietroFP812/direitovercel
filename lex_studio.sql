-- ═══════════════════════════════════════════════════════════════════════════
-- LEX STUDIO — Banco de Dados SQLite
-- ═══════════════════════════════════════════════════════════════════════════

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. USUÁRIOS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usuarios (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome                        TEXT    NOT NULL,
    sobrenome                   TEXT    NOT NULL DEFAULT '',
    email                       TEXT    NOT NULL,
    senha_hash                  TEXT,
    provider                    TEXT    NOT NULL DEFAULT 'local' CHECK(provider IN ('local','google')),
    provider_id                 TEXT,
    plano                       TEXT    NOT NULL DEFAULT 'free'  CHECK(plano IN ('free','pro','anual')),
    tema                        TEXT    NOT NULL DEFAULT 'dark'  CHECK(tema IN ('dark','light')),
    ativo                       INTEGER NOT NULL DEFAULT 1,
    email_verificado            INTEGER NOT NULL DEFAULT 0,
    token_verificacao           TEXT,
    token_verificacao_expira_em TEXT,
    token_reset_senha           TEXT,
    token_reset_expira_em       TEXT,
    ultimo_login                TEXT,
    criado_em                   TEXT    NOT NULL DEFAULT (datetime('now')),
    atualizado_em               TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_email     ON usuarios(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_provider  ON usuarios(provider, provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX       IF NOT EXISTS idx_us_ativo  ON usuarios(ativo);
CREATE INDEX       IF NOT EXISTS idx_us_plano  ON usuarios(plano);

CREATE TRIGGER IF NOT EXISTS trg_usuarios_update
AFTER UPDATE ON usuarios BEGIN
    UPDATE usuarios SET atualizado_em = datetime('now') WHERE id = NEW.id;
END;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SESSÕES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessoes (
    id         TEXT    PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ip         TEXT,
    user_agent TEXT,
    expira_em  TEXT    NOT NULL,
    criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sess_usuario ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sess_expira  ON sessoes(expira_em);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. LOGS DE ACESSO
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS logs_acesso (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    acao       TEXT    NOT NULL,
    ip         TEXT,
    user_agent TEXT,
    criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_log_usuario  ON logs_acesso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_log_criado   ON logs_acesso(criado_em);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ÁREAS DE ESTUDO
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS areas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo      TEXT    NOT NULL,
    descricao   TEXT,
    tags        TEXT,              -- JSON array: ["tag1","tag2"]
    icone       TEXT,
    ordem       INTEGER NOT NULL DEFAULT 0,
    nivel_plano TEXT    NOT NULL DEFAULT 'free' CHECK(nivel_plano IN ('free','pro')),
    ativo       INTEGER NOT NULL DEFAULT 1,
    criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_area_ordem ON areas(ordem);
CREATE INDEX IF NOT EXISTS idx_area_ativo ON areas(ativo);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TÓPICOS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS topicos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id       INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    titulo        TEXT    NOT NULL,
    conteudo      TEXT    NOT NULL,
    nota          TEXT,             -- ponto de prova / destaque jurídico
    ordem         INTEGER NOT NULL DEFAULT 0,
    ativo         INTEGER NOT NULL DEFAULT 1,
    criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_top_area  ON topicos(area_id);
CREATE INDEX IF NOT EXISTS idx_top_ordem ON topicos(ordem);

CREATE TRIGGER IF NOT EXISTS trg_topicos_update
AFTER UPDATE ON topicos BEGIN
    UPDATE topicos SET atualizado_em = datetime('now') WHERE id = NEW.id;
END;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ITENS DO TÓPICO  (bullet points)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS topico_itens (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    topico_id INTEGER NOT NULL REFERENCES topicos(id) ON DELETE CASCADE,
    texto     TEXT    NOT NULL,
    ordem     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_item_topico ON topico_itens(topico_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. PROGRESSO — TÓPICOS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS progresso_topicos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    topico_id  INTEGER NOT NULL REFERENCES topicos(id)  ON DELETE CASCADE,
    visto      INTEGER NOT NULL DEFAULT 0,
    visto_em   TEXT,
    revisao    INTEGER NOT NULL DEFAULT 0,
    revisao_em TEXT,
    UNIQUE(usuario_id, topico_id)
);

CREATE INDEX IF NOT EXISTS idx_pt_usuario ON progresso_topicos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pt_topico  ON progresso_topicos(topico_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. PROGRESSO — ÁREAS  (cache desnormalizado)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS progresso_areas (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id        INTEGER NOT NULL REFERENCES areas(id)    ON DELETE CASCADE,
    topicos_vistos INTEGER NOT NULL DEFAULT 0,
    total_topicos  INTEGER NOT NULL DEFAULT 0,
    porcentagem    REAL    NOT NULL DEFAULT 0.0,
    concluida      INTEGER NOT NULL DEFAULT 0,
    ultimo_acesso  TEXT,
    UNIQUE(usuario_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_pa_usuario ON progresso_areas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pa_area    ON progresso_areas(area_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. ANOTAÇÕES — POR ÁREA
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS anotacoes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id       INTEGER NOT NULL REFERENCES areas(id)    ON DELETE CASCADE,
    conteudo      TEXT    NOT NULL DEFAULT '',
    caracteres    INTEGER NOT NULL DEFAULT 0,
    criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(usuario_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_anot_usuario ON anotacoes(usuario_id);

CREATE TRIGGER IF NOT EXISTS trg_anotacoes_update
AFTER UPDATE ON anotacoes BEGIN
    UPDATE anotacoes SET atualizado_em = datetime('now') WHERE id = NEW.id;
END;


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. QUESTÕES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS questoes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id     INTEGER NOT NULL REFERENCES areas(id)   ON DELETE CASCADE,
    topico_id   INTEGER REFERENCES topicos(id)          ON DELETE SET NULL,
    enunciado   TEXT    NOT NULL,
    explicacao  TEXT,              -- gabarito comentado
    dificuldade TEXT    NOT NULL DEFAULT 'medio' CHECK(dificuldade IN ('facil','medio','dificil')),
    banca       TEXT,
    ano         INTEGER,
    ativo       INTEGER NOT NULL DEFAULT 1,
    criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quest_area   ON questoes(area_id);
CREATE INDEX IF NOT EXISTS idx_quest_topico ON questoes(topico_id);
CREATE INDEX IF NOT EXISTS idx_quest_ativo  ON questoes(ativo);


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. OPÇÕES DAS QUESTÕES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS questao_opcoes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    questao_id INTEGER NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    letra      TEXT    NOT NULL,
    texto      TEXT    NOT NULL,
    correta    INTEGER NOT NULL DEFAULT 0,
    ordem      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_opcao_questao         ON questao_opcoes(questao_id);
CREATE INDEX IF NOT EXISTS idx_opcao_questao_correta ON questao_opcoes(questao_id, correta);


-- ─────────────────────────────────────────────────────────────────────────────
-- 12. SIMULADOS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS simulados (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id        INTEGER REFERENCES areas(id)             ON DELETE SET NULL,
    total_questoes INTEGER NOT NULL DEFAULT 10,
    acertos        INTEGER NOT NULL DEFAULT 0,
    erros          INTEGER NOT NULL DEFAULT 0,
    porcentagem    REAL    NOT NULL DEFAULT 0.0,
    tempo_segundos INTEGER NOT NULL DEFAULT 0,
    concluido      INTEGER NOT NULL DEFAULT 0,
    iniciado_em    TEXT    NOT NULL DEFAULT (datetime('now')),
    concluido_em   TEXT
);

CREATE INDEX IF NOT EXISTS idx_sim_usuario   ON simulados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sim_area      ON simulados(area_id);
CREATE INDEX IF NOT EXISTS idx_sim_concluido ON simulados(concluido);


-- ─────────────────────────────────────────────────────────────────────────────
-- 13. RESPOSTAS DOS SIMULADOS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS simulado_respostas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    simulado_id   INTEGER NOT NULL REFERENCES simulados(id)      ON DELETE CASCADE,
    questao_id    INTEGER NOT NULL REFERENCES questoes(id)       ON DELETE CASCADE,
    opcao_id      INTEGER          REFERENCES questao_opcoes(id) ON DELETE SET NULL,
    correta       INTEGER NOT NULL DEFAULT 0,
    tempo_ms      INTEGER NOT NULL DEFAULT 0,
    respondido_em TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(simulado_id, questao_id)
);

CREATE INDEX IF NOT EXISTS idx_sr_simulado ON simulado_respostas(simulado_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 14. FAVORITOS — ARTIGOS DO VADE MECUM
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS favoritos_artigos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    artigo_id  TEXT    NOT NULL,
    criado_em  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(usuario_id, artigo_id)
);

CREATE INDEX IF NOT EXISTS idx_fav_usuario ON favoritos_artigos(usuario_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 15. VADE MECUM — CÓDIGO CIVIL
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vade_partes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo     TEXT    NOT NULL,
    titulo     TEXT    NOT NULL,
    subtitulo  TEXT,
    range_arts TEXT,
    ordem      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vp_ordem ON vade_partes(ordem);

CREATE TABLE IF NOT EXISTS vade_capitulos (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    parte_id INTEGER NOT NULL REFERENCES vade_partes(id) ON DELETE CASCADE,
    titulo   TEXT    NOT NULL,
    ordem    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vc_parte ON vade_capitulos(parte_id);

CREATE TABLE IF NOT EXISTS vade_artigos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    capitulo_id  INTEGER NOT NULL REFERENCES vade_capitulos(id) ON DELETE CASCADE,
    numero       TEXT    NOT NULL,
    caput        TEXT    NOT NULL DEFAULT '',
    mais_cobrado INTEGER NOT NULL DEFAULT 0,
    nota         TEXT,
    ordem        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_va_capitulo ON vade_artigos(capitulo_id);
CREATE INDEX IF NOT EXISTS idx_va_numero   ON vade_artigos(numero);

CREATE TABLE IF NOT EXISTS vade_paragrafos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    artigo_id INTEGER NOT NULL REFERENCES vade_artigos(id) ON DELETE CASCADE,
    rotulo    TEXT    NOT NULL,
    texto     TEXT    NOT NULL,
    ordem     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vpar_artigo ON vade_paragrafos(artigo_id);

CREATE TABLE IF NOT EXISTS vade_incisos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    artigo_id INTEGER NOT NULL REFERENCES vade_artigos(id) ON DELETE CASCADE,
    rotulo    TEXT    NOT NULL,
    texto     TEXT    NOT NULL,
    ordem     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vinc_artigo ON vade_incisos(artigo_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- DADOS INICIAIS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO usuarios (nome, sobrenome, email, senha_hash, provider, plano, ativo, email_verificado)
VALUES ('Admin', 'Lex', 'admin@lexstudio.com',
        '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'local', 'anual', 1, 1);

INSERT OR IGNORE INTO areas (titulo, descricao, icone, ordem, nivel_plano) VALUES
('Parte Geral — Pessoas e Bens',   'Personalidade, capacidade, pessoas jurídicas e classificação dos bens.',                        '⚖️',  1,  'free'),
('Obrigações',                     'Modalidades, adimplemento, inadimplemento e extinção das obrigações.',                          '📋',  2,  'free'),
('Contratos',                      'Princípios, formação, extinção e principais espécies contratuais.',                             '📝',  3,  'free'),
('Responsabilidade Civil',         'Pressupostos, responsabilidade subjetiva, objetiva e fato de terceiro.',                        '🔨',  4,  'free'),
('Direito das Coisas',             'Posse, propriedade, usucapião e direitos reais de garantia.',                                   '🏠',  5,  'free'),
('Direito de Família',             'Casamento, união estável, divórcio, filiação, alimentos e tutela.',                             '👨‍👩‍👧', 6,  'pro'),
('Direito das Sucessões',          'Herança, legítima, testamento, codicilo e inventário.',                                         '📜',  7,  'pro'),
('Direito Empresarial',            'Teoria da empresa, sociedades, títulos de crédito e falência.',                                 '🏢',  8,  'pro'),
('Direito do Consumidor',          'CDC, práticas abusivas, responsabilidade e tutela coletiva.',                                   '🛒',  9,  'pro'),
('Direito Internacional Privado',  'LINDB, conflito de leis no espaço e cooperação jurídica internacional.',                        '🌎',  10, 'pro'),
('Fatos e Negócios Jurídicos',     'Atos lícitos, negócios jurídicos, vícios e invalidades.',                                       '⚡',  11, 'pro'),
('Prescrição e Decadência',        'Prazos, causas de suspensão, interrupção e impedimento.',                                       '⏳',  12, 'pro');
