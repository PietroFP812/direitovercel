# Lex Studio

Plataforma de estudos de **Direito Civil** desenvolvida como TCC do semestre 2026.1.

---

## Estrutura do Projeto

```
lex-studio/
│
├── index.html                  ← Landing page (hero, recursos, planos, login/cadastro)
│
├── app/
│   ├── home.html               ← Painel principal (boas-vindas, progresso, atalhos)
│   ├── estudar.html            ← Módulo de estudo (12 áreas, 37 tópicos, revisão rápida)
│   ├── simulados.html          ← Simulados com timer, gabarito comentado e histórico
│   └── vade.html               ← Vade Mecum completo do CC/2002 (2.082 artigos)
│
└── api/
    ├── config/
    │   ├── db.php              ← Conexão PDO/SQLite + criação automática do banco
    │   └── helpers.php         ← Auth, respondOk(), respondError()
    ├── auth/                   ← Login, cadastro, logout, perfil
    ├── areas/                  ← Listagem de áreas + tópicos com progresso individual
    ├── anotacoes/              ← CRUD de anotações por área/usuário
    ├── progresso/              ← Progresso por área (tópicos vistos, % concluída)
    ├── simulados/              ← Questões, iniciar/finalizar simulado, histórico
    ├── vade/                   ← Estrutura, artigos (lazy), busca, favoritos
    └── ia/                     ← Proxy IA (desativado — sem chave configurada)
```

---

## Stack

| Camada     | Tecnologia                          |
|------------|-------------------------------------|
| Frontend   | HTML5 + CSS3 + JavaScript (vanilla) |
| Backend    | PHP 8.x                             |
| Banco      | SQLite via PDO                      |
| Servidor   | XAMPP (Apache)                      |
| Fonte      | Playfair Display + Libre Baskerville + JetBrains Mono |

---

## Como rodar localmente

**Pré-requisito:** XAMPP instalado com Apache ativo.

1. Clone/copie a pasta em `C:\xampp\htdocs\lex-studio\`
2. Inicie o Apache no XAMPP Control Panel
3. Acesse: **http://localhost/lex-studio/**

O banco SQLite (`lex_studio.db`) é criado automaticamente na primeira requisição à API.
Para popular com dados iniciais, acesse uma vez:

```
http://localhost/lex-studio/popular_topicos.php
http://localhost/lex-studio/popular_questoes.php
```

---

## Conteúdo atual

| Item                    | Quantidade |
|-------------------------|------------|
| Áreas (Direito Civil)   | 12         |
| Tópicos com teoria      | 37         |
| Itens (bullet points)   | 224        |
| Casos práticos          | 74 (2/tópico) |
| Questões de simulado    | 69         |
| Artigos do CC/2002      | 2.082      |

### Áreas disponíveis

1. Parte Geral — Pessoas e Bens
2. Obrigações
3. Contratos
4. Responsabilidade Civil
5. Direito das Coisas
6. Direito de Família
7. Direito das Sucessões
8. Direito Empresarial
9. Direito do Consumidor
10. Direito Internacional Privado
11. Fatos e Negócios Jurídicos
12. Prescrição e Decadência

---

## Autenticação

- Token salvo em `localStorage` como `lex_token`
- Cookie de sessão `lex_session` (httpOnly)
- Usuário: `{ id, nome, sobrenome, email, plano, tema }`
- Cada página HTML possui seu próprio cliente de API inline (sem framework)

---

## Notas de arquitetura

- **Conteúdo teórico** dos tópicos está hardcoded no array `classes` em `estudar.html` — não vem da API
- **Progresso individual** de tópico é calculado como ID sequencial: `sum(tópicos de áreas anteriores) + topicIdx + 1`
- **Vade Mecum** usa lazy-load via `IntersectionObserver` — artigos carregados por parte sob demanda
- Cada página HTML é autônoma (auth, API client e styles inline) — sem bundler ou framework

---

## Fluxo de Navegação

```
index.html  ──(login)──►  app/home.html
                                │
                    ┌───────────┼────────────┐
                    ▼           ▼            ▼
             estudar.html  simulados.html  vade.html
```
