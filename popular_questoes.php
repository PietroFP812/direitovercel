<?php
// popular_questoes.php — Popula o banco com questões para os simulados
// Acesse: http://localhost/lex-studio/popular_questoes.php
// Execute UMA VEZ (ou novamente para resetar o banco de questões).

// Proteção: somente localhost ou com senha
$allowedIPs = ['127.0.0.1', '::1'];
$adminKey   = getenv('LEX_ADMIN_KEY') ?: 'lex-admin-2024';
$keyOk      = isset($_GET['key']) && $_GET['key'] === $adminKey;
if (!in_array($_SERVER['REMOTE_ADDR'], $allowedIPs) && !$keyOk) {
    http_response_code(403);
    exit('<p style="font-family:sans-serif;padding:20px">403 — Acesso restrito. Adicione <code>?key=SEU_ADMIN_KEY</code> ou acesse via localhost.</p>');
}

set_time_limit(120);
require_once __DIR__ . '/api/config/db.php';
header('Content-Type: text/html; charset=utf-8');
?><!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Popular Questões — Lex Studio</title>
<style>
  body { background:#0d0d0d; color:#ccc; font-family:monospace; font-size:13px; padding:24px; line-height:1.6 }
  h2   { color:#c9a84c; border-bottom:1px solid #333; padding-bottom:8px }
  .ok  { color:#4caf50 } .err { color:#f44336 } .info { color:#29b6f6 }
  pre  { margin:2px 0 }
</style></head><body>
<h2>📚 Popular Banco de Questões — Lex Studio</h2>
<?php

function out(string $msg, string $cls = ''): void {
    $tag = $cls ? "<pre class=\"$cls\">" : '<pre>';
    echo $tag . htmlspecialchars($msg) . "</pre>\n";
    flush(); ob_flush();
}

$pdo = getDB();

// Limpa banco de questões anterior
$pdo->exec('DELETE FROM questao_opcoes');
$pdo->exec('DELETE FROM questoes');
out('🗑  Questões anteriores removidas.', 'info');

// [ area_id, enunciado, explicacao, dificuldade, [ [letra, texto, correta(bool)], ... ] ]
$banco = [

// ── ÁREA 1: Parte Geral — Pessoas e Bens ─────────────────────────────────────
[1,'A personalidade civil da pessoa natural começa:',
 'Art. 1º CC — a personalidade começa com o nascimento com vida, embora os direitos do nascituro sejam protegidos desde a concepção.','facil',
 [['A','Com a concepção',0],['B','Com o nascimento com vida',1],['C','Com o registro civil',0],['D','Aos 16 anos completos',0]]],

[1,'Após o Estatuto da Pessoa com Deficiência (Lei 13.146/2015), são absolutamente incapazes apenas:',
 'A reforma de 2015 restringiu a incapacidade absoluta aos menores de 16 anos; todas as demais situações anteriores (ébrios, viciados, deficientes) passaram para incapacidade relativa ou foram suprimidas.','medio',
 [['A','Os maiores de 16 e menores de 18 anos',0],['B','Os menores de 16 anos',1],['C','Os pródigos',0],['D','Os que não puderem exprimir sua vontade',0]]],

[1,'A desconsideração da personalidade jurídica pela teoria maior exige:',
 'Art. 50 CC (teoria maior): exige desvio de finalidade OU confusão patrimonial, além do prejuízo ao credor. A teoria menor (CDC/ambiental) exige apenas insolvência.','medio',
 [['A','Apenas a insolvência da pessoa jurídica',0],['B','Desvio de finalidade ou confusão patrimonial',1],['C','Qualquer prejuízo ao credor',0],['D','Dissolução irregular da sociedade',0]]],

[1,'Os bens imóveis por determinação legal incluem:',
 'Art. 80 CC — consideram-se imóveis para efeito legal: os direitos reais sobre imóveis e as ações que os asseguram, além do direito à sucessão aberta.','medio',
 [['A','Navios e aeronaves',0],['B','Apólices da dívida pública',0],['C','O direito à sucessão aberta',1],['D','Bens de uso especial da União',0]]],

[1,'Segundo o Código Civil, são direitos da personalidade:',
 'Os direitos da personalidade (arts. 11-21 CC) são intransmissíveis, irrenunciáveis e não podem sofrer limitação voluntária, salvo nos casos previstos em lei.','facil',
 [['A','Transmissíveis por herança',0],['B','Renunciáveis mediante contrato',0],['C','Intransmissíveis e irrenunciáveis',1],['D','Penhoráveis por dívida',0]]],

[1,'O domicílio da pessoa natural é:',
 'Art. 70 CC — o domicílio é o lugar onde a pessoa estabelece residência com ânimo definitivo. Podem-se ter pluralidade de domicílios (art. 71 CC).','facil',
 [['A','Apenas o local do nascimento',0],['B','O lugar onde a pessoa estabelece residência com ânimo definitivo',1],['C','Sempre o mesmo que o local de trabalho',0],['D','Somente o local do registro de nascimento',0]]],

[1,'A emancipação voluntária é concedida:',
 'Art. 5º, parágrafo único, I, CC — a emancipação voluntária é concedida pelos pais (ou por um deles na falta do outro) ao menor com 16 anos completos, por instrumento público, independentemente de homologação judicial.','medio',
 [['A','Por sentença judicial, independentemente da idade',0],['B','Pelos pais, ao menor de 16 anos, por instrumento público',1],['C','Automaticamente com o casamento',0],['D','Pelo juiz, a requerimento do tutor',0]]],

[1,'A fundação de direito privado somente pode ser constituída para fins:',
 'Art. 62, parágrafo único, CC (redação dada pela Lei 13.151/2015): assistência social, cultura, defesa do meio ambiente, pesquisa científica, saúde, segurança alimentar, etc. Fins lucrativos são vedados.','dificil',
 [['A','Exclusivamente culturais ou científicos',0],['B','Lucrativos, desde que com autorização do MP',0],['C','Não lucrativos previstos no rol do art. 62, parágrafo único',1],['D','Qualquer fim lícito, a critério do instituidor',0]]],

// ── ÁREA 2: Obrigações ────────────────────────────────────────────────────────
[2,'Na solidariedade passiva, o credor pode:',
 'Art. 275 CC — na solidariedade passiva, o credor pode exigir de qualquer devedor solidário o pagamento total da dívida, sem necessidade de demandar os demais.','facil',
 [['A','Exigir de apenas um devedor a sua quota individual',0],['B','Exigir de qualquer devedor solidário o total da dívida',1],['C','Somente acionar todos os devedores conjuntamente',0],['D','Escolher apenas o devedor mais solvente',0]]],

[2,'A sub-rogação legal ocorre em favor:',
 'Art. 346 CC — opera-se de pleno direito em favor do fiador que paga a dívida do afiançado, do adquirente de imóvel hipotecado e do terceiro interessado que paga a dívida.','medio',
 [['A','Somente do credor primitivo',0],['B','Do terceiro não interessado que paga espontaneamente',0],['C','Do fiador que paga a dívida do afiançado',1],['D','Do devedor que paga a própria dívida',0]]],

[2,'A mora do devedor (mora solvendi) caracteriza-se pelo:',
 'Art. 394 CC — considera-se em mora o devedor que não efetuar o pagamento e o credor que não quiser recebê-lo no tempo, lugar e forma convencionados. Nas obrigações positivas e líquidas, a mora é automática (art. 397 CC).','medio',
 [['A','Simples inadimplemento, independentemente de notificação',0],['B','Não cumprimento no tempo, lugar e forma devidos',1],['C','Insolvência do devedor',0],['D','Recusa do credor em receber',0]]],

[2,'Na cessão de crédito, o devedor cedido:',
 'Art. 292 CC — o devedor pode opor ao cessionário as exceções que lhe competiam contra o cedente ao tempo em que teve conhecimento da cessão.','dificil',
 [['A','Não pode opor nenhuma exceção ao cessionário',0],['B','Pode opor ao cessionário as exceções que tinha contra o cedente na época da notificação',1],['C','Precisa consentir para que a cessão seja válida',0],['D','Fica liberado de pleno direito',0]]],

[2,'A novação subjetiva passiva por substituição do devedor, feita sem consentimento do credor, é:',
 'Art. 362 CC — a novação por substituição do devedor pode ser feita sem o consentimento deste (expromissão), mas exige o consentimento do credor.','dificil',
 [['A','Válida e eficaz',0],['B','Anulável a pedido do credor',0],['C','Ineficaz perante o credor',1],['D','Válida, mas o credor pode cobrar do devedor original',0]]],

[2,'O pagamento com sub-rogação difere da cessão de crédito porque:',
 'A sub-rogação legal opera-se de pleno direito, independentemente de acordo entre as partes. Na cessão de crédito, é necessária a manifestação de vontade do credor cedente.','medio',
 [['A','Na sub-rogação, o crédito é extinto',0],['B','A sub-rogação legal independe de manifestação de vontade',1],['C','Na cessão, o devedor é substituído',0],['D','A sub-rogação exige sempre forma pública',0]]],

[2,'A cláusula penal moratória:',
 'Art. 411 CC — quando a pena é ajustada para o caso de mora, pode o credor exigir a satisfação da pena cominada, juntamente com o cumprimento da obrigação principal.','medio',
 [['A','Substitui as perdas e danos pelo inadimplemento total',0],['B','Permite cumulação com o cumprimento da obrigação principal',1],['C','Limita-se a 10% do valor da obrigação',0],['D','É vedada nos contratos de consumo',0]]],

// ── ÁREA 3: Contratos ─────────────────────────────────────────────────────────
[3,'O princípio da boa-fé objetiva nos contratos aplica-se:',
 'Art. 422 CC — as partes são obrigadas a guardar boa-fé objetiva antes, durante e depois do contrato (responsabilidade pré e pós-contratual, culpa in contrahendo).','facil',
 [['A','Somente na fase de execução do contrato',0],['B','Apenas nos contratos de consumo',0],['C','Nas fases pré-contratual, de execução e pós-contratual',1],['D','Apenas quando expressamente prevista no contrato',0]]],

[3,'O contrato é formado no momento em que:',
 'Art. 434 CC — o contrato considera-se celebrado entre ausentes quando a aceitação é expedida (teoria da expedição), salvo nas exceções legais (revogação, resposta fora do prazo, etc.).','medio',
 [['A','O proponente recebe a aceitação',0],['B','A aceitação é expedida (teoria da expedição)',1],['C','O proponente lê a aceitação',0],['D','Ambas as partes assinam o instrumento',0]]],

[3,'Na rescisão por onerosidade excessiva (teoria da imprevisão), é necessário:',
 'Art. 478 CC — é necessário que os fatos supervenientes sejam extraordinários e imprevisíveis e que causem extrema vantagem para a outra parte.','dificil',
 [['A','Apenas a impossibilidade de cumprimento',0],['B','Evento imprevisível que torne a prestação excessivamente onerosa com vantagem extrema para o outro contratante',1],['C','Simples desequilíbrio econômico',0],['D','Caso fortuito ou força maior',0]]],

[3,'A retratação nas arras confirmatórias:',
 'Art. 420 CC — arras confirmatórias: se quem as deu se arrepender, perdê-las-á em favor do outro. Se o arrependimento for de quem as recebeu, restituirá o duplo do recebido.','medio',
 [['A','Não é possível, pois as arras confirmam o negócio',0],['B','Permite que quem deu as arras as perca e quem as recebeu devolva em dobro',1],['C','Sujeita ao pagamento de multa de 10%',0],['D','É possível mediante notificação prévia de 30 dias',0]]],

[3,'A estipulação em favor de terceiro permite que o terceiro:',
 'Art. 436-438 CC — a estipulação em favor de terceiro cria para ele o direito de exigir o cumprimento, porém não lhe impõe obrigações, salvo se as aceitar.','medio',
 [['A','Exija o cumprimento do contrato como parte',0],['B','Exija o cumprimento e demande diretamente o promitente',1],['C','Seja acionado pelos contratantes como responsável',0],['D','Receba a prestação independentemente de aceitar',0]]],

[3,'No contrato de fiança, o benefício de ordem permite ao fiador:',
 'Art. 827 CC — o fiador pode exigir que primeiro sejam executados os bens do devedor principal. O benefício é renunciável e não se aplica quando o fiador o dispensou, se obrigou como devedor solidário ou o devedor faliu.','medio',
 [['A','Recusar o pagamento indefinidamente',0],['B','Exigir a excussão prévia dos bens do devedor principal',1],['C','Dividir a dívida igualmente com o afiançado',0],['D','Substituir-se ao devedor principal',0]]],

[3,'A doação com encargo (modal) é:',
 'Art. 553 CC — o donatário deve cumprir o encargo imposto. Se não o fizer, o doador pode revogar a doação (art. 562 CC). Diferente da doação pura (sem encargo) e da onerosa (há preço).','medio',
 [['A','Sempre nula por violar a gratuidade da doação',0],['B','Válida e o descumprimento do encargo pode gerar revogação',1],['C','Convertida automaticamente em contrato oneroso',0],['D','Revogável a qualquer tempo pelo doador',0]]],

// ── ÁREA 4: Responsabilidade Civil ───────────────────────────────────────────
[4,'A responsabilidade civil subjetiva exige, como requisito diferencial da objetiva:',
 'A responsabilidade subjetiva (art. 186 CC) exige: conduta, dano, nexo de causalidade E culpa (dolo ou culpa stricto sensu). A objetiva (art. 927, parágrafo único) dispensa a culpa.','facil',
 [['A','O dano moral',0],['B','A culpa ou dolo do agente',1],['C','O nexo de causalidade',0],['D','A ilicitude da conduta',0]]],

[4,'Sobre a responsabilidade por fato de terceiro (art. 932 CC), os pais respondem pelos filhos menores:',
 'Art. 932, I, CC — os pais são responsáveis pelos atos dos filhos menores que estiverem sob sua autoridade e companhia. Trata-se de responsabilidade objetiva (art. 933 CC), independente de culpa.','medio',
 [['A','Subjetivamente, se provada a negligência na educação',0],['B','Objetivamente, independentemente de culpa (art. 933 CC)',1],['C','Somente se os filhos forem menores de 12 anos',0],['D','Apenas quando o filho pratica ato doloso',0]]],

[4,'A teoria do risco criado difere da teoria do risco proveito porque:',
 'Risco proveito: quem se beneficia da atividade responde pelo dano. Risco criado: basta que a atividade crie risco, independentemente de benefício econômico. O CC/2002 adotou a teoria do risco criado (art. 927, § único).','dificil',
 [['A','O risco criado exige benefício econômico da atividade',0],['B','No risco criado, basta que a atividade gere risco, sem exigir proveito econômico',1],['C','São teorias idênticas no CC/2002',0],['D','A teoria do risco proveito é adotada no CC, e não o risco criado',0]]],

[4,'A legítima defesa putativa:',
 'A legítima defesa putativa (errônea) não exclui a ilicitude; portanto, o agente responde pelos danos causados, inclusive ao terceiro inocente atingido. Há obrigação de indenizar.','dificil',
 [['A','Exclui a ilicitude e, portanto, a obrigação de indenizar',0],['B','Não exclui a ilicitude, gerando obrigação de indenizar',1],['C','Gera responsabilidade apenas se causou dano moral',0],['D','É tratada como caso fortuito no CC',0]]],

[4,'No dano moral, a sua prova:',
 'O dano moral in re ipsa (por si mesmo) dispensa prova de prejuízo concreto em casos como morte de familiar, inscrição indevida em cadastros de inadimplentes, etc. Basta a prova do fato causador.','medio',
 [['A','Exige sempre prova do prejuízo efetivo sofrido',0],['B','Em certas situações, dispensa prova (dano in re ipsa)',1],['C','É presumida em qualquer ilícito civil',0],['D','Deve ser acompanhada de laudo médico',0]]],

[4,'A cláusula de não indenizar em contrato de transporte de pessoas é:',
 'Nos contratos de transporte, a cláusula de não indenizar é nula, pois o transportador tem obrigação de resultado de conduzir o passageiro são e salvo ao destino (art. 734 CC).','medio',
 [['A','Válida se expressamente prevista',0],['B','Válida apenas para danos materiais',0],['C','Nula, pois o transportador tem obrigação de resultado',1],['D','Válida quando aceita pelo passageiro',0]]],

// ── ÁREA 5: Direito das Coisas ───────────────────────────────────────────────
[5,'O Código Civil de 2002 adotou, para a definição de posse, a teoria:',
 'Art. 1.196 CC — o CC adotou a teoria objetiva de Ihering: considera possuidor quem tem de fato o exercício de algum dos poderes inerentes à propriedade, sem exigir o animus domini (intenção de dono).','facil',
 [['A','Subjetiva de Savigny',0],['B','Objetiva de Ihering',1],['C','Eclética de Windscheid',0],['D','Da posse justa de Clóvis Beviláqua',0]]],

[5,'A usucapião extraordinária tem prazo de 15 anos, reduzido a 10 quando:',
 'Art. 1.238, parágrafo único, CC — o prazo reduz para 10 anos se o possuidor estabeleceu moradia habitual ou realizou obras de caráter produtivo no imóvel.','medio',
 [['A','O possuidor paga os impostos do imóvel',0],['B','O possuidor possui justo título',0],['C','O possuidor estabeleceu moradia habitual ou realizou obras produtivas',1],['D','O imóvel for urbano',0]]],

[5,'No direito de superfície, o superficiário:',
 'Art. 1.369-1.377 CC — o superficiário tem o direito de construir ou plantar no terreno alheio por tempo determinado. Ao término, o proprietário pode adquirir o que foi construído pelo superficiário.','medio',
 [['A','Adquire a propriedade do solo ao final do contrato',0],['B','Tem o direito de construir ou plantar no terreno alheio',1],['C','Responde pelas dívidas do proprietário do solo',0],['D','Não pode alienar seu direito a terceiros',0]]],

[5,'O direito real de habitação, no Código Civil, é:',
 'Art. 1.414 CC — o direito real de habitação é personalíssimo e intransmissível; o titular pode residir no imóvel com sua família, mas não pode ceder ou alugar o bem.','medio',
 [['A','Transmissível por herança e cessível a terceiros',0],['B','Personalíssimo, intransmissível e insuscetível de cessão',1],['C','Passível de penhora por dívidas do titular',0],['D','Temporário, com prazo máximo de 10 anos',0]]],

[5,'A função social da propriedade, no Código Civil, implica que o proprietário:',
 'Art. 1.228, §1º CC — o proprietário tem a obrigação de exercer seu direito em conformidade com o bem-estar social, não podendo praticar atos que não lhe tragam vantagem mas prejudiquem outrem (ato emulativo).','dificil',
 [['A','Pode usar livremente seu bem, ainda que prejudique terceiros',0],['B','Deve exercer seu direito em consonância com finalidades econômicas e sociais',1],['C','Perde automaticamente o bem se não o usar por 5 anos',0],['D','Está sujeito a expropriação a qualquer tempo pelo Estado',0]]],

[5,'Na usucapião especial urbana (art. 1.240 CC), o prazo é:',
 'Art. 1.240 CC — 5 anos, área de até 250m², utilizada para moradia própria ou da família, sem ser proprietário de outro imóvel urbano ou rural.','facil',
 [['A','10 anos, para imóveis até 500m²',0],['B','5 anos, para área de até 250m², com moradia, sem outro imóvel',1],['C','3 anos, para qualquer área urbana',0],['D','15 anos, independentemente do tamanho',0]]],

// ── ÁREA 6: Direito de Família ───────────────────────────────────────────────
[6,'O regime de bens aplicado na ausência de pacto antenupcial é:',
 'Art. 1.640 CC — na ausência de pacto antenupcial ou sendo ele nulo ou ineficaz, vigorará o regime da comunhão parcial de bens.','facil',
 [['A','Comunhão universal de bens',0],['B','Separação obrigatória de bens',0],['C','Comunhão parcial de bens',1],['D','Participação final nos aquestos',0]]],

[6,'É obrigatório o regime da separação de bens para:',
 'Art. 1.641 CC — separação obrigatória: pessoas que casarem com inobservância das causas suspensivas; maiores de 70 anos; e os que dependerem de suprimento judicial para casar.','medio',
 [['A','Estrangeiros casando no Brasil',0],['B','Pessoas maiores de 70 anos',1],['C','Todos os divorciados que voltam a casar',0],['D','Pessoas com filhos de relacionamento anterior',0]]],

[6,'O reconhecimento voluntário de filho pode ser feito:',
 'Art. 1.609 CC — o filho pode ser reconhecido: no registro de nascimento; por escritura pública ou particular; por testamento; ou por manifestação expressa diante do juiz.','medio',
 [['A','Apenas por escritura pública lavrada em cartório',0],['B','Por registro de nascimento, escritura, testamento ou declaração judicial',1],['C','Somente nos primeiros 5 anos após o nascimento',0],['D','Apenas com consentimento da mãe',0]]],

[6,'A Súmula 377 do STF aplica-se ao regime de separação obrigatória e determina que:',
 'Súmula 377 STF — no regime de separação legal, comunicam-se os bens adquiridos na constância do casamento com o esforço comum. Isso mitiga a rigidez do regime.','dificil',
 [['A','Todos os bens presentes e futuros se comunicam',0],['B','Os bens adquiridos na constância do casamento se comunicam',1],['C','O regime se converte em comunhão parcial após 10 anos',0],['D','Os bens anteriores ao casamento nunca se comunicam',0]]],

[6,'Na guarda compartilhada, introduzida como regra pelo CC e pela Lei 13.058/2014:',
 'A guarda compartilhada é a regra desde a Lei 13.058/2014 e não exige acordo entre os pais — pode ser imposta pelo juiz quando ambos são aptos. O domicílio da criança é fixado em um dos lares.','medio',
 [['A','É exigida a concordância de ambos os pais',0],['B','Pode ser determinada pelo juiz mesmo sem acordo dos pais',1],['C','Só é possível quando os pais residem na mesma cidade',0],['D','Exclui o dever de pagar alimentos',0]]],

// ── ÁREA 7: Direito das Sucessões ────────────────────────────────────────────
[7,'A ordem de vocação hereditária no Código Civil é:',
 'Art. 1.829 CC — I) descendentes em concorrência com o cônjuge; II) ascendentes em concorrência com o cônjuge; III) cônjuge sobrevivente; IV) colaterais até 4º grau.','facil',
 [['A','Cônjuge, descendentes, ascendentes, colaterais',0],['B','Descendentes (com cônjuge), ascendentes (com cônjuge), cônjuge, colaterais',1],['C','Descendentes, ascendentes, colaterais, cônjuge',0],['D','Cônjuge, ascendentes, descendentes, colaterais',0]]],

[7,'A legítima dos herdeiros necessários corresponde a:',
 'Art. 1.846 CC — a legítima corresponde à metade (50%) dos bens da herança. A outra metade é a porção disponível, que pode ser testada livremente.','facil',
 [['A','Um terço dos bens da herança',0],['B','Dois terços dos bens da herança',0],['C','Metade dos bens da herança',1],['D','Três quartos dos bens da herança',0]]],

[7,'A indignidade sucessória difere da deserdação porque:',
 'Indignidade: declarada por sentença judicial, a pedido dos interessados, com causas previstas em lei (art. 1.814 CC). Deserdação: ato unilateral do testador, por testamento, com as causas do art. 1.814 e também dos arts. 1.962-1.963.','medio',
 [['A','Na indignidade, o herdeiro perde o direito sem necessidade de testamento',1],['B','A deserdação independe de testamento',0],['C','A indignidade só atinge descendentes',0],['D','São institutos idênticos no CC/2002',0]]],

[7,'O codicilo pode ser utilizado para:',
 'Art. 1.881-1.885 CC — o codicilo é ato de última vontade de pouca relevância econômica. Pode dispor sobre o enterro, sobre esmolas, e fazer legados de móveis de pequeno valor.','dificil',
 [['A','Instituir herdeiro universal',0],['B','Modificar testamento anterior em questões essenciais',0],['C','Dispor sobre o enterro e fazer legados de pequeno valor',1],['D','Nomear testamenteiro',0]]],

[7,'O herdeiro necessário não pode ser excluído da herança, salvo por:',
 'Os herdeiros necessários (descendentes, ascendentes, cônjuge — art. 1.845) só podem ser excluídos por indignidade (sentença judicial) ou deserdação (testamento com causa legal).','medio',
 [['A','Simples omissão no testamento',0],['B','Indignidade ou deserdação',1],['C','Doação em vida de todos os bens disponíveis',0],['D','Decisão unilateral do testador, sem justificativa',0]]],

// ── ÁREA 8: Direito Empresarial ───────────────────────────────────────────────
[8,'O empresário individual responde pelas obrigações da empresa com:',
 'O empresário individual não tem separação patrimonial: responde ilimitadamente com todo o seu patrimônio pessoal pelas dívidas da empresa, diferentemente da EIRELI e das sociedades de responsabilidade limitada.','facil',
 [['A','Apenas o capital investido na empresa',0],['B','Todo o seu patrimônio pessoal, ilimitadamente',1],['C','Somente os bens afetados à atividade empresarial',0],['D','O dobro do capital social registrado',0]]],

[8,'Na sociedade limitada, a responsabilidade dos sócios é:',
 'Art. 1.052 CC — na sociedade limitada, a responsabilidade de cada sócio é restrita ao valor de suas quotas, mas todos respondem solidariamente pela integralização do capital social.','medio',
 [['A','Ilimitada, solidária com a sociedade',0],['B','Limitada ao valor de suas quotas, com solidariedade para integralização do capital',1],['C','Limitada ao valor do capital social total',0],['D','Inexistente, pois a sociedade responde sozinha',0]]],

[8,'O título de crédito se caracteriza pelos princípios da:',
 'Os títulos de crédito são regidos pelos princípios da cartularidade (necessidade do documento), literalidade (o que está no título é o que vale) e autonomia (cada obrigação cambial é independente).','facil',
 [['A','Generalidade, literalidade e publicidade',0],['B','Cartularidade, literalidade e autonomia',1],['C','Relatividade, abstração e informalidade',0],['D','Unilateralidade, irrevogabilidade e causabilidade',0]]],

[8,'O aval difere da fiança porque:',
 'O aval é garantia cambial (em títulos de crédito), autônomo e independente da obrigação garantida. A fiança é garantia contratual, acessória e subsidiária (em regra). O aval não se extingue com a nulidade da obrigação principal.','medio',
 [['A','O aval é acessório; a fiança é autônoma',0],['B','O aval é autônomo; a fiança é acessória',1],['C','O aval só pode ser dado por pessoa jurídica',0],['D','A fiança pode ser dada em títulos de crédito',0]]],

[8,'No processo de recuperação judicial, o devedor deve apresentar o plano de recuperação em até:',
 'Art. 53 da Lei 11.101/2005 — o plano de recuperação judicial deve ser apresentado em juízo no prazo improrrogável de 60 dias da publicação da decisão que deferiu o processamento da recuperação.','medio',
 [['A','30 dias da distribuição do pedido',0],['B','60 dias da publicação da decisão que deferiu o processamento',1],['C','90 dias da aprovação pela assembleia de credores',0],['D','120 dias da decretação da insolvência',0]]],

// ── ÁREA 9: Direito do Consumidor ────────────────────────────────────────────
[9,'O prazo decadencial para reclamar por vícios em produtos duráveis, no CDC, é de:',
 'Art. 26 CDC — vícios aparentes ou de fácil constatação: 30 dias (produtos não duráveis) e 90 dias (produtos duráveis). Para vícios ocultos, o prazo inicia da descoberta.','facil',
 [['A','30 dias',0],['B','60 dias',0],['C','90 dias',1],['D','1 ano',0]]],

[9,'A responsabilidade pelo fato do produto (acidente de consumo) no CDC é:',
 'Arts. 12 e 14 CDC — a responsabilidade pelo fato do produto é objetiva para o fabricante, produtor, construtor e importador. O comerciante responde subsidiariamente.','facil',
 [['A','Subjetiva, exigindo culpa do fornecedor',0],['B','Objetiva para o fabricante, produtor, construtor e importador',1],['C','Solidária entre todos os fornecedores da cadeia',0],['D','Limitada ao valor pago pelo consumidor',0]]],

[9,'O direito de arrependimento no CDC pode ser exercido em até:',
 'Art. 49 CDC — o consumidor pode desistir do contrato celebrado fora do estabelecimento comercial (inclusive por telefone ou internet), no prazo de 7 dias a contar da assinatura ou do recebimento do produto.','facil',
 [['A','3 dias da compra',0],['B','7 dias da assinatura do contrato ou do recebimento do produto',1],['C','15 dias para produtos duráveis',0],['D','30 dias para serviços contratados à distância',0]]],

[9,'As cláusulas abusivas nos contratos de consumo são:',
 'Art. 51 CDC — as cláusulas abusivas são nulas de pleno direito (nulidade absoluta), independentemente de sua aceitação pelo consumidor.','medio',
 [['A','Anuláveis, dependendo de provocação do consumidor',0],['B','Válidas se o consumidor as aceitar expressamente',0],['C','Nulas de pleno direito',1],['D','Ineficazes somente em relação a consumidores vulneráveis',0]]],

[9,'No CDC, a publicidade enganosa é aquela que:',
 'Art. 37, §1º CDC — é enganosa qualquer modalidade de informação ou comunicação de caráter publicitário, inteira ou parcialmente falsa, ou que por qualquer outro modo, mesmo por omissão, seja capaz de induzir em erro o consumidor.','medio',
 [['A','Apenas mente sobre o produto',0],['B','Pode induzir o consumidor em erro, inclusive por omissão',1],['C','Exige que o consumidor efetivamente seja enganado',0],['D','Se restringe à publicidade veiculada por TV ou rádio',0]]],

// ── ÁREA 10: Direito Internacional Privado ────────────────────────────────────
[10,'A LINDB adota, para reger a personalidade e a capacidade das pessoas, a lei do:',
 'Art. 7º LINDB — a lei do país em que for domiciliada a pessoa rege a sua personalidade, capacidade e os direitos de família.','medio',
 [['A','País da nacionalidade',0],['B','País do domicílio',1],['C','País onde o ato foi praticado',0],['D','País do foro',0]]],

[10,'Segundo a LINDB, os bens imóveis são regidos pela lei:',
 'Art. 8º LINDB — para qualificar os bens e regular as relações a eles concernentes, aplica-se a lei do país em que estiverem situados (lex rei sitae).','facil',
 [['A','Do domicílio do proprietário',0],['B','Da situação do bem (lex rei sitae)',1],['C','Do país onde o contrato foi celebrado',0],['D','Da nacionalidade do proprietário',0]]],

[10,'O reenvio de 1º grau (remissão) ocorre quando:',
 'O reenvio de 1º grau ocorre quando a lei estrangeira indicada pela norma de conflito nacional reenvia ao direito do foro (do país onde o juiz se encontra). O Brasil, via de regra, não aceita o reenvio (art. 16 LINDB).','dificil',
 [['A','A lei do foro aceita a designação feita pela norma de conflito',0],['B','A lei estrangeira indicada reenvia ao direito do foro',1],['C','O juiz aplica a lex fori em substituição à lei estrangeira',0],['D','Dois países designam mutuamente o direito um do outro',0]]],

[10,'A cláusula de exceção de ordem pública no DIPr permite ao juiz:',
 'Art. 17 LINDB — não se aplicará a lei estrangeira quando sua aplicação ofender a soberania nacional, a ordem pública e os bons costumes.','medio',
 [['A','Aplicar sempre o direito nacional',0],['B','Afastar a lei estrangeira que violar a ordem pública nacional',1],['C','Declarar inválidos todos os atos praticados no exterior',0],['D','Exigir reciprocidade de tratamento',0]]],

[10,'Segundo a LINDB, a obrigação resultante do contrato é regida pela lei do país em que:',
 'Art. 9º LINDB — para qualificar e reger as obrigações, aplica-se a lei do país em que se constituírem (lex loci celebrationis).','medio',
 [['A','O contrato for executado',0],['B','O contrato for constituído (lex loci celebrationis)',1],['C','Residir o devedor',0],['D','For proposta a ação judicial',0]]],

// ── ÁREA 11: Fatos e Negócios Jurídicos ──────────────────────────────────────
[11,'O negócio jurídico simulado é:',
 'Art. 167 CC — o negócio simulado é nulo (vício social de nulidade absoluta), mas o negócio dissimulado subsiste se válido em substância e forma.','medio',
 [['A','Anulável, a pedido de qualquer dos figurantes',0],['B','Nulo, mas subsiste o negócio dissimulado se válido',1],['C','Válido entre as partes, apenas ineficaz perante terceiros',0],['D','Inexistente no plano jurídico',0]]],

[11,'A lesão como vício do negócio jurídico exige:',
 'Art. 157 CC — a lesão ocorre quando uma pessoa, sob premente necessidade ou inexperiência, se obriga a prestação manifestamente desproporcional ao valor da contraprestação. Não é necessária a má-fé do outro.','medio',
 [['A','A má-fé do contratante beneficiado',0],['B','Premente necessidade ou inexperiência aliada à desproporção manifesta',1],['C','A incapacidade do lesado',0],['D','A crise econômica generalizada',0]]],

[11,'O erro substancial, para viciar o negócio jurídico, deve ser:',
 'Art. 138-139 CC — o erro é essencial quando é real (se o declarante soubesse do erro, não teria realizado o negócio) e é recognoscível pelo outro contratante (o destinatário podia perceber que havia erro).','dificil',
 [['A','Doloso e provocado pelo outro contratante',0],['B','Real e recognoscível pelo destinatário da declaração',1],['C','Apenas sobre o objeto principal do negócio',0],['D','Causado por terceiro',0]]],

[11,'O estado de perigo como defeito do negócio jurídico (art. 156 CC) difere da coação porque:',
 'Estado de perigo: o agente assume obrigação excessivamente onerosa para salvar-se ou a pessoa próxima de grave dano. Coação: pressão irresistível que retira a liberdade de vontade. No estado de perigo, não há ameaça do outro contratante.','dificil',
 [['A','No estado de perigo, há ameaça do outro contratante',0],['B','No estado de perigo, o agente age para salvar-se de grave dano, sem ameaça da outra parte',1],['C','O estado de perigo torna o negócio nulo, não anulável',0],['D','A coação exige sempre violência física',0]]],

[11,'A condição ilícita aposta ao negócio jurídico:',
 'Art. 123 CC — invalida o negócio jurídico a condição física ou juridicamente impossível, bem como a condição ilícita ou a de fazer coisa ilícita. A condição fisicamente impossível, se resolutiva, é reputada não escrita.','medio',
 [['A','É reputada não escrita, subsistindo o negócio',0],['B','Invalida o negócio jurídico',1],['C','Converte o negócio em puro',0],['D','Apenas torna o negócio anulável',0]]],

// ── ÁREA 12: Prescrição e Decadência ─────────────────────────────────────────
[12,'A prescrição difere da decadência porque:',
 'Prescrição: extingue a pretensão (direito de ação) referente a direitos subjetivos patrimoniais. Decadência: extingue o próprio direito potestativo. A prescrição pode ser suspensa e interrompida; a decadência legal não admite essas hipóteses.','medio',
 [['A','A prescrição extingue o direito; a decadência, a ação',0],['B','A prescrição extingue a pretensão; a decadência, o direito potestativo',1],['C','A decadência pode ser interrompida; a prescrição não',0],['D','Ambas extinguem o direito e a ação',0]]],

[12,'O prazo prescricional geral no Código Civil é de:',
 'Art. 205 CC — o prazo prescricional geral é de 10 anos quando a lei não fixar prazo menor. Ex.: ações pessoais em geral não contempladas nos prazos especiais do art. 206.','facil',
 [['A','5 anos',0],['B','10 anos',1],['C','15 anos',0],['D','20 anos',0]]],

[12,'A interrupção da prescrição:',
 'Arts. 202-204 CC — a interrupção da prescrição apaga o prazo já transcorrido e o reinicia por inteiro. Só pode ocorrer uma única vez. A suspensão, ao contrário, apenas para o prazo, que continua de onde parou.','medio',
 [['A','Paralisa o prazo, que continua de onde parou',0],['B','Apaga o prazo transcorrido e reinicia por inteiro, podendo ocorrer uma única vez',1],['C','Pode ser declarada de ofício pelo juiz em qualquer caso',0],['D','Não pode ser alegada pela parte beneficiada',0]]],

[12,'A prescrição pode ser renunciada:',
 'Art. 191 CC — a renúncia da prescrição pode ser expressa ou tácita, e só valerá sendo feita sem prejuízo de terceiro, depois que a prescrição se consumar. Antes de consumada, é irrenunciável.','medio',
 [['A','A qualquer momento, antes ou depois de consumada',0],['B','Somente após consumada, sem prejuízo de terceiro',1],['C','Nunca, pois é matéria de ordem pública',0],['D','Antes de consumada, por acordo escrito',0]]],

[12,'O prazo prescricional para ação de reparação de dano causado por liquidez no CC é de:',
 'Art. 206, §3º, V, CC — prescreve em 3 anos a pretensão de reparação civil. Este é um dos prazos especiais mais cobrados em provas.','medio',
 [['A','1 ano',0],['B','2 anos',0],['C','3 anos',1],['D','5 anos',0]]],

// ── FIM DAS ÁREAS DE DIREITO CIVIL ───────────────────────────────────────────
// Áreas 13+ (outras matérias jurídicas) serão adicionadas futuramente.

];

$pdo->beginTransaction();
$insQ   = $pdo->prepare("INSERT INTO questoes (area_id, enunciado, explicacao, dificuldade) VALUES (?,?,?,?)");
$insOpt = $pdo->prepare("INSERT INTO questao_opcoes (questao_id, letra, texto, correta, ordem) VALUES (?,?,?,?,?)");

$total = 0;
foreach ($banco as $q) {
    [$area_id, $enunciado, $explicacao, $dificuldade, $opcoes] = $q;
    $insQ->execute([$area_id, $enunciado, $explicacao, $dificuldade]);
    $qid = (int)$pdo->lastInsertId();
    foreach ($opcoes as $i => [$letra, $texto, $correta]) {
        $insOpt->execute([$qid, $letra, $texto, $correta ? 1 : 0, $i]);
    }
    $total++;
}
$pdo->commit();

out("✅ $total questões inseridas com sucesso!", 'ok');
out('Acesse os simulados em: http://localhost/lex-studio/app/simulados.html', 'info');
?>
</body></html>
