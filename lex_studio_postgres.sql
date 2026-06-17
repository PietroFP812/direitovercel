-- ═══════════════════════════════════════════════════════════════════════════
-- LEX STUDIO — Schema PostgreSQL (Neon)
-- Execute este arquivo no painel Neon ou via psql para criar o banco.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. USUÁRIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id                          BIGSERIAL PRIMARY KEY,
    nome                        TEXT      NOT NULL,
    sobrenome                   TEXT      NOT NULL DEFAULT '',
    email                       TEXT      NOT NULL,
    senha_hash                  TEXT,
    provider                    TEXT      NOT NULL DEFAULT 'local' CHECK(provider IN ('local','google')),
    provider_id                 TEXT,
    plano                       TEXT      NOT NULL DEFAULT 'free'  CHECK(plano IN ('free','pro','anual')),
    tema                        TEXT      NOT NULL DEFAULT 'dark'  CHECK(tema IN ('dark','light')),
    ativo                       BOOLEAN   NOT NULL DEFAULT TRUE,
    email_verificado            BOOLEAN   NOT NULL DEFAULT FALSE,
    token_verificacao           TEXT,
    token_verificacao_expira_em TIMESTAMPTZ,
    token_reset_senha           TEXT,
    token_reset_expira_em       TIMESTAMPTZ,
    ultimo_login                TIMESTAMPTZ,
    criado_em                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_email    ON usuarios(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_provider ON usuarios(provider, provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX       IF NOT EXISTS idx_us_ativo ON usuarios(ativo);
CREATE INDEX       IF NOT EXISTS idx_us_plano ON usuarios(plano);

CREATE OR REPLACE FUNCTION trg_usuarios_update_fn() RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_update ON usuarios;
CREATE TRIGGER trg_usuarios_update
  BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION trg_usuarios_update_fn();


-- 2. SESSÕES
CREATE TABLE IF NOT EXISTS sessoes (
    id         TEXT        PRIMARY KEY,
    usuario_id BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ip         TEXT,
    user_agent TEXT,
    expira_em  TIMESTAMPTZ NOT NULL,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sess_usuario ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sess_expira  ON sessoes(expira_em);


-- 3. LOGS DE ACESSO
CREATE TABLE IF NOT EXISTS logs_acesso (
    id         BIGSERIAL   PRIMARY KEY,
    usuario_id BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    acao       TEXT        NOT NULL,
    ip         TEXT,
    user_agent TEXT,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_usuario ON logs_acesso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_log_criado  ON logs_acesso(criado_em);


-- 4. TENTATIVAS DE LOGIN (rate limiting)
CREATE TABLE IF NOT EXISTS tentativas_login (
    id        BIGSERIAL   PRIMARY KEY,
    ip        TEXT        NOT NULL,
    email     TEXT        NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tl_ip ON tentativas_login(ip, criado_em);


-- 5. ÁREAS DE ESTUDO
CREATE TABLE IF NOT EXISTS areas (
    id          BIGSERIAL   PRIMARY KEY,
    titulo      TEXT        NOT NULL,
    descricao   TEXT,
    tags        TEXT,
    icone       TEXT,
    ordem       INTEGER     NOT NULL DEFAULT 0,
    nivel_plano TEXT        NOT NULL DEFAULT 'free' CHECK(nivel_plano IN ('free','pro')),
    ativo       BOOLEAN     NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_area_ordem ON areas(ordem);
CREATE INDEX IF NOT EXISTS idx_area_ativo ON areas(ativo);


-- 6. TÓPICOS
CREATE TABLE IF NOT EXISTS topicos (
    id            BIGSERIAL   PRIMARY KEY,
    area_id       BIGINT      NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    titulo        TEXT        NOT NULL,
    conteudo      TEXT        NOT NULL,
    nota          TEXT,
    ordem         INTEGER     NOT NULL DEFAULT 0,
    ativo         BOOLEAN     NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_top_area  ON topicos(area_id);
CREATE INDEX IF NOT EXISTS idx_top_ordem ON topicos(ordem);

CREATE OR REPLACE FUNCTION trg_topicos_update_fn() RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_topicos_update ON topicos;
CREATE TRIGGER trg_topicos_update
  BEFORE UPDATE ON topicos FOR EACH ROW EXECUTE FUNCTION trg_topicos_update_fn();


-- 7. ITENS DO TÓPICO
CREATE TABLE IF NOT EXISTS topico_itens (
    id        BIGSERIAL PRIMARY KEY,
    topico_id BIGINT    NOT NULL REFERENCES topicos(id) ON DELETE CASCADE,
    texto     TEXT      NOT NULL,
    ordem     INTEGER   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_item_topico ON topico_itens(topico_id);


-- 8. PROGRESSO — TÓPICOS
CREATE TABLE IF NOT EXISTS progresso_topicos (
    id         BIGSERIAL   PRIMARY KEY,
    usuario_id BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    topico_id  BIGINT      NOT NULL REFERENCES topicos(id)  ON DELETE CASCADE,
    visto      BOOLEAN     NOT NULL DEFAULT FALSE,
    visto_em   TIMESTAMPTZ,
    revisao    BOOLEAN     NOT NULL DEFAULT FALSE,
    revisao_em TIMESTAMPTZ,
    UNIQUE(usuario_id, topico_id)
);

CREATE INDEX IF NOT EXISTS idx_pt_usuario ON progresso_topicos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pt_topico  ON progresso_topicos(topico_id);


-- 9. PROGRESSO — ÁREAS
CREATE TABLE IF NOT EXISTS progresso_areas (
    id             BIGSERIAL   PRIMARY KEY,
    usuario_id     BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id        BIGINT      NOT NULL REFERENCES areas(id)    ON DELETE CASCADE,
    topicos_vistos INTEGER     NOT NULL DEFAULT 0,
    total_topicos  INTEGER     NOT NULL DEFAULT 0,
    porcentagem    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    concluida      BOOLEAN     NOT NULL DEFAULT FALSE,
    ultimo_acesso  TIMESTAMPTZ,
    UNIQUE(usuario_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_pa_usuario ON progresso_areas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pa_area    ON progresso_areas(area_id);


-- 10. ANOTAÇÕES
CREATE TABLE IF NOT EXISTS anotacoes (
    id            BIGSERIAL   PRIMARY KEY,
    usuario_id    BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id       BIGINT      NOT NULL REFERENCES areas(id)    ON DELETE CASCADE,
    conteudo      TEXT        NOT NULL DEFAULT '',
    caracteres    INTEGER     NOT NULL DEFAULT 0,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(usuario_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_anot_usuario ON anotacoes(usuario_id);

CREATE OR REPLACE FUNCTION trg_anotacoes_update_fn() RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_anotacoes_update ON anotacoes;
CREATE TRIGGER trg_anotacoes_update
  BEFORE UPDATE ON anotacoes FOR EACH ROW EXECUTE FUNCTION trg_anotacoes_update_fn();


-- 11. QUESTÕES
CREATE TABLE IF NOT EXISTS questoes (
    id          BIGSERIAL PRIMARY KEY,
    area_id     BIGINT    NOT NULL REFERENCES areas(id)   ON DELETE CASCADE,
    topico_id   BIGINT    REFERENCES topicos(id)          ON DELETE SET NULL,
    enunciado   TEXT      NOT NULL,
    explicacao  TEXT,
    dificuldade TEXT      NOT NULL DEFAULT 'medio' CHECK(dificuldade IN ('facil','medio','dificil')),
    banca       TEXT,
    ano         INTEGER,
    ativo       BOOLEAN   NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quest_area   ON questoes(area_id);
CREATE INDEX IF NOT EXISTS idx_quest_topico ON questoes(topico_id);
CREATE INDEX IF NOT EXISTS idx_quest_ativo  ON questoes(ativo);


-- 12. OPÇÕES DAS QUESTÕES
CREATE TABLE IF NOT EXISTS questao_opcoes (
    id         BIGSERIAL PRIMARY KEY,
    questao_id BIGINT    NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    letra      TEXT      NOT NULL,
    texto      TEXT      NOT NULL,
    correta    BOOLEAN   NOT NULL DEFAULT FALSE,
    ordem      INTEGER   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_opcao_questao         ON questao_opcoes(questao_id);
CREATE INDEX IF NOT EXISTS idx_opcao_questao_correta ON questao_opcoes(questao_id, correta);


-- 13. SIMULADOS
CREATE TABLE IF NOT EXISTS simulados (
    id             BIGSERIAL   PRIMARY KEY,
    usuario_id     BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id        BIGINT      REFERENCES areas(id)             ON DELETE SET NULL,
    total_questoes INTEGER     NOT NULL DEFAULT 10,
    acertos        INTEGER     NOT NULL DEFAULT 0,
    erros          INTEGER     NOT NULL DEFAULT 0,
    porcentagem    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    tempo_segundos INTEGER     NOT NULL DEFAULT 0,
    concluido      BOOLEAN     NOT NULL DEFAULT FALSE,
    iniciado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    concluido_em   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sim_usuario   ON simulados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sim_area      ON simulados(area_id);
CREATE INDEX IF NOT EXISTS idx_sim_concluido ON simulados(concluido);


-- 14. RESPOSTAS DOS SIMULADOS
CREATE TABLE IF NOT EXISTS simulado_respostas (
    id            BIGSERIAL   PRIMARY KEY,
    simulado_id   BIGINT      NOT NULL REFERENCES simulados(id)      ON DELETE CASCADE,
    questao_id    BIGINT      NOT NULL REFERENCES questoes(id)       ON DELETE CASCADE,
    opcao_id      BIGINT      REFERENCES questao_opcoes(id)          ON DELETE SET NULL,
    correta       BOOLEAN     NOT NULL DEFAULT FALSE,
    tempo_ms      INTEGER     NOT NULL DEFAULT 0,
    respondido_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(simulado_id, questao_id)
);

CREATE INDEX IF NOT EXISTS idx_sr_simulado ON simulado_respostas(simulado_id);


-- 15. FAVORITOS — ARTIGOS DO VADE MECUM
CREATE TABLE IF NOT EXISTS favoritos_artigos (
    id         BIGSERIAL   PRIMARY KEY,
    usuario_id BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    artigo_id  BIGINT      NOT NULL,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(usuario_id, artigo_id)
);

CREATE INDEX IF NOT EXISTS idx_fav_usuario ON favoritos_artigos(usuario_id);


-- 16. PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
    id         BIGSERIAL   PRIMARY KEY,
    usuario_id BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plano      TEXT        NOT NULL,
    valor      DOUBLE PRECISION NOT NULL,
    status     TEXT        NOT NULL DEFAULT 'aprovado',
    metodo     TEXT        NOT NULL DEFAULT 'cartao',
    ultimos_4  TEXT,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pag_usuario ON pagamentos(usuario_id);


-- 17. VADE MECUM — CÓDIGO CIVIL
CREATE TABLE IF NOT EXISTS vade_partes (
    id         BIGSERIAL PRIMARY KEY,
    codigo     TEXT      NOT NULL,
    titulo     TEXT      NOT NULL,
    subtitulo  TEXT,
    range_arts TEXT,
    ordem      INTEGER   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vp_ordem ON vade_partes(ordem);

CREATE TABLE IF NOT EXISTS vade_capitulos (
    id       BIGSERIAL PRIMARY KEY,
    parte_id BIGINT    NOT NULL REFERENCES vade_partes(id) ON DELETE CASCADE,
    titulo   TEXT      NOT NULL,
    ordem    INTEGER   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vc_parte ON vade_capitulos(parte_id);

CREATE TABLE IF NOT EXISTS vade_artigos (
    id           BIGSERIAL PRIMARY KEY,
    capitulo_id  BIGINT    NOT NULL REFERENCES vade_capitulos(id) ON DELETE CASCADE,
    numero       TEXT      NOT NULL,
    caput        TEXT      NOT NULL DEFAULT '',
    mais_cobrado BOOLEAN   NOT NULL DEFAULT FALSE,
    nota         TEXT,
    ordem        INTEGER   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_va_capitulo ON vade_artigos(capitulo_id);
CREATE INDEX IF NOT EXISTS idx_va_numero   ON vade_artigos(numero);

CREATE TABLE IF NOT EXISTS vade_paragrafos (
    id        BIGSERIAL PRIMARY KEY,
    artigo_id BIGINT    NOT NULL REFERENCES vade_artigos(id) ON DELETE CASCADE,
    rotulo    TEXT      NOT NULL,
    texto     TEXT      NOT NULL,
    ordem     INTEGER   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vpar_artigo ON vade_paragrafos(artigo_id);

CREATE TABLE IF NOT EXISTS vade_incisos (
    id        BIGSERIAL PRIMARY KEY,
    artigo_id BIGINT    NOT NULL REFERENCES vade_artigos(id) ON DELETE CASCADE,
    rotulo    TEXT      NOT NULL,
    texto     TEXT      NOT NULL,
    ordem     INTEGER   NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_vinc_artigo ON vade_incisos(artigo_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- DADOS INICIAIS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO usuarios (nome, sobrenome, email, senha_hash, provider, plano, ativo, email_verificado)
VALUES ('Admin', 'Lex', 'admin@lexstudio.com',
        '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'local', 'anual', TRUE, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO areas (titulo, descricao, icone, ordem, nivel_plano) VALUES
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
('Prescrição e Decadência',        'Prazos, causas de suspensão, interrupção e impedimento.',                                       '⏳',  12, 'pro')
ON CONFLICT DO NOTHING;
