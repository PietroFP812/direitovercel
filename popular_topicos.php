<?php
// popular_topicos.php — Popula o banco com tópicos de Direito Civil
// Execute UMA VEZ. Limpa e reinicia todos os tópicos.

$allowedIPs = ['127.0.0.1', '::1'];
$adminKey   = getenv('LEX_ADMIN_KEY') ?: 'lex-admin-2024';
$keyOk      = isset($_GET['key']) && $_GET['key'] === $adminKey;
if (!in_array($_SERVER['REMOTE_ADDR'], $allowedIPs) && !$keyOk) {
    http_response_code(403);
    exit('<p style="font-family:sans-serif;padding:20px">403 — Acesso restrito.</p>');
}

set_time_limit(120);
require_once __DIR__ . '/api/config/db.php';
header('Content-Type: text/html; charset=utf-8');
?><!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Popular Tópicos — Lex Studio</title>
<style>
  body { background:#0d0d0f; color:#ccc; font-family:monospace; font-size:13px; padding:24px; line-height:1.6 }
  h2   { color:#c9a84c; border-bottom:1px solid #333; padding-bottom:8px }
  .ok  { color:#4caf50 } .err { color:#f44336 } .info { color:#29b6f6 }
  pre  { margin:2px 0 }
</style></head><body>
<h2>📚 Popular Tópicos — Lex Studio</h2>
<?php

function out(string $msg, string $cls = ''): void {
    $tag = $cls ? "<pre class=\"$cls\">" : '<pre>';
    echo $tag . htmlspecialchars($msg) . "</pre>\n";
    flush(); ob_flush();
}

$pdo = getDB();

// Limpa tabelas (cascade cuida dos itens)
$pdo->exec('DELETE FROM progresso_topicos');
$pdo->exec('DELETE FROM progresso_areas');
$pdo->exec('DELETE FROM topico_itens');
$pdo->exec('DELETE FROM topicos');
out('🗑  Tópicos, itens e progresso anteriores removidos.', 'info');

// ─── ESTRUTURA ────────────────────────────────────────────────────────────────
// Cada entrada: [ area_id, titulo, conteudo, nota, [ item1, item2, ... ] ]
// A ORDEM aqui define os topico_ids no banco — deve ser idêntica ao JS.
// ─────────────────────────────────────────────────────────────────────────────

$topicos = [

// ── ÁREA 1: Parte Geral ──────────────────────────────────────────────────────
[1, 'Das Pessoas Naturais',
 'A personalidade civil da pessoa natural começa com o nascimento com vida, protegendo-se os direitos do nascituro desde a concepção.',
 'Atenção: com o Estatuto da Pessoa com Deficiência (Lei 13.146/2015), a incapacidade absoluta ficou restrita aos menores de 16 anos.',
 [
   'Início e fim da personalidade — art. 1º e 6º CC',
   'Capacidade de direito (de gozo) vs. capacidade de fato (de exercício)',
   'Incapacidade absoluta: menores de 16 anos — art. 3º',
   'Incapacidade relativa: maiores de 16 e menores de 18, pródigos, ébrios habituais — art. 4º',
   'Emancipação: voluntária, judicial e legal',
   'Domicílio: conceito, pluralidade e domicílio profissional',
   'Direitos da personalidade: irrenunciáveis, intransmissíveis, extrapatrimoniais',
 ]
],
[1, 'Das Pessoas Jurídicas',
 'Entidades distintas dos membros que as compõem, dotadas de personalidade e patrimônio próprios.',
 'Art. 50 — Desconsideração: desvio de finalidade ou confusão patrimonial.',
 [
   'Pessoas jurídicas de direito público: interno (União, Estados, DF, Municípios) e externo',
   'Pessoas jurídicas de direito privado: associações, sociedades, fundações, EIRELI, partidos, organizações religiosas',
   'Início: registro do ato constitutivo',
   'Desconsideração da personalidade jurídica: teoria maior e menor',
   'Grupos despersonalizados: espólio, massa falida, condomínio',
 ]
],
[1, 'Dos Bens Jurídicos',
 'Classificação essencial para determinar o regime aplicável a cada bem.',
 'Regra: acessório segue o principal (art. 92).',
 [
   'Móveis × Imóveis — critério jurídico (art. 79-84)',
   'Bens fungíveis × infungíveis; consumíveis × inconsumíveis',
   'Divisíveis × indivisíveis; singulares × coletivos',
   'Bens públicos: uso comum, uso especial, dominicais',
   'Bens fora do comércio: extracomercialidade',
   'Pertenças × acessórios × partes integrantes',
 ]
],
[1, 'Do Negócio Jurídico',
 'Manifestação de vontade destinada a produzir efeitos jurídicos.',
 'A simulação causa nulidade absoluta (art. 167). Os demais vícios sociais causam anulabilidade.',
 [
   'Elementos essenciais: agente capaz, objeto lícito, determinado ou determinável, forma prescrita ou não defesa em lei',
   'Vícios do consentimento: erro, dolo, coação, estado de perigo, lesão',
   'Vícios sociais: simulação e fraude contra credores',
   'Invalidade: nulidade absoluta × anulabilidade',
   'Interpretação dos negócios: boa-fé objetiva',
   'Condição, termo e encargo (modo)',
 ]
],
[1, 'Da Prescrição e Decadência',
 'Limitação temporal ao exercício de direitos.',
 'Decadência legal não admite suspensão ou interrupção (art. 207).',
 [
   'Prescrição: extingue a pretensão (não o direito subjetivo)',
   'Decadência: extingue o próprio direito potestativo',
   'Prazo geral prescricional: 10 anos (art. 205)',
   'Prazos especiais: 5, 4, 3, 2, 1 anos — art. 206',
   'Causas de impedimento, suspensão e interrupção',
   'Prescrição não pode ser renunciada antecipadamente',
 ]
],

// ── ÁREA 2: Obrigações ────────────────────────────────────────────────────────
[2, 'Modalidades das Obrigações',
 'Classificação das obrigações quanto ao objeto e ao sujeito.',
 'Nas obrigações de dar coisa certa: "a coisa perece para o dono" (res perit domino).',
 [
   'De dar coisa certa, de dar coisa incerta, de fazer, de não fazer',
   'Obrigações divisíveis × indivisíveis',
   'Solidariedade ativa e passiva — não se presume (art. 265)',
   'Obrigações alternativas: escolha pertence ao devedor, salvo convenção em contrário',
   'Obrigações facultativas: objeto único, mas devedor pode substituir',
 ]
],
[2, 'Adimplemento e Extinção',
 'Formas de satisfação e extinção do vínculo obrigacional.',
 'Pagamento feito a credor incapaz ou de má-fé não exonera o devedor (art. 310).',
 [
   'Pagamento: pagamento indevido gera obrigação de restituir',
   'Consignação em pagamento: recusa injusta ou impossibilidade de pagar ao credor',
   'Sub-rogação: legal e convencional',
   'Dação em pagamento, novação, compensação, confusão, remissão',
   'Lugar e tempo do pagamento: quérable × portable',
 ]
],
[2, 'Inadimplemento',
 'Responsabilidade pelo descumprimento da obrigação.',
 'A cláusula penal não pode exceder o valor da obrigação principal (art. 412).',
 [
   'Mora do devedor: retardamento culposo (mora solvendi)',
   'Mora do credor: recusa injustificada (mora accipiendi)',
   'Cláusula penal: moratória × compensatória',
   'Arras: confirmatórias × penitenciais',
   'Perdas e danos: dano emergente + lucros cessantes',
   'Caso fortuito e força maior como excludentes',
 ]
],

// ── ÁREA 3: Contratos ─────────────────────────────────────────────────────────
[3, 'Princípios Contratuais',
 'Pilares que orientam a interpretação e execução dos contratos.',
 'CDC afasta a força obrigatória quando houver desequilíbrio + CDC prevalece sobre CC nas relações de consumo.',
 [
   'Autonomia da vontade / autonomia privada',
   'Boa-fé objetiva: art. 422 — nas fases pré, durante e pós-contratual',
   'Função social do contrato: art. 421',
   'Relatividade dos efeitos: res inter alios acta',
   'Força obrigatória (pacta sunt servanda) × revisão judicial (rebus sic stantibus)',
   'Equilíbrio contratual e vedação ao enriquecimento sem causa',
 ]
],
[3, 'Formação do Contrato',
 'Da proposta até a aceitação e o vínculo obrigacional.',
 'Proposta com prazo vincula o proponente durante o prazo.',
 [
   'Proposta (oferta): vinculante ao proponente',
   'Aceitação: deve ser tempestiva e sem modificações',
   'Contratos entre ausentes: teoria da expedição (art. 434)',
   'Pré-contrato (contrato preliminar): art. 462-466',
   'Contrato de adesão: interpretação favorável ao aderente',
 ]
],
[3, 'Extinção do Contrato',
 'Causas de dissolução do vínculo contratual.',
 'Para resolução por onerosidade excessiva, o fato deve ser extraordinário, imprevisível e superveniente.',
 [
   'Resolução: inadimplemento voluntário ou involuntário',
   'Resilição: distrato (bilateral) ou denúncia (unilateral)',
   'Rescisão: nomenclatura popular (lesão enorme no CC)',
   'Resolução por onerosidade excessiva: teoria da imprevisão — art. 478',
   'Exceção do contrato não cumprido (exceptio non adimpleti contractus) — art. 476',
 ]
],
[3, 'Contratos em Espécie',
 'Principais contratos típicos previstos no Código Civil.',
 'Fiança não admite interpretação extensiva (art. 819).',
 [
   'Compra e venda: obrigações do vendedor e comprador, evicção, vícios redibitórios',
   'Doação: modalidades, restrições, revogação',
   'Locação de coisas (regra CC; imóveis urbanos — Lei 8.245/91)',
   'Mútuo: gratuito vs. oneroso; mútuo feneratício',
   'Mandato: representação, revogação, substabelecimento',
   'Fiança: subsidiária, acessória, interpretação estrita',
   'Seguro: interesse segurável, agravamento de risco',
 ]
],

// ── ÁREA 4: Responsabilidade Civil ───────────────────────────────────────────
[4, 'Pressupostos da Responsabilidade',
 'Elementos necessários para configurar o dever de indenizar.',
 'CDC adota responsabilidade objetiva como regra para relações de consumo.',
 [
   'Conduta humana (ação ou omissão)',
   'Culpa ou dolo — para responsabilidade subjetiva',
   'Nexo de causalidade',
   'Dano: material, moral, estético, existencial',
   'Responsabilidade objetiva: dispensa culpa (teoria do risco)',
   'Atividade de risco normal: art. 927, parágrafo único',
 ]
],
[4, 'Excludentes e Redutores',
 'Causas que afastam ou reduzem a responsabilidade civil.',
 'No risco integral (dano ambiental, dano nuclear), não há excludentes.',
 [
   'Caso fortuito e força maior',
   'Culpa exclusiva da vítima',
   'Fato de terceiro',
   'Exercício regular de direito e legítima defesa',
   'Culpa concorrente: reduz proporcional indenização (art. 945)',
   'Cláusula de não indenizar: válida entre iguais, nula no CDC',
 ]
],
[4, 'Dano Moral',
 'Lesão a direitos da personalidade e sua reparação.',
 'Súmula 37 STJ: são cumuláveis as indenizações por dano material e moral.',
 [
   'Dano moral in re ipsa: dispensa prova do sofrimento',
   'Critérios para arbitramento: extensão do dano, grau de culpa, condição econômica',
   'Função: reparatória + punitiva + preventiva (punitive damages)',
   'Cumulação: dano moral + dano material + dano estético',
   'Dano moral coletivo: interesses difusos',
 ]
],

// ── ÁREA 5: Direito das Coisas ───────────────────────────────────────────────
[5, 'Posse',
 'Poder de fato exercido sobre bem com ânimo de dono ou não.',
 'Posse nova (até 1 ano e dia): procedimento possessório com liminar. Posse velha: procedimento ordinário.',
 [
   'Teorias: subjetiva (Savigny) vs. objetiva (Ihering) — CC adota objetiva',
   'Composse, posse direta × indireta',
   'Classificações: justa × injusta; de boa-fé × má-fé',
   'Efeitos: percepção de frutos, indenização por benfeitorias, usucapião',
   'Ações possessórias: reintegração, manutenção, interdito proibitório',
   'Interditos e o princípio da função social da posse',
 ]
],
[5, 'Propriedade',
 'Direito real mais amplo: usar, gozar, dispor e reivindicar.',
 'Usucapião extrajudicial: via cartório, procedimento mais ágil (CPC/2015 + provimento CNJ).',
 [
   'Função social da propriedade: arts. 5º, XXIII CF e 1.228 CC',
   'Propriedade resolúvel × fiduciária',
   'Limitações ao direito de propriedade: direito de vizinhança',
   'Descoberta (achado de coisa perdida) — art. 1.233',
   'Usucapião: ordinária (10a), extraordinária (15/10a), especial rural (5a), urbana (5a), familiar (2a)',
   'Aquisição derivada: registro — princípio da fé pública registral',
 ]
],
[5, 'Direitos Reais de Garantia',
 'Penhor, hipoteca e anticrese.',
 'Hipoteca: prazo máximo de 30 anos. Pode haver hipotecas de 1º, 2º e 3º graus.',
 [
   'Penhor: bens móveis; possibilita transferência da posse',
   'Hipoteca: bens imóveis, navios e aeronaves; não transfere posse',
   'Alienação fiduciária: propriedade resolúvel para garantia (Lei 9.514/97)',
   'Anticrese: entrega do bem para percepção de frutos',
   'Princípios: especialidade, publicidade, indivisibilidade',
 ]
],

// ── ÁREA 6: Família ───────────────────────────────────────────────────────────
[6, 'Casamento',
 'Instituição formalizadora da família conjugal.',
 'Separação obrigatória de bens: maiores de 70 anos — Súmula 377 STF aplica a comunicação de aquestos.',
 [
   'Requisitos: capacidade, livre consentimento, forma',
   'Impedimentos matrimoniais: art. 1.521 (absolutos)',
   'Causas suspensivas: art. 1.523 (relativas)',
   'Regimes de bens: comunhão parcial (supletivo), comunhão universal, separação e participação final nos aquestos',
   'Pacto antenupcial: forma pública, eficácia com casamento',
   'Casamento putativo: efeitos para cônjuge de boa-fé',
 ]
],
[6, 'Dissolução da Família',
 'Fim do vínculo conjugal e suas consequências.',
 'União estável: convivência pública, contínua, duradoura e com objetivo de constituir família (art. 1.723).',
 [
   'Divórcio: EC 66/2010 — sem prazo nem causa, direto',
   'Divórcio consensual e litigioso',
   'Alimentos: natureza, características, ação de alimentos',
   'Guarda compartilhada: regra; guarda unilateral: exceção',
   'Alienação parental: Lei 12.318/2010',
   'Bem de família: impenhorabilidade — Lei 8.009/90',
 ]
],
[6, 'Filiação e Parentesco',
 'Vínculo jurídico entre pais e filhos.',
 'Multiparentalidade: STF RE 898.060 — reconhecida a parentalidade socioafetiva sem excluir a biológica.',
 [
   'Igualdade absoluta entre filhos — art. 227 §6º CF',
   'Reconhecimento voluntário e judicial da paternidade',
   'Ação negatória de paternidade e presunção pater is est',
   'Adoção: ECA + CC; cria parentesco civil',
   'Poder familiar: deveres e limitações',
   'Parentesco: consanguíneo, afim, civil; linha reta e colateral',
 ]
],

// ── ÁREA 7: Sucessões ─────────────────────────────────────────────────────────
[7, 'Sucessão Legítima',
 'Herança transmitida por força de lei, na ausência ou parcialidade de testamento.',
 'Companheiro: STF RE 878.694 — mesmos direitos sucessórios do cônjuge.',
 [
   'Ordem de vocação hereditária: descendentes > ascendentes > cônjuge > colaterais',
   'Cônjuge sobrevivente: concorre com descendentes e ascendentes',
   'Regime de bens e direito à herança do cônjuge',
   'Direito de representação: na linha reta descendente e colaterais até 3º grau',
   'Indignidade e deserdação: casos e efeitos',
   'Herança jacente × vacante',
 ]
],
[7, 'Testamento',
 'Ato de última vontade que dispõe sobre o patrimônio.',
 'Testemunha não pode ser herdeiro nem legatário do testador (art. 1.801).',
 [
   'Formas ordinárias: público, cerrado, particular',
   'Formas especiais: marítimo, aeronáutico, militar',
   'Herdeiro necessário: quota indisponível (legítima) = 50%',
   'Legado: disposição a título particular',
   'Substituição testamentária e fideicomisso',
   'Codicilo: para atos de pequena monta',
 ]
],
[7, 'Inventário e Partilha',
 'Procedimento de arrecadação e distribuição da herança.',
 'Inventário extrajudicial: exige consenso dos herdeiros capazes + ausência de testamento.',
 [
   'Abertura da sucessão: morte real ou presumida',
   'Prazo para abertura do inventário: 60 dias da abertura',
   'Inventário judicial × extrajudicial (cartório)',
   'Meação × herança: distinção essencial',
   'Sobrepartilha: bens descobertos após partilha',
   'Colação: bens doados em vida que devem ser conferidos',
 ]
],

// ── ÁREA 8: Direito Empresarial ───────────────────────────────────────────────
[8, 'Empresário e Estabelecimento',
 'Conceito e elementos da empresa no direito privado.',
 'MEI — Microempreendedor Individual: faturamento até R$ 81k; um empregado.',
 [
   'Empresário: quem exerce profissionalmente atividade econômica organizada — art. 966',
   'Não empresários: profissões intelectuais, atividades rurais (salvo registro)',
   'Estabelecimento empresarial: complexo de bens',
   'Fundo de empresa (aviamento) e clientela',
   'Registro público de empresas: JUCEC/Juntas Comerciais',
   'Prepostos e representantes do empresário',
 ]
],
[8, 'Sociedades Empresárias',
 'Tipos societários e suas características.',
 'S/A aberta: ações negociadas em bolsa ou balcão; regulada pela CVM.',
 [
   'Sociedade simples × sociedade empresária',
   'Sociedade em nome coletivo: todos respondem ilimitadamente',
   'Sociedade limitada (Ltda): quota social; responsabilidade limitada',
   'Sociedade anônima (S/A): capital em ações; Lei 6.404/76',
   'Sociedade em comandita simples e por ações',
   'Dissolução: total × parcial (resolução da sociedade em relação a um sócio)',
 ]
],

// ── ÁREA 9: Direito do Consumidor ────────────────────────────────────────────
[9, 'Conceitos e Princípios',
 'Fundamentos do direito consumerista.',
 'Prazo decadencial CDC: 30 dias (produto/serviço não duráveis) / 90 dias (duráveis).',
 [
   'Consumidor: destinatário final (teoria finalista × maximalista)',
   'Fornecedor: atividade habitual no mercado de consumo',
   'Vulnerabilidade: técnica, jurídica, fática, informacional',
   'Princípio da boa-fé objetiva e da transparência',
   'Inversão do ônus da prova: art. 6º, VIII',
   'Desconsideração da PJ: teoria menor do CDC (art. 28 §5º)',
 ]
],
[9, 'Responsabilidade do Fornecedor',
 'Vícios e defeitos nos produtos e serviços.',
 'Prescrição da pretensão de reparação de danos: 5 anos (art. 27 CDC).',
 [
   'Fato do produto/serviço (acidente de consumo): responsabilidade objetiva',
   'Vício do produto/serviço: inadequação para uso',
   'Responsabilidade solidária de todos os fornecedores da cadeia',
   'Recall: dever de retirar produto perigoso do mercado',
   'Excludentes: culpa exclusiva do consumidor ou de terceiro; caso fortuito externo',
 ]
],

// ── ÁREA 10: Direito Internacional Privado ────────────────────────────────────
[10, 'LINDB e Regras de Conexão',
 'Lei de Introdução às Normas do Direito Brasileiro.',
 'Tratados internacionais prevalecem sobre a LINDB quando ratificados pelo Brasil.',
 [
   'Estatuto pessoal: lei do domicílio (Brasil) — art. 7º LINDB',
   'Qualificações e lei aplicável aos bens: lei do lugar (lex rei sitae)',
   'Obrigações: lei do lugar de constituição',
   'Sucessão: lei do domicílio do falecido; salvo bens no Brasil e herdeiros brasileiros',
   'Exceção de ordem pública: não aplicação de lei estrangeira ofensiva',
   'Fraude à lei: simulação de elemento de conexão',
 ]
],

// ── ÁREA 11: Fatos e Negócios Jurídicos ──────────────────────────────────────
[11, 'Fatos Jurídicos e Negócio Jurídico',
 'Fato jurídico é todo acontecimento que produz efeitos no mundo do Direito. O negócio jurídico é a espécie mais importante, caracterizado pela manifestação de vontade destinada a criar, modificar ou extinguir relações jurídicas.',
 'A escada ponteana (Pontes de Miranda) distingue os planos de existência, validade e eficácia — invalidade não implica necessariamente ineficácia.',
 [
   'Fato jurídico em sentido amplo: natural (stricto sensu) e humano (ato jurídico/negócio)',
   'Negócio jurídico: declaração de vontade + finalidade negocial — bilateral, unilateral ou plurilateral',
   'Plano da existência: elementos — agente, vontade, objeto, forma',
   'Plano da validade (art. 104 CC): agente capaz, objeto lícito/possível/determinável, forma prescrita',
   'Plano da eficácia: produção de efeitos — pode ser modulada por condição, termo ou encargo',
   'Interpretação: art. 112 CC — intenção das partes prevalece sobre literalidade',
   'Silêncio: importa anuência quando as circunstâncias e usos o autorizarem — art. 111',
 ]
],
[11, 'Condição, Termo e Encargo',
 'Elementos acidentais que modulam a eficácia do negócio jurídico.',
 'Condição puramente potestativa ("se eu quiser") é nula. Condição simplesmente potestativa (depende também de fato externo) é válida.',
 [
   'Condição: cláusula que subordina o efeito do negócio a evento futuro e incerto — suspensiva ou resolutiva',
   'Condição suspensiva: impede a aquisição do direito até que se implemente',
   'Condição resolutiva: implementada, resolve o direito já adquirido',
   'Condições proibidas: perplexas, puramente potestativas ilícitas, ilícitas — tornam o negócio nulo',
   'Termo: evento futuro e certo — inicial (dies a quo) ou final (dies ad quem)',
   'Encargo (modo): ônus imposto ao beneficiário de liberalidade — não impede aquisição, mas permite resolução',
   'Distinção: encargo ≠ condição suspensiva — encargo não suspende, apenas grava',
 ]
],
[11, 'Vícios da Vontade',
 'Defeitos que comprometem a manifestação de vontade, tornando o negócio anulável.',
 'Simulação é vício social, não vício da vontade — gera nulidade (art. 167), não anulabilidade. O negócio dissimulado pode ser válido se substancialmente lícito.',
 [
   'Erro: falsa representação da realidade — substancial (anula) × acidental (não anula)',
   'Dolo: induzimento malicioso ao erro — principal (anula) × acidental (perdas e danos)',
   'Coação: violência moral — absoluta (ato inexistente) ou relativa (anulável)',
   'Estado de perigo: assunção de obrigação onerosa para salvar-se — art. 156',
   'Lesão: desproporção por inexperiência ou necessidade — art. 157',
   'Fraude contra credores: negócio em prejuízo de credores — ação pauliana (anulação)',
   'Simulação: divergência intencional entre vontade real e declarada — nulidade absoluta',
 ]
],
[11, 'Invalidade do Negócio Jurídico',
 'Consequências jurídicas da violação dos requisitos de validade.',
 'Convalidação: o negócio anulável pode ser confirmado expressa ou tacitamente pelo interessado — art. 172. A confirmação não precisa ser expressa.',
 [
   'Nulidade absoluta (art. 166): objeto ilícito, forma preterida, motivo ilícito comum, simulação',
   'Nulidade relativa (anulabilidade): protege interesse particular — agente relativamente incapaz, vícios da vontade',
   'Nulidade: declarada de ofício, insuscetível de confirmação, imprescritível',
   'Anulabilidade: alegada pelo interessado, admite confirmação, sujeita a prazo decadencial (4 anos em regra)',
   'Conversão substancial: negócio nulo converte-se em válido se preencher requisitos de outro — art. 170',
   'Redução: nulidade parcial não contamina a parte válida — art. 184',
   'Prazo decadencial: 4 anos para coação; 2 anos para demais vícios — art. 178',
 ]
],

// ── ÁREA 12: Prescrição e Decadência ─────────────────────────────────────────
[12, 'Prescrição — Conceito e Natureza',
 'A prescrição extingue a pretensão (poder de exigir em juízo) decorrente da violação de um direito subjetivo.',
 'Prescrição × decadência: prescrição extingue a pretensão (direito de ação); decadência extingue o próprio direito. A confusão entre os institutos é tema frequente em prova.',
 [
   'Pretensão: direito de exigir de outrem ação ou omissão — nasce com a violação do direito',
   'Prazo geral: 10 anos (art. 205) — quando a lei não fixar prazo menor',
   'Prescrição não extingue o direito, apenas a pretensão — pagamento espontâneo é válido',
   'Renúncia à prescrição: somente após consumada; expressa ou tácita — art. 191',
   'O juiz pode conhecer a prescrição de ofício (art. 193 — após reforma de 2006)',
   'Reconhecimento pelo devedor: causa interrupção — art. 202, VI',
   'Prescrição intercorrente: corre no curso do processo quando paralisado por inércia do autor',
 ]
],
[12, 'Causas de Impedimento e Suspensão',
 'Situações que paralisam temporariamente o curso do prazo prescricional.',
 'Impedimento e suspensão têm o mesmo efeito prático — o prazo para ou recomeça do ponto onde estava. Diferem apenas no momento: impedimento ocorre antes do início; suspensão, durante.',
 [
   'Impedimento: prazo ainda não começou a fluir — ex: entre cônjuges na constância do casamento',
   'Suspensão: prazo já iniciado paralisa e retoma de onde parou — arts. 197-201',
   'Entre cônjuges e companheiros: suspensão na constância da união',
   'Absolutamente incapazes: não corre prescrição — art. 198, I',
   'Ausentes do país em serviço público: suspensão',
   'Pendência de condição suspensiva ou ação de evicção: suspensão',
   'Herdeiro contra espólio: suspensão enquanto durar a administração do inventariante',
 ]
],
[12, 'Causas de Interrupção da Prescrição',
 'A interrupção apaga o prazo já transcorrido — recomeça a contagem do zero.',
 'Citação inválida ainda assim interrompe a prescrição se o devedor foi de qualquer modo cientificado (art. 202, parágrafo único CC).',
 [
   'Citação válida: principal causa — art. 202, I; notificação ou interpelação judicial equivalem',
   'Protesto cambial: interrompe para o devedor protestado',
   'Reconhecimento da dívida pelo devedor: expresso ou tácito — art. 202, VI',
   'Ato judicial que constitua em mora o devedor',
   'Interrupção é pessoal: aproveita e prejudica apenas quem a promoveu (salvo solidariedade)',
   'Pode ocorrer uma única vez — art. 202',
   'Na solidariedade: interrupção contra um devedor solidário aproveita aos demais credores',
 ]
],
[12, 'Decadência',
 'Extinção do próprio direito potestativo pelo decurso do tempo sem exercício.',
 'Distinção fundamental: prescrição atinge a pretensão (direito de ação) — decadência atinge o próprio direito. A decadência "mata" o direito; a prescrição "paralisa" a pretensão.',
 [
   'Decadência extingue o direito (não apenas a pretensão) — ex: direito de anular negócio, de revogar doação',
   'Decadência legal: pode ser conhecida de ofício pelo juiz — art. 210',
   'Decadência convencional: não pode ser conhecida de ofício; renúncia admitida — art. 211',
   'Não se aplicam impedimento nem interrupção à decadência legal (regra geral)',
   'Prazos de anulabilidade são decadenciais: 4 anos (coação), 2 anos (outros vícios)',
   'Prazo para rescindir partilha por dolo: 1 ano — art. 657',
   'Reconhecimento do direito pelo devedor não interrompe decadência (diferente da prescrição)',
 ]
],

]; // fim $topicos

// ─── INSERÇÃO ─────────────────────────────────────────────────────────────────
$pdo->beginTransaction();
$insTop  = $pdo->prepare("INSERT INTO topicos (area_id, titulo, conteudo, nota, ordem) VALUES (?,?,?,?,?)");
$insItem = $pdo->prepare("INSERT INTO topico_itens (topico_id, texto, ordem) VALUES (?,?,?)");

$totalTop = 0; $totalItems = 0;
$ordemPorArea = [];

foreach ($topicos as $t) {
    [$area_id, $titulo, $conteudo, $nota, $itens] = $t;
    $ordemPorArea[$area_id] = ($ordemPorArea[$area_id] ?? 0) + 1;
    $insTop->execute([$area_id, $titulo, $conteudo, $nota, $ordemPorArea[$area_id]]);
    $topico_id = (int)$pdo->lastInsertId();
    foreach ($itens as $ord => $texto) {
        $insItem->execute([$topico_id, $texto, $ord + 1]);
        $totalItems++;
    }
    $totalTop++;
    out("  ✓ [Área $area_id] #$topico_id — $titulo", 'ok');
}

$pdo->commit();

out('', '');
out("✅ $totalTop tópicos inseridos, $totalItems itens.", 'ok');
out('', '');

// Verifica mapeamento JS × DB
out('── Verificação de IDs (deve bater com o JS) ─────────────────', 'info');
$check = $pdo->query('SELECT id, area_id, titulo FROM topicos ORDER BY id')->fetchAll(PDO::FETCH_ASSOC);
foreach ($check as $r) {
    out("  topico_id={$r['id']}  area_id={$r['area_id']}  {$r['titulo']}");
}
?>
</body></html>
