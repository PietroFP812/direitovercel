'use strict'
// seed/questoes.js — Popula o banco Neon com questões para os simulados
//
// Uso:
//   $env:DATABASE_URL="postgresql://..."  # PowerShell
//   node seed/questoes.js
//
// Ou pegue a URL no painel da Vercel (Settings > Environment Variables > DATABASE_URL)
// e cole diretamente: DATABASE_URL=postgresql://... node seed/questoes.js

const { neon } = require('@neondatabase/serverless')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL não definida.')
  console.error('    PowerShell: $env:DATABASE_URL="postgresql://..." ; node seed/questoes.js')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

// [ area_id, enunciado, explicacao, dificuldade, [ [letra, texto, correta], ... ] ]
const banco = [

// ── ÁREA 1: Parte Geral — Pessoas e Bens ─────────────────────────────────────
[1,'A personalidade civil da pessoa natural começa:',
 'Art. 1º CC — a personalidade começa com o nascimento com vida, embora os direitos do nascituro sejam protegidos desde a concepção.','facil',
 [['A','Com a concepção',false],['B','Com o nascimento com vida',true],['C','Com o registro civil',false],['D','Aos 16 anos completos',false]]],

[1,'Após o Estatuto da Pessoa com Deficiência (Lei 13.146/2015), são absolutamente incapazes apenas:',
 'A reforma de 2015 restringiu a incapacidade absoluta aos menores de 16 anos; todas as demais situações anteriores (ébrios, viciados, deficientes) passaram para incapacidade relativa ou foram suprimidas.','medio',
 [['A','Os maiores de 16 e menores de 18 anos',false],['B','Os menores de 16 anos',true],['C','Os pródigos',false],['D','Os que não puderem exprimir sua vontade',false]]],

[1,'A desconsideração da personalidade jurídica pela teoria maior exige:',
 'Art. 50 CC (teoria maior): exige desvio de finalidade OU confusão patrimonial, além do prejuízo ao credor. A teoria menor (CDC/ambiental) exige apenas insolvência.','medio',
 [['A','Apenas a insolvência da pessoa jurídica',false],['B','Desvio de finalidade ou confusão patrimonial',true],['C','Qualquer prejuízo ao credor',false],['D','Dissolução irregular da sociedade',false]]],

[1,'Os bens imóveis por determinação legal incluem:',
 'Art. 80 CC — consideram-se imóveis para efeito legal: os direitos reais sobre imóveis e as ações que os asseguram, além do direito à sucessão aberta.','medio',
 [['A','Navios e aeronaves',false],['B','Apólices da dívida pública',false],['C','O direito à sucessão aberta',true],['D','Bens de uso especial da União',false]]],

[1,'Segundo o Código Civil, são direitos da personalidade:',
 'Os direitos da personalidade (arts. 11-21 CC) são intransmissíveis, irrenunciáveis e não podem sofrer limitação voluntária, salvo nos casos previstos em lei.','facil',
 [['A','Transmissíveis por herança',false],['B','Renunciáveis mediante contrato',false],['C','Intransmissíveis e irrenunciáveis',true],['D','Penhoráveis por dívida',false]]],

[1,'O domicílio da pessoa natural é:',
 'Art. 70 CC — o domicílio é o lugar onde a pessoa estabelece residência com ânimo definitivo. Podem-se ter pluralidade de domicílios (art. 71 CC).','facil',
 [['A','Apenas o local do nascimento',false],['B','O lugar onde a pessoa estabelece residência com ânimo definitivo',true],['C','Sempre o mesmo que o local de trabalho',false],['D','Somente o local do registro de nascimento',false]]],

[1,'A emancipação voluntária é concedida:',
 'Art. 5º, parágrafo único, I, CC — a emancipação voluntária é concedida pelos pais (ou por um deles na falta do outro) ao menor com 16 anos completos, por instrumento público, independentemente de homologação judicial.','medio',
 [['A','Por sentença judicial, independentemente da idade',false],['B','Pelos pais, ao menor de 16 anos, por instrumento público',true],['C','Automaticamente com o casamento',false],['D','Pelo juiz, a requerimento do tutor',false]]],

[1,'A fundação de direito privado somente pode ser constituída para fins:',
 'Art. 62, parágrafo único, CC (redação dada pela Lei 13.151/2015): assistência social, cultura, defesa do meio ambiente, pesquisa científica, saúde, segurança alimentar, etc. Fins lucrativos são vedados.','dificil',
 [['A','Exclusivamente culturais ou científicos',false],['B','Lucrativos, desde que com autorização do MP',false],['C','Não lucrativos previstos no rol do art. 62, parágrafo único',true],['D','Qualquer fim lícito, a critério do instituidor',false]]],

// ── ÁREA 2: Obrigações ────────────────────────────────────────────────────────
[2,'Na solidariedade passiva, o credor pode:',
 'Art. 275 CC — na solidariedade passiva, o credor pode exigir de qualquer devedor solidário o pagamento total da dívida, sem necessidade de demandar os demais.','facil',
 [['A','Exigir de apenas um devedor a sua quota individual',false],['B','Exigir de qualquer devedor solidário o total da dívida',true],['C','Somente acionar todos os devedores conjuntamente',false],['D','Escolher apenas o devedor mais solvente',false]]],

[2,'A sub-rogação legal ocorre em favor:',
 'Art. 346 CC — opera-se de pleno direito em favor do fiador que paga a dívida do afiançado, do adquirente de imóvel hipotecado e do terceiro interessado que paga a dívida.','medio',
 [['A','Somente do credor primitivo',false],['B','Do terceiro não interessado que paga espontaneamente',false],['C','Do fiador que paga a dívida do afiançado',true],['D','Do devedor que paga a própria dívida',false]]],

[2,'A mora do devedor (mora solvendi) caracteriza-se pelo:',
 'Art. 394 CC — considera-se em mora o devedor que não efetuar o pagamento e o credor que não quiser recebê-lo no tempo, lugar e forma convencionados. Nas obrigações positivas e líquidas, a mora é automática (art. 397 CC).','medio',
 [['A','Simples inadimplemento, independentemente de notificação',false],['B','Não cumprimento no tempo, lugar e forma devidos',true],['C','Insolvência do devedor',false],['D','Recusa do credor em receber',false]]],

[2,'Na cessão de crédito, o devedor cedido:',
 'Art. 292 CC — o devedor pode opor ao cessionário as exceções que lhe competiam contra o cedente ao tempo em que teve conhecimento da cessão.','dificil',
 [['A','Não pode opor nenhuma exceção ao cessionário',false],['B','Pode opor ao cessionário as exceções que tinha contra o cedente na época da notificação',true],['C','Precisa consentir para que a cessão seja válida',false],['D','Fica liberado de pleno direito',false]]],

[2,'A novação subjetiva passiva por substituição do devedor, feita sem consentimento do credor, é:',
 'Art. 362 CC — a novação por substituição do devedor pode ser feita sem o consentimento deste (expromissão), mas exige o consentimento do credor.','dificil',
 [['A','Válida e eficaz',false],['B','Anulável a pedido do credor',false],['C','Ineficaz perante o credor',true],['D','Válida, mas o credor pode cobrar do devedor original',false]]],

[2,'O pagamento com sub-rogação difere da cessão de crédito porque:',
 'A sub-rogação legal opera-se de pleno direito, independentemente de acordo entre as partes. Na cessão de crédito, é necessária a manifestação de vontade do credor cedente.','medio',
 [['A','Na sub-rogação, o crédito é extinto',false],['B','A sub-rogação legal independe de manifestação de vontade',true],['C','Na cessão, o devedor é substituído',false],['D','A sub-rogação exige sempre forma pública',false]]],

[2,'A cláusula penal moratória:',
 'Art. 411 CC — quando a pena é ajustada para o caso de mora, pode o credor exigir a satisfação da pena cominada, juntamente com o cumprimento da obrigação principal.','medio',
 [['A','Substitui as perdas e danos pelo inadimplemento total',false],['B','Permite cumulação com o cumprimento da obrigação principal',true],['C','Limita-se a 10% do valor da obrigação',false],['D','É vedada nos contratos de consumo',false]]],

// ── ÁREA 3: Contratos ─────────────────────────────────────────────────────────
[3,'O princípio da boa-fé objetiva nos contratos aplica-se:',
 'Art. 422 CC — as partes são obrigadas a guardar boa-fé objetiva antes, durante e depois do contrato (responsabilidade pré e pós-contratual, culpa in contrahendo).','facil',
 [['A','Somente na fase de execução do contrato',false],['B','Apenas nos contratos de consumo',false],['C','Nas fases pré-contratual, de execução e pós-contratual',true],['D','Apenas quando expressamente prevista no contrato',false]]],

[3,'O contrato é formado no momento em que:',
 'Art. 434 CC — o contrato considera-se celebrado entre ausentes quando a aceitação é expedida (teoria da expedição), salvo nas exceções legais (revogação, resposta fora do prazo, etc.).','medio',
 [['A','O proponente recebe a aceitação',false],['B','A aceitação é expedida (teoria da expedição)',true],['C','O proponente lê a aceitação',false],['D','Ambas as partes assinam o instrumento',false]]],

[3,'Na rescisão por onerosidade excessiva (teoria da imprevisão), é necessário:',
 'Art. 478 CC — é necessário que os fatos supervenientes sejam extraordinários e imprevisíveis e que causem extrema vantagem para a outra parte.','dificil',
 [['A','Apenas a impossibilidade de cumprimento',false],['B','Evento imprevisível que torne a prestação excessivamente onerosa com vantagem extrema para o outro contratante',true],['C','Simples desequilíbrio econômico',false],['D','Caso fortuito ou força maior',false]]],

[3,'A retratação nas arras confirmatórias:',
 'Art. 420 CC — arras confirmatórias: se quem as deu se arrepender, perdê-las-á em favor do outro. Se o arrependimento for de quem as recebeu, restituirá o duplo do recebido.','medio',
 [['A','Não é possível, pois as arras confirmam o negócio',false],['B','Permite que quem deu as arras as perca e quem as recebeu devolva em dobro',true],['C','Sujeita ao pagamento de multa de 10%',false],['D','É possível mediante notificação prévia de 30 dias',false]]],

[3,'A estipulação em favor de terceiro permite que o terceiro:',
 'Art. 436-438 CC — a estipulação em favor de terceiro cria para ele o direito de exigir o cumprimento, porém não lhe impõe obrigações, salvo se as aceitar.','medio',
 [['A','Exija o cumprimento do contrato como parte',false],['B','Exija o cumprimento e demande diretamente o promitente',true],['C','Seja acionado pelos contratantes como responsável',false],['D','Receba a prestação independentemente de aceitar',false]]],

[3,'No contrato de fiança, o benefício de ordem permite ao fiador:',
 'Art. 827 CC — o fiador pode exigir que primeiro sejam executados os bens do devedor principal. O benefício é renunciável e não se aplica quando o fiador o dispensou, se obrigou como devedor solidário ou o devedor faliu.','medio',
 [['A','Recusar o pagamento indefinidamente',false],['B','Exigir a excussão prévia dos bens do devedor principal',true],['C','Dividir a dívida igualmente com o afiançado',false],['D','Substituir-se ao devedor principal',false]]],

[3,'A doação com encargo (modal) é:',
 'Art. 553 CC — o donatário deve cumprir o encargo imposto. Se não o fizer, o doador pode revogar a doação (art. 562 CC). Diferente da doação pura (sem encargo) e da onerosa (há preço).','medio',
 [['A','Sempre nula por violar a gratuidade da doação',false],['B','Válida e o descumprimento do encargo pode gerar revogação',true],['C','Convertida automaticamente em contrato oneroso',false],['D','Revogável a qualquer tempo pelo doador',false]]],

// ── ÁREA 4: Responsabilidade Civil ───────────────────────────────────────────
[4,'A responsabilidade civil subjetiva exige, como requisito diferencial da objetiva:',
 'A responsabilidade subjetiva (art. 186 CC) exige: conduta, dano, nexo de causalidade E culpa (dolo ou culpa stricto sensu). A objetiva (art. 927, parágrafo único) dispensa a culpa.','facil',
 [['A','O dano moral',false],['B','A culpa ou dolo do agente',true],['C','O nexo de causalidade',false],['D','A ilicitude da conduta',false]]],

[4,'Sobre a responsabilidade por fato de terceiro (art. 932 CC), os pais respondem pelos filhos menores:',
 'Art. 932, I, CC — os pais são responsáveis pelos atos dos filhos menores que estiverem sob sua autoridade e companhia. Trata-se de responsabilidade objetiva (art. 933 CC), independente de culpa.','medio',
 [['A','Subjetivamente, se provada a negligência na educação',false],['B','Objetivamente, independentemente de culpa (art. 933 CC)',true],['C','Somente se os filhos forem menores de 12 anos',false],['D','Apenas quando o filho pratica ato doloso',false]]],

[4,'A teoria do risco criado difere da teoria do risco proveito porque:',
 'Risco proveito: quem se beneficia da atividade responde pelo dano. Risco criado: basta que a atividade crie risco, independentemente de benefício econômico. O CC/2002 adotou a teoria do risco criado (art. 927, § único).','dificil',
 [['A','O risco criado exige benefício econômico da atividade',false],['B','No risco criado, basta que a atividade gere risco, sem exigir proveito econômico',true],['C','São teorias idênticas no CC/2002',false],['D','A teoria do risco proveito é adotada no CC, e não o risco criado',false]]],

[4,'A legítima defesa putativa:',
 'A legítima defesa putativa (errônea) não exclui a ilicitude; portanto, o agente responde pelos danos causados, inclusive ao terceiro inocente atingido. Há obrigação de indenizar.','dificil',
 [['A','Exclui a ilicitude e, portanto, a obrigação de indenizar',false],['B','Não exclui a ilicitude, gerando obrigação de indenizar',true],['C','Gera responsabilidade apenas se causou dano moral',false],['D','É tratada como caso fortuito no CC',false]]],

[4,'No dano moral, a sua prova:',
 'O dano moral in re ipsa (por si mesmo) dispensa prova de prejuízo concreto em casos como morte de familiar, inscrição indevida em cadastros de inadimplentes, etc. Basta a prova do fato causador.','medio',
 [['A','Exige sempre prova do prejuízo efetivo sofrido',false],['B','Em certas situações, dispensa prova (dano in re ipsa)',true],['C','É presumida em qualquer ilícito civil',false],['D','Deve ser acompanhada de laudo médico',false]]],

[4,'A cláusula de não indenizar em contrato de transporte de pessoas é:',
 'Nos contratos de transporte, a cláusula de não indenizar é nula, pois o transportador tem obrigação de resultado de conduzir o passageiro são e salvo ao destino (art. 734 CC).','medio',
 [['A','Válida se expressamente prevista',false],['B','Válida apenas para danos materiais',false],['C','Nula, pois o transportador tem obrigação de resultado',true],['D','Válida quando aceita pelo passageiro',false]]],

// ── ÁREA 5: Direito das Coisas ───────────────────────────────────────────────
[5,'O Código Civil de 2002 adotou, para a definição de posse, a teoria:',
 'Art. 1.196 CC — o CC adotou a teoria objetiva de Ihering: considera possuidor quem tem de fato o exercício de algum dos poderes inerentes à propriedade, sem exigir o animus domini (intenção de dono).','facil',
 [['A','Subjetiva de Savigny',false],['B','Objetiva de Ihering',true],['C','Eclética de Windscheid',false],['D','Da posse justa de Clóvis Beviláqua',false]]],

[5,'A usucapião extraordinária tem prazo de 15 anos, reduzido a 10 quando:',
 'Art. 1.238, parágrafo único, CC — o prazo reduz para 10 anos se o possuidor estabeleceu moradia habitual ou realizou obras de caráter produtivo no imóvel.','medio',
 [['A','O possuidor paga os impostos do imóvel',false],['B','O possuidor possui justo título',false],['C','O possuidor estabeleceu moradia habitual ou realizou obras produtivas',true],['D','O imóvel for urbano',false]]],

[5,'No direito de superfície, o superficiário:',
 'Art. 1.369-1.377 CC — o superficiário tem o direito de construir ou plantar no terreno alheio por tempo determinado. Ao término, o proprietário pode adquirir o que foi construído pelo superficiário.','medio',
 [['A','Adquire a propriedade do solo ao final do contrato',false],['B','Tem o direito de construir ou plantar no terreno alheio',true],['C','Responde pelas dívidas do proprietário do solo',false],['D','Não pode alienar seu direito a terceiros',false]]],

[5,'O direito real de habitação, no Código Civil, é:',
 'Art. 1.414 CC — o direito real de habitação é personalíssimo e intransmissível; o titular pode residir no imóvel com sua família, mas não pode ceder ou alugar o bem.','medio',
 [['A','Transmissível por herança e cessível a terceiros',false],['B','Personalíssimo, intransmissível e insuscetível de cessão',true],['C','Passível de penhora por dívidas do titular',false],['D','Temporário, com prazo máximo de 10 anos',false]]],

[5,'A função social da propriedade, no Código Civil, implica que o proprietário:',
 'Art. 1.228, §1º CC — o proprietário tem a obrigação de exercer seu direito em conformidade com o bem-estar social, não podendo praticar atos que não lhe tragam vantagem mas prejudiquem outrem (ato emulativo).','dificil',
 [['A','Pode usar livremente seu bem, ainda que prejudique terceiros',false],['B','Deve exercer seu direito em consonância com finalidades econômicas e sociais',true],['C','Perde automaticamente o bem se não o usar por 5 anos',false],['D','Está sujeito a expropriação a qualquer tempo pelo Estado',false]]],

[5,'Na usucapião especial urbana (art. 1.240 CC), o prazo é:',
 'Art. 1.240 CC — 5 anos, área de até 250m², utilizada para moradia própria ou da família, sem ser proprietário de outro imóvel urbano ou rural.','facil',
 [['A','10 anos, para imóveis até 500m²',false],['B','5 anos, para área de até 250m², com moradia, sem outro imóvel',true],['C','3 anos, para qualquer área urbana',false],['D','15 anos, independentemente do tamanho',false]]],

// ── ÁREA 6: Direito de Família ───────────────────────────────────────────────
[6,'O regime de bens aplicado na ausência de pacto antenupcial é:',
 'Art. 1.640 CC — na ausência de pacto antenupcial ou sendo ele nulo ou ineficaz, vigorará o regime da comunhão parcial de bens.','facil',
 [['A','Comunhão universal de bens',false],['B','Separação obrigatória de bens',false],['C','Comunhão parcial de bens',true],['D','Participação final nos aquestos',false]]],

[6,'É obrigatório o regime da separação de bens para:',
 'Art. 1.641 CC — separação obrigatória: pessoas que casarem com inobservância das causas suspensivas; maiores de 70 anos; e os que dependerem de suprimento judicial para casar.','medio',
 [['A','Estrangeiros casando no Brasil',false],['B','Pessoas maiores de 70 anos',true],['C','Todos os divorciados que voltam a casar',false],['D','Pessoas com filhos de relacionamento anterior',false]]],

[6,'O reconhecimento voluntário de filho pode ser feito:',
 'Art. 1.609 CC — o filho pode ser reconhecido: no registro de nascimento; por escritura pública ou particular; por testamento; ou por manifestação expressa diante do juiz.','medio',
 [['A','Apenas por escritura pública lavrada em cartório',false],['B','Por registro de nascimento, escritura, testamento ou declaração judicial',true],['C','Somente nos primeiros 5 anos após o nascimento',false],['D','Apenas com consentimento da mãe',false]]],

[6,'A Súmula 377 do STF aplica-se ao regime de separação obrigatória e determina que:',
 'Súmula 377 STF — no regime de separação legal, comunicam-se os bens adquiridos na constância do casamento com o esforço comum. Isso mitiga a rigidez do regime.','dificil',
 [['A','Todos os bens presentes e futuros se comunicam',false],['B','Os bens adquiridos na constância do casamento se comunicam',true],['C','O regime se converte em comunhão parcial após 10 anos',false],['D','Os bens anteriores ao casamento nunca se comunicam',false]]],

[6,'Na guarda compartilhada, introduzida como regra pelo CC e pela Lei 13.058/2014:',
 'A guarda compartilhada é a regra desde a Lei 13.058/2014 e não exige acordo entre os pais — pode ser imposta pelo juiz quando ambos são aptos. O domicílio da criança é fixado em um dos lares.','medio',
 [['A','É exigida a concordância de ambos os pais',false],['B','Pode ser determinada pelo juiz mesmo sem acordo dos pais',true],['C','Só é possível quando os pais residem na mesma cidade',false],['D','Exclui o dever de pagar alimentos',false]]],

// ── ÁREA 7: Direito das Sucessões ────────────────────────────────────────────
[7,'A ordem de vocação hereditária no Código Civil é:',
 'Art. 1.829 CC — I) descendentes em concorrência com o cônjuge; II) ascendentes em concorrência com o cônjuge; III) cônjuge sobrevivente; IV) colaterais até 4º grau.','facil',
 [['A','Cônjuge, descendentes, ascendentes, colaterais',false],['B','Descendentes (com cônjuge), ascendentes (com cônjuge), cônjuge, colaterais',true],['C','Descendentes, ascendentes, colaterais, cônjuge',false],['D','Cônjuge, ascendentes, descendentes, colaterais',false]]],

[7,'A legítima dos herdeiros necessários corresponde a:',
 'Art. 1.846 CC — a legítima corresponde à metade (50%) dos bens da herança. A outra metade é a porção disponível, que pode ser testada livremente.','facil',
 [['A','Um terço dos bens da herança',false],['B','Dois terços dos bens da herança',false],['C','Metade dos bens da herança',true],['D','Três quartos dos bens da herança',false]]],

[7,'A indignidade sucessória difere da deserdação porque:',
 'Indignidade: declarada por sentença judicial, a pedido dos interessados, com causas previstas em lei (art. 1.814 CC). Deserdação: ato unilateral do testador, por testamento, com as causas do art. 1.814 e também dos arts. 1.962-1.963.','medio',
 [['A','Na indignidade, o herdeiro perde o direito sem necessidade de testamento',true],['B','A deserdação independe de testamento',false],['C','A indignidade só atinge descendentes',false],['D','São institutos idênticos no CC/2002',false]]],

[7,'O codicilo pode ser utilizado para:',
 'Art. 1.881-1.885 CC — o codicilo é ato de última vontade de pouca relevância econômica. Pode dispor sobre o enterro, sobre esmolas, e fazer legados de móveis de pequeno valor.','dificil',
 [['A','Instituir herdeiro universal',false],['B','Modificar testamento anterior em questões essenciais',false],['C','Dispor sobre o enterro e fazer legados de pequeno valor',true],['D','Nomear testamenteiro',false]]],

[7,'O herdeiro necessário não pode ser excluído da herança, salvo por:',
 'Os herdeiros necessários (descendentes, ascendentes, cônjuge — art. 1.845) só podem ser excluídos por indignidade (sentença judicial) ou deserdação (testamento com causa legal).','medio',
 [['A','Simples omissão no testamento',false],['B','Indignidade ou deserdação',true],['C','Doação em vida de todos os bens disponíveis',false],['D','Decisão unilateral do testador, sem justificativa',false]]],

// ── ÁREA 8: Direito Empresarial ───────────────────────────────────────────────
[8,'O empresário individual responde pelas obrigações da empresa com:',
 'O empresário individual não tem separação patrimonial: responde ilimitadamente com todo o seu patrimônio pessoal pelas dívidas da empresa, diferentemente da EIRELI e das sociedades de responsabilidade limitada.','facil',
 [['A','Apenas o capital investido na empresa',false],['B','Todo o seu patrimônio pessoal, ilimitadamente',true],['C','Somente os bens afetados à atividade empresarial',false],['D','O dobro do capital social registrado',false]]],

[8,'Na sociedade limitada, a responsabilidade dos sócios é:',
 'Art. 1.052 CC — na sociedade limitada, a responsabilidade de cada sócio é restrita ao valor de suas quotas, mas todos respondem solidariamente pela integralização do capital social.','medio',
 [['A','Ilimitada, solidária com a sociedade',false],['B','Limitada ao valor de suas quotas, com solidariedade para integralização do capital',true],['C','Limitada ao valor do capital social total',false],['D','Inexistente, pois a sociedade responde sozinha',false]]],

[8,'O título de crédito se caracteriza pelos princípios da:',
 'Os títulos de crédito são regidos pelos princípios da cartularidade (necessidade do documento), literalidade (o que está no título é o que vale) e autonomia (cada obrigação cambial é independente).','facil',
 [['A','Generalidade, literalidade e publicidade',false],['B','Cartularidade, literalidade e autonomia',true],['C','Relatividade, abstração e informalidade',false],['D','Unilateralidade, irrevogabilidade e causabilidade',false]]],

[8,'O aval difere da fiança porque:',
 'O aval é garantia cambial (em títulos de crédito), autônomo e independente da obrigação garantida. A fiança é garantia contratual, acessória e subsidiária (em regra). O aval não se extingue com a nulidade da obrigação principal.','medio',
 [['A','O aval é acessório; a fiança é autônoma',false],['B','O aval é autônomo; a fiança é acessória',true],['C','O aval só pode ser dado por pessoa jurídica',false],['D','A fiança pode ser dada em títulos de crédito',false]]],

[8,'No processo de recuperação judicial, o devedor deve apresentar o plano de recuperação em até:',
 'Art. 53 da Lei 11.101/2005 — o plano de recuperação judicial deve ser apresentado em juízo no prazo improrrogável de 60 dias da publicação da decisão que deferiu o processamento da recuperação.','medio',
 [['A','30 dias da distribuição do pedido',false],['B','60 dias da publicação da decisão que deferiu o processamento',true],['C','90 dias da aprovação pela assembleia de credores',false],['D','120 dias da decretação da insolvência',false]]],

// ── ÁREA 9: Direito do Consumidor ────────────────────────────────────────────
[9,'O prazo decadencial para reclamar por vícios em produtos duráveis, no CDC, é de:',
 'Art. 26 CDC — vícios aparentes ou de fácil constatação: 30 dias (produtos não duráveis) e 90 dias (produtos duráveis). Para vícios ocultos, o prazo inicia da descoberta.','facil',
 [['A','30 dias',false],['B','60 dias',false],['C','90 dias',true],['D','1 ano',false]]],

[9,'A responsabilidade pelo fato do produto (acidente de consumo) no CDC é:',
 'Arts. 12 e 14 CDC — a responsabilidade pelo fato do produto é objetiva para o fabricante, produtor, construtor e importador. O comerciante responde subsidiariamente.','facil',
 [['A','Subjetiva, exigindo culpa do fornecedor',false],['B','Objetiva para o fabricante, produtor, construtor e importador',true],['C','Solidária entre todos os fornecedores da cadeia',false],['D','Limitada ao valor pago pelo consumidor',false]]],

[9,'O direito de arrependimento no CDC pode ser exercido em até:',
 'Art. 49 CDC — o consumidor pode desistir do contrato celebrado fora do estabelecimento comercial (inclusive por telefone ou internet), no prazo de 7 dias a contar da assinatura ou do recebimento do produto.','facil',
 [['A','3 dias da compra',false],['B','7 dias da assinatura do contrato ou do recebimento do produto',true],['C','15 dias para produtos duráveis',false],['D','30 dias para serviços contratados à distância',false]]],

[9,'As cláusulas abusivas nos contratos de consumo são:',
 'Art. 51 CDC — as cláusulas abusivas são nulas de pleno direito (nulidade absoluta), independentemente de sua aceitação pelo consumidor.','medio',
 [['A','Anuláveis, dependendo de provocação do consumidor',false],['B','Válidas se o consumidor as aceitar expressamente',false],['C','Nulas de pleno direito',true],['D','Ineficazes somente em relação a consumidores vulneráveis',false]]],

[9,'No CDC, a publicidade enganosa é aquela que:',
 'Art. 37, §1º CDC — é enganosa qualquer modalidade de informação ou comunicação de caráter publicitário, inteira ou parcialmente falsa, ou que por qualquer outro modo, mesmo por omissão, seja capaz de induzir em erro o consumidor.','medio',
 [['A','Apenas mente sobre o produto',false],['B','Pode induzir o consumidor em erro, inclusive por omissão',true],['C','Exige que o consumidor efetivamente seja enganado',false],['D','Se restringe à publicidade veiculada por TV ou rádio',false]]],

// ── ÁREA 10: Direito Internacional Privado ────────────────────────────────────
[10,'A LINDB adota, para reger a personalidade e a capacidade das pessoas, a lei do:',
 'Art. 7º LINDB — a lei do país em que for domiciliada a pessoa rege a sua personalidade, capacidade e os direitos de família.','medio',
 [['A','País da nacionalidade',false],['B','País do domicílio',true],['C','País onde o ato foi praticado',false],['D','País do foro',false]]],

[10,'Segundo a LINDB, os bens imóveis são regidos pela lei:',
 'Art. 8º LINDB — para qualificar os bens e regular as relações a eles concernentes, aplica-se a lei do país em que estiverem situados (lex rei sitae).','facil',
 [['A','Do domicílio do proprietário',false],['B','Da situação do bem (lex rei sitae)',true],['C','Do país onde o contrato foi celebrado',false],['D','Da nacionalidade do proprietário',false]]],

[10,'O reenvio de 1º grau (remissão) ocorre quando:',
 'O reenvio de 1º grau ocorre quando a lei estrangeira indicada pela norma de conflito nacional reenvia ao direito do foro (do país onde o juiz se encontra). O Brasil, via de regra, não aceita o reenvio (art. 16 LINDB).','dificil',
 [['A','A lei do foro aceita a designação feita pela norma de conflito',false],['B','A lei estrangeira indicada reenvia ao direito do foro',true],['C','O juiz aplica a lex fori em substituição à lei estrangeira',false],['D','Dois países designam mutuamente o direito um do outro',false]]],

[10,'A cláusula de exceção de ordem pública no DIPr permite ao juiz:',
 'Art. 17 LINDB — não se aplicará a lei estrangeira quando sua aplicação ofender a soberania nacional, a ordem pública e os bons costumes.','medio',
 [['A','Aplicar sempre o direito nacional',false],['B','Afastar a lei estrangeira que violar a ordem pública nacional',true],['C','Declarar inválidos todos os atos praticados no exterior',false],['D','Exigir reciprocidade de tratamento',false]]],

[10,'Segundo a LINDB, a obrigação resultante do contrato é regida pela lei do país em que:',
 'Art. 9º LINDB — para qualificar e reger as obrigações, aplica-se a lei do país em que se constituírem (lex loci celebrationis).','medio',
 [['A','O contrato for executado',false],['B','O contrato for constituído (lex loci celebrationis)',true],['C','Residir o devedor',false],['D','For proposta a ação judicial',false]]],

// ── ÁREA 11: Fatos e Negócios Jurídicos ──────────────────────────────────────
[11,'O negócio jurídico simulado é:',
 'Art. 167 CC — o negócio simulado é nulo (vício social de nulidade absoluta), mas o negócio dissimulado subsiste se válido em substância e forma.','medio',
 [['A','Anulável, a pedido de qualquer dos figurantes',false],['B','Nulo, mas subsiste o negócio dissimulado se válido',true],['C','Válido entre as partes, apenas ineficaz perante terceiros',false],['D','Inexistente no plano jurídico',false]]],

[11,'A lesão como vício do negócio jurídico exige:',
 'Art. 157 CC — a lesão ocorre quando uma pessoa, sob premente necessidade ou inexperiência, se obriga a prestação manifestamente desproporcional ao valor da contraprestação. Não é necessária a má-fé do outro.','medio',
 [['A','A má-fé do contratante beneficiado',false],['B','Premente necessidade ou inexperiência aliada à desproporção manifesta',true],['C','A incapacidade do lesado',false],['D','A crise econômica generalizada',false]]],

[11,'O erro substancial, para viciar o negócio jurídico, deve ser:',
 'Art. 138-139 CC — o erro é essencial quando é real (se o declarante soubesse do erro, não teria realizado o negócio) e é recognoscível pelo outro contratante (o destinatário podia perceber que havia erro).','dificil',
 [['A','Doloso e provocado pelo outro contratante',false],['B','Real e recognoscível pelo destinatário da declaração',true],['C','Apenas sobre o objeto principal do negócio',false],['D','Causado por terceiro',false]]],

[11,'O estado de perigo como defeito do negócio jurídico (art. 156 CC) difere da coação porque:',
 'Estado de perigo: o agente assume obrigação excessivamente onerosa para salvar-se ou a pessoa próxima de grave dano. Coação: pressão irresistível que retira a liberdade de vontade. No estado de perigo, não há ameaça do outro contratante.','dificil',
 [['A','No estado de perigo, há ameaça do outro contratante',false],['B','No estado de perigo, o agente age para salvar-se de grave dano, sem ameaça da outra parte',true],['C','O estado de perigo torna o negócio nulo, não anulável',false],['D','A coação exige sempre violência física',false]]],

[11,'A condição ilícita aposta ao negócio jurídico:',
 'Art. 123 CC — invalida o negócio jurídico a condição física ou juridicamente impossível, bem como a condição ilícita ou a de fazer coisa ilícita. A condição fisicamente impossível, se resolutiva, é reputada não escrita.','medio',
 [['A','É reputada não escrita, subsistindo o negócio',false],['B','Invalida o negócio jurídico',true],['C','Converte o negócio em puro',false],['D','Apenas torna o negócio anulável',false]]],

// ── ÁREA 12: Prescrição e Decadência ─────────────────────────────────────────
[12,'A prescrição difere da decadência porque:',
 'Prescrição: extingue a pretensão (direito de ação) referente a direitos subjetivos patrimoniais. Decadência: extingue o próprio direito potestativo. A prescrição pode ser suspensa e interrompida; a decadência legal não admite essas hipóteses.','medio',
 [['A','A prescrição extingue o direito; a decadência, a ação',false],['B','A prescrição extingue a pretensão; a decadência, o direito potestativo',true],['C','A decadência pode ser interrompida; a prescrição não',false],['D','Ambas extinguem o direito e a ação',false]]],

[12,'O prazo prescricional geral no Código Civil é de:',
 'Art. 205 CC — o prazo prescricional geral é de 10 anos quando a lei não fixar prazo menor. Ex.: ações pessoais em geral não contempladas nos prazos especiais do art. 206.','facil',
 [['A','5 anos',false],['B','10 anos',true],['C','15 anos',false],['D','20 anos',false]]],

[12,'A interrupção da prescrição:',
 'Arts. 202-204 CC — a interrupção da prescrição apaga o prazo já transcorrido e o reinicia por inteiro. Só pode ocorrer uma única vez. A suspensão, ao contrário, apenas para o prazo, que continua de onde parou.','medio',
 [['A','Paralisa o prazo, que continua de onde parou',false],['B','Apaga o prazo transcorrido e reinicia por inteiro, podendo ocorrer uma única vez',true],['C','Pode ser declarada de ofício pelo juiz em qualquer caso',false],['D','Não pode ser alegada pela parte beneficiada',false]]],

[12,'A prescrição pode ser renunciada:',
 'Art. 191 CC — a renúncia da prescrição pode ser expressa ou tácita, e só valerá sendo feita sem prejuízo de terceiro, depois que a prescrição se consumar. Antes de consumada, é irrenunciável.','medio',
 [['A','A qualquer momento, antes ou depois de consumada',false],['B','Somente após consumada, sem prejuízo de terceiro',true],['C','Nunca, pois é matéria de ordem pública',false],['D','Antes de consumada, por acordo escrito',false]]],

[12,'O prazo prescricional para ação de reparação de dano causado por ilícito civil no CC é de:',
 'Art. 206, §3º, V, CC — prescreve em 3 anos a pretensão de reparação civil. Este é um dos prazos especiais mais cobrados em provas.','medio',
 [['A','1 ano',false],['B','2 anos',false],['C','3 anos',true],['D','5 anos',false]]],

]

async function main() {
  console.log('🗑  Removendo questões anteriores...')
  await sql`DELETE FROM questao_opcoes`
  await sql`DELETE FROM questoes`

  console.log('📚 Inserindo questões...')
  let total = 0
  for (const [area_id, enunciado, explicacao, dificuldade, opcoes] of banco) {
    const [{ id: qid }] = await sql`
      INSERT INTO questoes (area_id, enunciado, explicacao, dificuldade)
      VALUES (${area_id}, ${enunciado}, ${explicacao}, ${dificuldade})
      RETURNING id
    `
    for (let i = 0; i < opcoes.length; i++) {
      const [letra, texto, correta] = opcoes[i]
      await sql`
        INSERT INTO questao_opcoes (questao_id, letra, texto, correta, ordem)
        VALUES (${qid}, ${letra}, ${texto}, ${correta}, ${i})
      `
    }
    total++
  }

  console.log(`✅ ${total} questões inseridas com sucesso!`)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
