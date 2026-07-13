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
[11,"Duas pessoas celebram compra e venda de um imóvel declarando no contrato preço de R$ 500.000,00, quando na verdade o preço efetivamente pago, do conhecimento de ambas, é R$ 800.000,00. Segundo o art. 167 do CC, esse negócio simulado:",
 "Art. 167 CC — é nulo o negócio jurídico simulado, mas subsistirá o que se dissimulou, se válido for na substância e na forma. O contrato aparente (preço de R$500.000) é nulo; subsiste o negócio realmente querido pelas partes (dissimulado), desde que válido em substância e forma.","facil",
 [["A","É o negócio aparentemente celebrado que é nulo, mas subsiste o dissimulado, se válido na substância e forma",true],["B","É integralmente nulo, inclusive o negócio realmente pretendido pelas partes",false],["C","É plenamente válido, pois decorre da autonomia da vontade das partes",false],["D","É apenas anulável, dependendo de manifestação da parte prejudicada",false]]],

[11,"Para salvar um familiar de grave perigo conhecido pela outra parte, uma pessoa assume obrigação excessivamente onerosa. Esse vício de vontade caracteriza:",
 "Art. 156 CC — configura-se o estado de perigo quando alguém, premido da necessidade de salvar-se, ou a pessoa de sua família, de grave dano conhecido pela outra parte, assume obrigação excessivamente onerosa. Distingue-se da lesão (art. 157), que decorre de premente necessidade ou inexperiência, sem exigir o elemento do grave perigo pessoal ou familiar.","medio",
 [["A","Lesão, pois há desproporção entre as prestações",false],["B","Estado de perigo, pelo grave dano pessoal ou familiar conhecido pela outra parte",true],["C","Coação, pois há uma ameaça configurada",false],["D","Simulação, pois há um negócio aparente e outro real",false]]],

[11,"Um comprador adquire uma joia por erro perceptível a qualquer pessoa de diligência normal nas circunstâncias do negócio, acreditando tratar-se de peça de ouro maciço quando, na verdade, era apenas banhada a ouro. Segundo o art. 138 do CC, esse negócio é:",
 "Art. 138 CC — são anuláveis os negócios jurídicos quando as declarações de vontade emanarem de erro substancial que poderia ser percebido por pessoa de diligência normal, em face das circunstâncias do negócio.","facil",
 [["A","Nulo de pleno direito, independentemente de manifestação da parte",false],["B","Plenamente válido, pois o erro é sempre irrelevante para o direito",false],["C","Anulável, por vício de erro substancial perceptível por pessoa de diligência normal",true],["D","Válido, mas sujeito apenas à retificação do preço pago",false]]],

[11,"Um devedor já insolvente doa gratuitamente um imóvel a um amigo, mesmo sabendo — ou devendo saber — de sua própria insolvência. Nesse caso, os credores quirografários prejudicados podem, segundo os arts. 158 e 161 do CC:",
 "Arts. 158 e 161 CC — os negócios de transmissão gratuita de bens praticados pelo devedor já insolvente podem ser anulados pelos credores quirografários, como lesivos aos seus direitos, ainda que o devedor ignore a própria insolvência (basta a insolvência objetiva). A ação (pauliana) pode ser movida contra o devedor insolvente ou terceiros adquirentes de má-fé.","dificil",
 [["A","Pleitear a anulação do negócio, por se tratar de fraude contra credores",true],["B","Nada podem fazer, pois doações não podem ser desfeitas no direito brasileiro",false],["C","Apenas cobrar juros adicionais sobre o débito do devedor insolvente",false],["D","Exigir que o amigo pague em dobro o valor do imóvel doado",false]]],

[11,"Diferentemente da nulidade, a anulabilidade de um negócio jurídico apresenta qual característica, segundo o art. 177 do CC?",
 "Art. 177 CC — a anulabilidade não tem efeito antes de julgada por sentença, nem se pronuncia de ofício; só os interessados a podem alegar, e aproveita exclusivamente aos que a alegarem, salvo o caso de solidariedade ou indivisibilidade.","medio",
 [["A","Pode ser reconhecida de ofício pelo juiz, independentemente de provocação",false],["B","Produz efeitos automaticamente, mesmo antes de sentença judicial",false],["C","Aproveita a todos os envolvidos no negócio, ainda que não a tenham alegado",false],["D","Depende de sentença judicial e só pode ser alegada pelos interessados, não de ofício",true]]],

[11,"Salvo disposição legal específica em contrário, qual o prazo decadencial geral para pleitear a anulação de um negócio jurídico anulável, segundo o art. 178 do CC?",
 "Art. 178 CC — é de quatro anos o prazo de decadência para pleitear-se a anulação do negócio jurídico. Já o art. 179 estabelece prazo de 2 anos quando a lei prevê a anulabilidade sem fixar prazo específico — hipótese diferente da regra geral do art. 178.","facil",
 [["A","Um ano",false],["B","Dois anos",false],["C","Quatro anos",true],["D","Dez anos",false]]],

[12,"Segundo o art. 189 do Código Civil, o que nasce para o titular de um direito violado, e que se extingue pela prescrição nos prazos legais?",
 "Art. 189 CC — violado o direito, nasce para o titular a pretensão, a qual se extingue, pela prescrição, nos prazos a que aludem os arts. 205 e 206. É a pretensão (e não o direito em si) que é atingida pela prescrição.","facil",
 [["A","A pretensão, que nasce da violação do direito",true],["B","O próprio direito material, que se extingue por completo",false],["C","A capacidade civil do titular do direito",false],["D","A personalidade jurídica do titular do direito",false]]],

[12,"Um devedor deseja renunciar ao prazo prescricional em seu favor antes mesmo de a prescrição se consumar. Segundo o art. 191 do CC, essa renúncia é válida?",
 "Art. 191 CC — a renúncia da prescrição pode ser expressa ou tácita, e só valerá, sendo feita, sem prejuízo de terceiro, depois que a prescrição se consumar. Antes de consumada, a prescrição é irrenunciável.","medio",
 [["A","Sim, a prescrição pode ser renunciada a qualquer momento, mesmo antes de consumada",false],["B","Não, pois a renúncia só é válida depois de consumada a prescrição, sem prejuízo de terceiro",true],["C","Sim, desde que feita por escritura pública",false],["D","Não, pois a prescrição é sempre irrenunciável, mesmo depois de consumada",false]]],

[12,"Um credor promove a citação do devedor, interrompendo a prescrição de sua pretensão. Antes de esgotado o novo prazo, pretende interrompê-la mais uma vez, por outro ato. Isso é possível segundo o art. 202 do CC?",
 "Art. 202, caput, CC — a interrupção da prescrição somente poderá ocorrer uma vez. Uma vez interrompida e reiniciada a contagem, não há nova interrupção possível para a mesma pretensão.","medio",
 [["A","Sim, a interrupção pode ocorrer quantas vezes forem necessárias",false],["B","Sim, mas apenas duas vezes durante toda a relação obrigacional",false],["C","Não, a interrupção da prescrição somente pode ocorrer uma única vez",true],["D","Não, a prescrição uma vez interrompida jamais volta a correr",false]]],

[12,"Segundo o art. 207 do Código Civil, as causas que impedem, suspendem ou interrompem a prescrição:",
 "Art. 207 CC — salvo disposição legal em contrário, não se aplicam à decadência as normas que impedem, suspendem ou interrompem a prescrição. É uma das diferenças centrais entre os dois institutos.","dificil",
 [["A","Aplicam-se igualmente à decadência, sem qualquer ressalva",false],["B","Aplicam-se à decadência apenas quando o prazo for superior a 5 anos",false],["C","Aplicam-se à decadência somente nas relações de consumo",false],["D","Não se aplicam à decadência, salvo disposição legal em contrário",true]]],

[12,"Quando a lei não fixar prazo prescricional menor para determinada pretensão, qual o prazo geral de prescrição estabelecido pelo art. 205 do CC?",
 "Art. 205 CC — a prescrição ocorre em dez anos, quando a lei não lhe haja fixado prazo menor. É o prazo geral, aplicável residualmente quando não há prazo especial previsto.","facil",
 [["A","Dez anos",true],["B","Três anos",false],["C","Cinco anos",false],["D","Vinte anos",false]]],

[12,"Segundo o art. 209 do Código Civil, a renúncia à decadência fixada em lei:",
 "Art. 209 CC — é nula a renúncia à decadência fixada em lei. Diferentemente da prescrição (que pode ser renunciada após consumada, conforme art. 191), a decadência legal é sempre irrenunciável, justamente por envolver prazo de ordem pública estabelecido pelo legislador.","medio",
 [["A","É válida, desde que feita por instrumento público",false],["B","É válida, se realizada após o decurso de metade do prazo",false],["C","Depende de homologação judicial para produzir efeitos",false],["D","É nula, tratando-se de matéria de ordem pública",true]]],

[1,"Segundo o art. 45 do CC, quando começa a existência legal de uma pessoa jurídica de direito privado?",
 "Art. 45 CC — começa a existência legal das pessoas jurídicas de direito privado com a inscrição do ato constitutivo no respectivo registro, precedida, quando necessário, de autorização ou aprovação do Poder Executivo.","facil",
 [["A","Com a inscrição do ato constitutivo no respectivo registro",true],["B","Com a assinatura do contrato ou estatuto social entre os sócios",false],["C","Com o primeiro ato de comércio praticado pela entidade",false],["D","Com a obtenção do CNPJ perante a Receita Federal",false]]],

[1,"Um trator permanece há anos a serviço de uma fazenda, sem, contudo, integrar-se fisicamente a ela. O proprietário vende a fazenda sem qualquer menção ao trator no contrato. Segundo os arts. 93 e 94 do CC, o trator (pertença):",
 "Arts. 93 e 94 CC — pertenças são os bens que, não constituindo partes integrantes, se destinam de modo duradouro ao uso, serviço ou aformoseamento de outro; os negócios jurídicos relativos ao bem principal não abrangem as pertenças, salvo se o contrário resultar da lei, da manifestação de vontade ou das circunstâncias. Silente o contrato, a pertença NÃO segue o principal.","medio",
 [["A","Segue automaticamente o bem principal, por ser acessório dele",false],["B","Integra a venda apenas se estiver fisicamente fixado ao solo",false],["C","Não integra a venda, pois pertenças não seguem o principal, salvo disposição em contrário",true],["D","Só pode ser vendido em conjunto com a fazenda, por força de lei",false]]],

[1,"Os direitos da personalidade, segundo o art. 11 do Código Civil, possuem qual característica quanto à possibilidade de limitação por vontade do próprio titular?",
 "Art. 11 CC — com exceção dos casos previstos em lei, os direitos da personalidade são intransmissíveis e irrenunciáveis, não podendo o seu exercício sofrer limitação voluntária. A regra geral veda que o próprio titular limite voluntariamente o exercício desses direitos.","medio",
 [["A","Podem ser livremente limitados por contrato entre particulares",false],["B","Podem ser cedidos a terceiros mediante remuneração",false],["C","Perdem-se automaticamente se não exercidos por cinco anos",false],["D","Não podem, em regra, sofrer limitação voluntária pelo próprio titular",true]]],

[1,"Diante de uma ameaça a direito da personalidade (por exemplo, risco iminente de divulgação indevida de imagem), o que o art. 12 do CC autoriza que o titular exija, mesmo antes da efetiva lesão?",
 "Art. 12 CC — pode-se exigir que cesse a ameaça, ou a lesão, a direito da personalidade, e reclamar perdas e danos, sem prejuízo de outras sanções previstas em lei. A tutela abrange tanto a lesão consumada quanto a mera ameaça.","facil",
 [["A","Que cesse a ameaça, além de poder reclamar perdas e danos",true],["B","Apenas indenização, após a efetiva consumação do dano",false],["C","Nada, pois a lei só protege a lesão já consumada",false],["D","Somente a abertura de inquérito policial",false]]],

[1,"Os Estados estrangeiros e as organizações regidas pelo direito internacional público são, segundo o art. 42 do CC, classificados como:",
 "Art. 42 CC — são pessoas jurídicas de direito público externo os Estados estrangeiros e todas as pessoas que forem regidas pelo direito internacional público. Distinguem-se das pessoas jurídicas de direito público interno (União, Estados, DF, Municípios e autarquias, art. 41).","facil",
 [["A","Pessoas jurídicas de direito público interno",false],["B","Pessoas jurídicas de direito público externo",true],["C","Pessoas jurídicas de direito privado",false],["D","Entes despersonalizados, sem natureza de pessoa jurídica",false]]],

[1,"Um imóvel possui um ar-condicionado fixado de forma permanente na parede, de modo a não poder ser retirado sem dano à estrutura. Esse aparelho, em relação ao imóvel, é classificado, à luz dos arts. 92 e 93 do CC, como:",
 "Arts. 92 e 93 CC — o acessório é aquele cuja existência supõe a do principal (art. 92); já a pertença se destina de modo duradouro ao uso do bem principal, mas sem se integrar fisicamente a ele (art. 93). O ar-condicionado fixado permanentemente, incorporado à estrutura, configura parte integrante/acessório do imóvel, e não mera pertença — por isso, ao contrário das pertenças, acompanha o principal na alienação, salvo ressalva expressa.","dificil",
 [["A","Pertença, não acompanhando o imóvel na venda, salvo disposição em contrário",false],["B","Bem imóvel autônomo, com matrícula própria no registro de imóveis",false],["C","Bem fora do comércio, insuscetível de alienação em conjunto com o imóvel",false],["D","Parte acessória incorporada ao imóvel, acompanhando-o na alienação, salvo ressalva expressa",true]]],

[2,"Três devedores (A, B e C) são solidariamente obrigados perante um credor por uma dívida de R$ 30.000,00. O credor pode exigir o pagamento integral de apenas um dos devedores?",
 "Art. 275 CC — o credor tem direito a exigir e receber de um ou de alguns dos devedores, parcial ou totalmente, a dívida comum. Na solidariedade passiva, cada devedor responde pela dívida toda, cabendo depois ao que pagou o direito de regresso contra os demais (art. 283).","facil",
 [["A","Sim, pode exigir de um só devedor o pagamento integral da dívida",true],["B","Não, deve necessariamente dividir a cobrança entre os três devedores",false],["C","Só pode exigir o total se os três forem citados no mesmo processo",false],["D","Não, a solidariedade passiva presume-se apenas quando prevista em contrato escrito",false]]],

[2,"Marcos cede seu crédito contra Bruno para Carla, mas Bruno não é notificado da cessão. Sem saber da cessão, Bruno paga a dívida diretamente a Marcos (credor originário). Esse pagamento:",
 "Arts. 290 e 292 CC — a cessão do crédito não tem eficácia em relação ao devedor, senão quando a este notificada; fica desobrigado o devedor que, antes de ter conhecimento da cessão, paga ao credor primitivo. Bruno pagou de boa-fé, sem notificação, então está exonerado.","medio",
 [["A","É válido e exonera Bruno, pois ele não havia sido notificado da cessão",true],["B","É nulo, pois a cessão já havia transferido o crédito a Carla",false],["C","É válido, mas Bruno terá que pagar novamente a Carla",false],["D","Depende de registro público da cessão para ter qualquer efeito",false]]],

[2,"Um contrato prevê o pagamento de quantia certa em data determinada. Chegada a data, o devedor não paga. Para que se configure a mora do devedor nesse caso, é necessária a interpelação (notificação) do credor?",
 "Art. 397, caput, CC — o inadimplemento da obrigação positiva e líquida, no seu termo, constitui de pleno direito em mora o devedor (mora ex re). Não é necessária qualquer interpelação: o vencimento do prazo já opera a mora automaticamente (\"dies interpellat pro homine\").","medio",
 [["A","Sim, sem interpelação judicial ou extrajudicial não há mora",false],["B","Não, a mora se constitui de pleno direito com o vencimento do termo",true],["C","Sim, mas apenas se a obrigação for de valor superior a determinado limite",false],["D","Não, mas somente se o contrato expressamente dispensar a interpelação",false]]],

[2,"Em contrato de R$ 100.000,00, as partes estipulam cláusula penal de R$ 150.000,00 para o caso de inadimplemento total. O devedor cumpre metade da obrigação e depois descumpre o restante. Nessa hipótese, o Código Civil autoriza que:",
 "Arts. 412 e 413 CC — o valor da cominação imposta na cláusula penal não pode exceder o da obrigação principal (aqui, o teto seria R$ 100.000,00); além disso, a penalidade deve ser reduzida equitativamente pelo juiz quando a obrigação principal tiver sido cumprida em parte, ou quando o montante for manifestamente excessivo.","dificil",
 [["A","A cláusula penal seja aplicada integralmente, respeitada a autonomia da vontade",false],["B","O juiz reduza equitativamente a penalidade, observado o limite do valor da obrigação principal",true],["C","A cláusula penal seja considerada nula de pleno direito por exceder o valor principal",false],["D","O credor escolha livremente entre a cláusula penal e as perdas e danos, sem limite de valor",false]]],

[2,"Ana deve a Pedro uma quantia certa em dinheiro, já vencida. Pedro, por sua vez, deve a Ana o cumprimento de uma obrigação de fazer (pintar um retrato), também já vencida. Pode haver compensação entre essas duas dívidas?",
 "Art. 369 CC — a compensação efetua-se entre dívidas líquidas, vencidas e de coisas fungíveis. Embora ambas as dívidas estejam vencidas, a obrigação de fazer (pintar um retrato) não é fungível nem se confunde com dinheiro, faltando o requisito da fungibilidade recíproca das prestações.","medio",
 [["A","Sim, basta que ambas as dívidas estejam vencidas",false],["B","Sim, pois a compensação independe da natureza das prestações",false],["C","Não, pois falta o requisito da fungibilidade entre as prestações",true],["D","Não, pois a compensação exige sempre autorização judicial prévia",false]]],

[2,"Em contrato de compra e venda, as partes estipulam arras no ato da celebração, sem prever cláusula de direito de arrependimento. O comprador desiste do negócio. O vendedor (parte inocente) pode reter as arras e ainda pleitear indenização suplementar, provando prejuízo maior?",
 "Arts. 417 e 419 CC — sem cláusula de arrependimento, as arras são confirmatórias: em caso de inexecução, a parte inocente pode reter as arras (ou exigir a execução do contrato) e, provando maior prejuízo, pedir indenização suplementar, valendo as arras como taxa mínima. A vedação à indenização suplementar (art. 420) só se aplica quando há direito de arrependimento estipulado — o que não é o caso aqui.","dificil",
 [["A","Não, pois as arras sempre têm função exclusivamente indenizatória",false],["B","Não, pois a indenização suplementar só cabe em contratos de consumo",false],["C","Sim, mas apenas se o contrato for registrado em cartório",false],["D","Sim, pois sem cláusula de arrependimento as arras são confirmatórias, cabendo indenização suplementar se provado maior prejuízo",true]]],

[2,"Em contrato que estipula cláusula penal exclusivamente \"para o caso de mora\" (cláusula penal moratória), ocorrido o atraso do devedor, o credor pretende exigir simultaneamente a satisfação da pena convencionada E o cumprimento integral da obrigação principal. Segundo o art. 411 do CC, isso é possível?",
 "Art. 411 CC — quando se estipular a cláusula penal para o caso de mora, terá o credor o arbítrio de exigir a satisfação da pena cominada, juntamente com o desempenho da obrigação principal. É a cláusula penal moratória, cumulável com o cumprimento — diferente da cláusula penal compensatória (art. 410, para o inadimplemento total), que se converte em alternativa a benefício do credor (ou a pena, ou o cumprimento, nunca ambos).","dificil",
 [["A","Não, a cláusula penal, seja moratória ou compensatória, sempre substitui o cumprimento da obrigação",false],["B","Sim, pois a cláusula penal moratória pode ser exigida cumulativamente com o cumprimento da obrigação principal",true],["C","Não, o credor deve escolher entre a pena e o cumprimento, nunca ambos, qualquer que seja o tipo de cláusula",false],["D","Sim, mas apenas se o contrato for de adesão",false]]],

[2,"Um credor tem obrigação solidária contra três devedores (A, B e C). Promove citação judicial apenas contra A, interrompendo a prescrição em relação a ele. Já esgotado o prazo prescricional quanto a B e C, sem que contra eles tenha sido movida qualquer ação, o credor pretende cobrá-los, sustentando que a interrupção contra A aproveitaria a todos, por se tratar de obrigação solidária. Segundo o art. 204 do CC, esse argumento procede?",
 "Art. 204 CC — a interrupção da prescrição operada contra o co-devedor não prejudica aos demais coobrigados. Mesmo em obrigações solidárias, a interrupção da prescrição contra um dos devedores é pessoal a ele, não se estendendo automaticamente aos demais codevedores.","dificil",
 [["A","Procede, pois a solidariedade estende a todos os efeitos processuais praticados contra qualquer codevedor",false],["B","Não procede, pois a interrupção operada contra um codevedor não prejudica os demais coobrigados",true],["C","Procede, mas somente se a obrigação for indivisível, e não meramente solidária",false],["D","Não procede, pois a prescrição jamais pode ser interrompida em obrigações solidárias",false]]],

[3,"A liberdade contratual das partes, segundo o Código Civil, deve ser exercida:",
 "Art. 421 CC (redação da Lei 13.874/2019, Lei da Liberdade Econômica) — a liberdade contratual será exercida nos limites da função social do contrato. Não é liberdade absoluta, mas também não se limita a relações de consumo: aplica-se a todo contrato civil ou empresarial.","facil",
 [["A","De forma absoluta, sem qualquer limitação",false],["B","Nos limites da função social do contrato",true],["C","Apenas nos contratos de consumo",false],["D","Somente quando houver cláusula expressa nesse sentido",false]]],

[3,"Segundo a literalidade do art. 422 do Código Civil, os contratantes são obrigados a guardar os princípios de probidade e boa-fé:",
 "Art. 422 CC — \"assim na conclusão do contrato, como em sua execução\". O texto legal não menciona expressamente a fase pré-contratual (das negociações preliminares); é a jurisprudência do STJ, com base na doutrina da culpa in contrahendo, que estende a boa-fé objetiva a essa fase, mas isso é construção doutrinária/jurisprudencial, não a literalidade do artigo — pegadinha comum em prova.","medio",
 [["A","Apenas na fase de execução do contrato",false],["B","Apenas no momento da celebração, sendo dispensável depois",false],["C","Tanto na conclusão quanto na execução do contrato",true],["D","Somente nas relações de consumo",false]]],

[3,"Em um contrato de adesão, cláusula que estipule a renúncia antecipada do aderente a direito resultante da natureza do negócio é:",
 "Art. 424 CC — nos contratos de adesão, são nulas as cláusulas que estipulem a renúncia antecipada do aderente a direito resultante da natureza do negócio. É nulidade, não mera anulabilidade.","facil",
 [["A","Nula",true],["B","Anulável, dependendo de prazo decadencial",false],["C","Válida, pois decorre da autonomia da vontade",false],["D","Válida, mas ineficaz perante terceiros",false]]],

[3,"João compra um veículo usado (bem móvel) que apresenta vício oculto. O defeito só se manifesta 40 dias após a entrega efetiva do bem, e não havia cláusula de garantia contratual. João pretende agora redibir o contrato. De acordo com o CC:",
 "Art. 445 CC — o adquirente decai do direito de obter a redibição ou abatimento no preço em 30 dias, se a coisa for móvel (ou 1 ano se for imóvel), contado da entrega efetiva. Sem cláusula de garantia (que afastaria a contagem, conforme art. 446), João já decaiu do direito ao completar o 31º dia.","medio",
 [["A","Ainda pode redibir, pois o prazo para bens móveis é de 90 dias",false],["B","O prazo só começa a contar da descoberta do vício, então ainda pode agir",false],["C","Não há prazo decadencial para vício redibitório em bem móvel",false],["D","Já decaiu do direito, pois o prazo para bens móveis é de 30 dias contados da entrega",true]]],

[3,"Pedro adquire um imóvel sabendo, no momento da aquisição, que ele era objeto de disputa judicial (litigioso). Posteriormente, Pedro vem a perder o bem para o verdadeiro proprietário. Pedro pode demandar o alienante pela evicção?",
 "Art. 457 CC — não pode o adquirente demandar pela evicção se sabia que a coisa era alheia ou litigiosa. Ao adquirir ciente do risco, Pedro assumiu-o.","medio",
 [["A","Não, pois sabia que a coisa era litigiosa no momento da aquisição",true],["B","Sim, a garantia da evicção é sempre devida, independentemente da má-fé do adquirente",false],["C","Sim, mas apenas se o contrato for gratuito",false],["D","Não, mas apenas se a evicção for total, e não parcial",false]]],

[3,"Um contrato prevê expressamente cláusula resolutiva para o caso de inadimplemento de uma das partes. Ocorrido o inadimplemento, a parte lesada pretende considerar o contrato resolvido. Segundo o art. 474 do CC:",
 "Art. 474 CC — a cláusula resolutiva expressa opera de pleno direito (automaticamente, dispensando interpelação judicial); já a cláusula resolutiva tácita depende de interpelação judicial para produzir efeitos.","dificil",
 [["A","É necessária interpelação judicial em qualquer caso de cláusula resolutiva",false],["B","Cláusula resolutiva expressa é nula de pleno direito no Código Civil",false],["C","A cláusula resolutiva expressa opera de pleno direito, sem necessidade de interpelação judicial",true],["D","Somente o Poder Judiciário pode declarar a resolução, ainda que a cláusula seja expressa",false]]],

[3,"Em um contrato bilateral (sinalagmático), uma das partes, sem ter cumprido sua própria obrigação, exige da outra o cumprimento da prestação a que esta se obrigou. Essa exigência é legítima?",
 "Art. 476 CC — nos contratos bilaterais, nenhum dos contratantes, antes de cumprida a sua obrigação, pode exigir o implemento da do outro. É a chamada exceção de contrato não cumprido (exceptio non adimpleti contractus).","medio",
 [["A","Sim, a exigência é sempre legítima, independentemente do cumprimento da própria obrigação",false],["B","Não, pois nenhum contratante pode exigir o implemento da obrigação alheia antes de cumprir a própria",true],["C","Sim, desde que o contrato seja unilateral",false],["D","Não, mas apenas se o contrato tiver mais de duas partes",false]]],

[3,"Um contrato de execução continuada torna-se excessivamente oneroso para uma das partes em razão de acontecimento extraordinário e imprevisível, gerando extrema vantagem para a outra parte. Nessa hipótese, o devedor prejudicado pode:",
 "Art. 478 CC (teoria da imprevisão) — o devedor pode pedir a resolução do contrato, retroagindo os efeitos da sentença à data da citação. Pelo art. 479, a resolução pode ser evitada se o réu se oferecer para modificar equitativamente as condições do contrato.","dificil",
 [["A","Apenas rescindir unilateralmente o contrato, sem intervenção judicial",false],["B","Somente pedir indenização, sem possibilidade de resolução",false],["C","Nada, pois o CC não prevê essa hipótese para contratos privados",false],["D","Pedir a resolução judicial do contrato, com efeitos retroativos à citação",true]]],

[3,"Firmado contrato preliminar de compra e venda, sem cláusula de arrependimento, uma das partes se recusa a celebrar o contrato definitivo, mesmo após ser notificada e esgotado o prazo assinado. Nessa situação, o CC autoriza que:",
 "Arts. 463 e 464 CC — a parte interessada tem o direito de exigir a celebração do definitivo; esgotado o prazo, o juiz pode, a pedido do interessado, suprir a vontade da parte inadimplente, conferindo caráter definitivo ao contrato preliminar, salvo se a isso se opuser a natureza da obrigação.","medio",
 [["A","O juiz supra a vontade da parte inadimplente, conferindo caráter definitivo ao contrato preliminar",true],["B","O contrato preliminar seja simplesmente ignorado, sem qualquer efeito jurídico",false],["C","Apenas a parte lesada seja indenizada, sendo vedada a execução específica no Brasil",false],["D","O contrato preliminar seja automaticamente anulado por falta de forma",false]]],

[3,"Marcos promete que Tício (terceiro que ainda não se comprometeu a nada) prestará determinado serviço a Ana. Tício, no entanto, não executa a prestação. De acordo com o art. 439 do CC:",
 "Art. 439 CC — aquele que tiver prometido fato de terceiro responderá por perdas e danos quando este não o executar. Diferente é a hipótese do art. 440: se o terceiro já havia se obrigado e depois falta à prestação, quem prometeu não responde.","dificil",
 [["A","Marcos não responde, pois a obrigação era de Tício",false],["B","A promessa de fato de terceiro é nula no direito brasileiro",false],["C","Marcos responde por perdas e danos perante Ana",true],["D","Ana só pode acionar Tício diretamente, nunca Marcos",false]]],

[3,"Fernanda compra de Ricardo um imóvel, ciente, no momento da aquisição, de que ele era objeto de disputa judicial movida por terceiro. Meses depois, perde o imóvel para o verdadeiro proprietário em razão dessa disputa. Paralelamente, durante as negociações, Ricardo havia afirmado — falsamente e de forma intencional — que o imóvel possuía 200 m², quando na verdade tinha apenas 150 m², fato que Fernanda só veio a descobrir após a celebração do contrato. Considerando os dois fatos, é correto afirmar que Fernanda:",
 "Dois vícios distintos e independentes. Quanto à evicção: como Fernanda sabia que a coisa era litigiosa, não pode demandar Ricardo pela evicção (art. 457 CC). Quanto à metragem: o dolo de Ricardo sobre a metragem real do imóvel é vício de vontade autônomo (arts. 138 e 145 CC), que não se confunde com a evicção nem é afastado pelo conhecimento do litígio — a ciência da disputa judicial não supre nem convalida a informação falsa sobre a metragem. Fernanda pode anular o negócio por dolo, ainda que não possa alegar evicção.","dificil",
 [["A","Não pode agir de nenhuma forma, pois sabia do litígio e isso convalida todo o negócio",false],["B","Só pode acionar Ricardo pela evicção, pois o dolo sobre a metragem se absorve na evicção",false],["C","Não pode alegar evicção (pois sabia do litígio), mas pode pleitear a anulação do negócio por dolo quanto à metragem",true],["D","Pode alegar evicção normalmente, pois o conhecimento do litígio só afasta o dolo, não a evicção",false]]],

[4,"João, por ato ilícito nos termos dos arts. 186 e 187 do CC, causa dano a Maria. Qual a consequência jurídica imediata prevista no art. 927?",
 "Art. 927 CC — aquele que, por ato ilícito, causar dano a outrem, fica obrigado a repará-lo. O dever de reparar surge diretamente da prática do ato ilícito que causou o dano, independentemente de qualquer outra condição.","facil",
 [["A","João só responde civilmente se houver condenação criminal prévia",false],["B","João fica obrigado a reparar o dano causado a Maria",true],["C","João só responde se tiver agido com dolo, nunca com culpa",false],["D","A responsabilidade só existe se Maria mover ação no prazo de 30 dias",false]]],

[4,"Um adolescente de 15 anos causa dano a terceiro em situação na qual seus responsáveis não têm obrigação de indenizar ou não dispõem de meios suficientes para fazê-lo. Segundo o art. 928 do CC:",
 "Art. 928 CC — o incapaz responde pelos prejuízos que causar, se as pessoas por ele responsáveis não tiverem obrigação de fazê-lo ou não dispuserem de meios suficientes. É uma responsabilização subsidiária e excepcional do próprio incapaz, quando os responsáveis não puderem arcar com a reparação.","medio",
 [["A","O incapaz nunca pode ser responsabilizado, sob nenhuma hipótese",false],["B","O incapaz pode responder subsidiariamente pelos prejuízos, nessa hipótese",true],["C","A vítima fica sem qualquer direito à reparação nesse caso",false],["D","Somente o Estado pode ser acionado para reparar o dano",false]]],

[4,"Uma empresa é responsabilizada civilmente pelos atos de um empregado seu, praticados no exercício do trabalho, ainda que fique comprovado que a empresa não agiu com culpa na escolha ou fiscalização do empregado. Essa responsabilização se fundamenta:",
 "Art. 933 CC — as pessoas indicadas nos incisos do art. 932 (entre elas o empregador, pelos atos de seus empregados no exercício do trabalho) respondem pelos atos de terceiros ainda que não haja culpa de sua parte. É hipótese de responsabilidade objetiva por fato de terceiro.","dificil",
 [["A","Na responsabilidade subjetiva, exigindo sempre prova de culpa da empresa",false],["B","Em cláusula contratual específica, sem previsão legal geral",false],["C","Apenas em relações de consumo, não se aplicando ao Código Civil",false],["D","Na responsabilidade objetiva por fato de terceiro, prevista no art. 933 c/c art. 932 do CC",true]]],

[4,"Pedro sofre um acidente causado por Carlos, mas fica demonstrado que Pedro também contribuiu culposamente para o evento danoso. Segundo o art. 945 do CC, como deve o juiz fixar a indenização?",
 "Art. 945 CC — se a vítima tiver concorrido culposamente para o evento danoso, a sua indenização será fixada tendo-se em conta a gravidade de sua culpa em confronto com a do autor do dano. É a chamada compensação/concorrência de culpas.","medio",
 [["A","A indenização deve ser integral, ignorando a culpa da vítima",false],["B","A ação deve ser julgada improcedente sempre que houver culpa concorrente",false],["C","A indenização deve ser proporcional, considerando a gravidade da culpa de cada um",true],["D","A indenização deve ser dividida sempre em partes exatamente iguais",false]]],

[4,"Bruno sofre um acidente causado por Cláudio, ficando demonstrado que Bruno contribuiu com 30% de culpa para o evento e Cláudio com 70%. Bruno ajuíza ação de reparação civil 3 anos e 4 meses após o acidente, sem que tenha ocorrido qualquer causa de suspensão ou interrupção da prescrição nesse período. Sobre o caso, é correto afirmar que:",
 "Duas questões distintas incidem no caso. Quanto ao mérito, a culpa concorrente de Bruno (30%) reduziria proporcionalmente a indenização, nos termos do art. 945 CC. Mas, quanto ao prazo, a pretensão de reparação civil por ilícito extracontratual prescreve em 3 anos (art. 206, §3º, V, CC) — e como já se passaram 3 anos e 4 meses sem suspensão ou interrupção, a pretensão de Bruno já está prescrita. A questão de mérito (culpa concorrente) sequer chega a ser discutida, pois a prescrição é preliminar e extingue a pretensão.","dificil",
 [["A","A indenização será reduzida em 30%, pela culpa concorrente de Bruno, e a ação deve prosseguir normalmente",false],["B","A pretensão de Bruno já está prescrita, pois o prazo de 3 anos para reparação civil já se esgotou",true],["C","Não há prescrição, pois o prazo geral de 10 anos ainda não se completou",false],["D","A ação é imprescritível, por se tratar de reparação de dano à integridade física",false]]],

[4,"Em ação de indenização por dano material decorrente de ato ilícito, qual critério o art. 944 do CC estabelece para a medida da indenização?",
 "Art. 944, caput, CC — a indenização mede-se pela extensão do dano. É o princípio da reparação integral: a indenização deve corresponder exatamente à extensão do prejuízo sofrido, nem mais, nem menos (o parágrafo único do mesmo artigo permite redução equitativa em caso de excessiva desproporção entre culpa e dano).","facil",
 [["A","A extensão do dano efetivamente sofrido pela vítima",true],["B","O grau de dolo ou culpa do causador do dano, exclusivamente",false],["C","A capacidade econômica do causador do dano, exclusivamente",false],["D","Um valor fixo estabelecido em tabela do Conselho Nacional de Justiça",false]]],

[5,"Um possuidor obteve a posse de um imóvel de forma pacífica e às claras, mas, no momento da aquisição, desconhecia que o imóvel havia sido objeto de um vício anterior (por exemplo, aquisição de quem não era o verdadeiro proprietário). Segundo os arts. 1.200 e 1.201 do CC, essa posse é, respectivamente:",
 "Arts. 1.200 e 1.201 CC — é justa a posse que não for violenta, clandestina ou precária (critério objetivo, relativo ao modo de aquisição); é de boa-fé a posse quando o possuidor ignora o vício ou obstáculo que impede a aquisição da coisa (critério subjetivo, relativo ao conhecimento do possuidor). São qualificações distintas e cumuláveis.","medio",
 [["A","Justa e de boa-fé, pois o modo de aquisição foi pacífico e o possuidor ignorava o vício",true],["B","Injusta e de má-fé, pois havia vício na cadeia de aquisição do imóvel",false],["C","Justa, mas necessariamente de má-fé, por existir vício anterior",false],["D","De boa-fé, mas necessariamente injusta, por existir vício anterior",false]]],

[5,"Uma pessoa possui um imóvel rural como se dono fosse, ininterruptamente e sem oposição, por 15 anos, sem possuir qualquer título de aquisição e sem estar de boa-fé. Segundo o art. 1.238 do CC, essa pessoa:",
 "Art. 1.238, caput, CC — aquele que, por quinze anos, sem interrupção nem oposição, possuir como seu um imóvel, adquire-lhe a propriedade, independentemente de título e boa-fé. É a usucapião extraordinária, que dispensa justo título e boa-fé, exigindo apenas a posse qualificada pelo tempo.","facil",
 [["A","Não adquire a propriedade, pois usucapião sempre exige boa-fé",false],["B","Adquire a propriedade por usucapião extraordinária, independentemente de título e boa-fé",true],["C","Adquire apenas a posse, nunca a propriedade, sem registro prévio",false],["D","Precisa aguardar mais 10 anos, totalizando 25 anos de posse",false]]],

[5,"Uma família possui, para sua moradia, área urbana de 200 m², de forma ininterrupta e sem oposição, por 5 anos, não sendo proprietária de qualquer outro imóvel urbano ou rural. Segundo o art. 1.240 do CC, essa família:",
 "Art. 1.240 CC — aquele que possuir, como sua, área urbana de até 250 m², por 5 anos ininterruptamente e sem oposição, utilizando-a para moradia própria ou de sua família, adquire-lhe o domínio, desde que não seja proprietário de outro imóvel urbano ou rural. É a usucapião especial urbana (constitucional).","medio",
 [["A","Não pode usucapir, pois a área urbana máxima permitida é de 150 m²",false],["B","Só pode usucapir após 10 anos de posse, mesmo em área urbana",false],["C","Não pode usucapir, pois usucapião urbana exige sempre justo título registrado",false],["D","Pode adquirir a propriedade por usucapião especial urbana, preenchidos os requisitos do art. 1.240",true]]],

[5,"Uma pessoa possui um imóvel de forma contínua e incontestada, com justo título e boa-fé, por 10 anos. Segundo o art. 1.242 do CC, essa modalidade de aquisição da propriedade é conhecida como:",
 "Art. 1.242, caput, CC — adquire também a propriedade do imóvel aquele que, contínua e incontestadamente, com justo título e boa-fé, o possuir por dez anos. É a usucapião ordinária, que exige justo título e boa-fé (diferentemente da extraordinária do art. 1.238, que os dispensa).","facil",
 [["A","Usucapião extraordinária",false],["B","Desapropriação indireta",false],["C","Usucapião ordinária",true],["D","Usucapião especial rural",false]]],

[5,"Celebrado contrato de compra e venda de imóvel, a propriedade transfere-se entre vivos para o comprador em qual momento, segundo o art. 1.245 do CC?",
 "Art. 1.245, caput, CC — transfere-se entre vivos a propriedade mediante o registro do título translativo no Registro de Imóveis. No sistema brasileiro, o mero contrato gera apenas direito obrigacional; a propriedade imóvel só se transfere com o registro (diferentemente dos bens móveis, transferidos pela tradição).","dificil",
 [["A","No momento da assinatura do contrato de compra e venda",false],["B","No momento do pagamento integral do preço",false],["C","Com o registro do título translativo no Registro de Imóveis",true],["D","Com a simples posse direta do imóvel pelo comprador",false]]],

[5,"Um imóvel é dado em hipoteca para garantir dívida parcelada em 12 prestações. Após o pagamento de 6 das 12 prestações, o devedor pretende liberar metade da garantia hipotecária, proporcionalmente ao valor já pago. Segundo o art. 1.421 do CC, isso é possível, salvo disposição expressa em contrário?",
 "Art. 1.421 CC — o pagamento de uma ou mais prestações da dívida não importa exoneração correspondente da garantia, ainda que esta compreenda vários bens, salvo disposição expressa no título ou na quitação. É o princípio da indivisibilidade da garantia real.","dificil",
 [["A","Sim, a garantia se libera automaticamente na proporção do valor pago",false],["B","Não, pois a garantia real é indivisível, salvo disposição expressa em contrário",true],["C","Sim, mas apenas mediante autorização do Registro de Imóveis",false],["D","Não, a garantia hipotecária nunca pode ser objeto de disposição em contrário",false]]],

[5,"Uma pessoa ocupa um terreno alheio por 20 anos ininterruptos e sem oposição, sempre plenamente ciente, durante todo esse período, de que o imóvel pertencia a outra pessoa (ou seja, de má-fé, sem qualquer título). Ela pretende agora requerer a usucapião. Considerando que a usucapião ordinária (art. 1.242 CC) exige justo título e boa-fé, essa pessoa pode adquirir a propriedade por usucapião?",
 "Arts. 1.238 e 1.242 CC — a usucapião ordinária (art. 1.242) exige justo título e boa-fé, requisitos que faltam no caso. Mas a usucapião extraordinária (art. 1.238) independe de título e boa-fé, bastando a posse mansa, pacífica e ininterrupta por 15 anos. Como os 20 anos de posse superam os 15 anos exigidos, a pessoa adquire a propriedade por usucapião extraordinária, ainda que estivesse de má-fé durante toda a posse.","dificil",
 [["A","Não, pois toda modalidade de usucapião no CC exige boa-fé do possuidor",false],["B","Sim, por usucapião extraordinária, que dispensa título e boa-fé, bastando os 15 anos de posse",true],["C","Não, a má-fé durante a posse impede qualquer modalidade de usucapião",false],["D","Sim, mas apenas por usucapião ordinária, computando-se o dobro do prazo por má-fé",false]]],

[6,"Segundo o art. 1.514 do CC, em que momento exato se considera realizado o casamento civil?",
 "Art. 1.514 CC — o casamento se realiza no momento em que o homem e a mulher manifestam, perante o juiz, a sua vontade de estabelecer vínculo conjugal, e o juiz os declara casados. É o momento da declaração do juiz, após a manifestação de vontade dos nubentes.","facil",
 [["A","No momento em que os nubentes manifestam vontade perante o juiz e este os declara casados",true],["B","No momento da habilitação do casamento no cartório",false],["C","No momento da celebração da festa de casamento",false],["D","No momento do registro civil, dias após a cerimônia",false]]],

[6,"Um jovem de 16 anos pretende se casar. Segundo o art. 1.517 do CC, isso é juridicamente possível?",
 "Art. 1.517 CC — o homem e a mulher com 16 anos podem casar, exigindo-se autorização de ambos os pais, ou de seus representantes legais, enquanto não atingida a maioridade civil.","medio",
 [["A","Não, o casamento só é permitido a partir dos 18 anos, sem exceção",false],["B","Sim, mas somente mediante autorização judicial, nunca dos pais",false],["C","Sim, aos 16 anos, desde que haja autorização de ambos os pais ou representantes legais",true],["D","Sim, livremente, sem necessidade de qualquer autorização",false]]],

[6,"Um casamento anulável foi contraído de boa-fé por ambos os cônjuges. Posteriormente, é decretada sua anulação por sentença judicial. Segundo o art. 1.561 do CC, quais efeitos esse casamento produziu em relação aos cônjuges e aos filhos, até a data da sentença?",
 "Art. 1.561 CC — embora anulável ou mesmo nulo, se contraído de boa-fé por ambos os cônjuges, o casamento produz todos os efeitos até o dia da sentença anulatória, em relação a estes e aos filhos. É o chamado casamento putativo.","dificil",
 [["A","Nenhum efeito, pois a nulidade retroage a data do casamento",false],["B","Apenas os efeitos patrimoniais, nunca os pessoais",false],["C","Apenas os efeitos em relação aos filhos, nunca em relação aos cônjuges",false],["D","O casamento produziu todos os efeitos até a data da sentença anulatória (casamento putativo)",true]]],

[6,"Segundo o art. 1.596 do CC, os filhos havidos fora do casamento e os filhos adotivos, em relação aos filhos havidos na constância do casamento:",
 "Art. 1.596 CC — os filhos, havidos ou não da relação de casamento, ou por adoção, terão os mesmos direitos e qualificações, proibidas quaisquer designações discriminatórias relativas à filiação. É a plena isonomia filial estabelecida pela Constituição de 1988 e confirmada pelo CC.","facil",
 [["A","Têm direitos reduzidos, proporcionalmente ao grau de parentesco",false],["B","Têm os mesmos direitos e qualificações, vedada qualquer designação discriminatória",true],["C","Só têm os mesmos direitos se reconhecidos judicialmente até a maioridade",false],["D","Têm direitos sucessórios distintos, conforme a origem da filiação",false]]],

[6,"Segundo o art. 1.567 do CC, a quem compete a direção da sociedade conjugal, e sob qual diretriz deve ser exercida?",
 "Art. 1.567 CC — a direção da sociedade conjugal será exercida, em colaboração, pelo marido e pela mulher, sempre no interesse do casal e dos filhos. O dispositivo supera o antigo modelo do \"poder marital\" do CC de 1916, consagrando a direção conjunta e colaborativa entre os cônjuges.","facil",
 [["A","A ambos os cônjuges, em colaboração, no interesse do casal e dos filhos",true],["B","Exclusivamente ao marido, cabendo à mulher apenas colaborar quando solicitada",false],["C","Exclusivamente à mulher, quando o marido estiver ausente do lar",false],["D","A um juiz de família, sempre que houver desacordo entre os cônjuges",false]]],

[6,"Um casal vive em união estável, com convivência pública, contínua e duradoura, estabelecida com o objetivo de constituir família, sem celebrar contrato escrito entre os companheiros. Segundo o art. 1.725 do CC, qual regime de bens se aplica a essa união?",
 "Art. 1.725 CC — na união estável, salvo contrato escrito entre os companheiros, aplica-se às relações patrimoniais, no que couber, o regime da comunhão parcial de bens. É o regime supletivo legal, na ausência de pacto de convivência.","medio",
 [["A","Regime da separação total de bens, por ausência de contrato escrito",false],["B","Regime da comunhão universal de bens, sempre",false],["C","Regime da comunhão parcial de bens, aplicável na falta de contrato escrito",true],["D","Nenhum regime patrimonial se aplica à união estável sem contrato",false]]],

[7,"No exato momento da morte de uma pessoa, sem qualquer formalidade ou necessidade de aceitação expressa, a herança já se transmite aos herdeiros legítimos e testamentários. Esse fenômeno é conhecido como princípio da saisine, previsto no:",
 "Art. 1.784 CC — aberta a sucessão, a herança transmite-se, desde logo, aos herdeiros legítimos e testamentários. É o princípio da saisine (droit de saisine): a transmissão da herança ocorre automaticamente com a morte, independentemente de qualquer ato dos herdeiros.","facil",
 [["A","Princípio da saisine, previsto no art. 1.784 do CC",true],["B","Princípio da colação, previsto no art. 2.002 do CC",false],["C","Princípio da legítima, previsto no art. 1.846 do CC",false],["D","Princípio da comoriência, previsto no art. 8º do CC",false]]],

[7,"Descendentes, ascendentes e o cônjuge sobrevivente são, segundo o art. 1.845 do CC, considerados herdeiros necessários. A esses herdeiros pertence, de pleno direito, qual fração dos bens da herança (a legítima), segundo o art. 1.846?",
 "Arts. 1.845 e 1.846 CC — são herdeiros necessários os descendentes, os ascendentes e o cônjuge; pertence a eles, de pleno direito, a metade dos bens da herança, constituindo a legítima. A outra metade (porção disponível) pode ser livremente destinada pelo testador.","medio",
 [["A","Um terço dos bens da herança",false],["B","A metade dos bens da herança",true],["C","Dois terços dos bens da herança",false],["D","A totalidade dos bens da herança",false]]],

[7,"Um testador possui herdeiros necessários (filhos vivos). Ele pretende, por testamento, destinar a totalidade de seu patrimônio a uma instituição de caridade, nada deixando aos filhos. Segundo o art. 1.789 do CC, isso é juridicamente possível?",
 "Art. 1.789 CC — havendo herdeiros necessários, o testador só poderá dispor da metade da herança (a legítima, reservada por lei aos herdeiros necessários, é intangível pela vontade do testador). A doação da totalidade do patrimônio violaria a legítima dos filhos.","medio",
 [["A","Sim, o testador pode dispor livremente da totalidade de seus bens",false],["B","Sim, desde que os filhos sejam maiores de idade e capazes",false],["C","Não, testamentos em favor de instituições de caridade são sempre nulos",false],["D","Não, havendo herdeiros necessários, o testador só pode dispor da metade disponível da herança",true]]],

[7,"Falecido o marido, a esposa sobrevivente, qualquer que seja o regime de bens do casamento, tem assegurado, sem prejuízo de sua participação na herança, qual direito relativo ao imóvel que servia de residência da família, segundo o art. 1.831 do CC?",
 "Art. 1.831 CC — ao cônjuge sobrevivente, qualquer que seja o regime de bens, será assegurado, sem prejuízo da participação que lhe caiba na herança, o direito real de habitação relativamente ao imóvel destinado à residência da família, desde que seja o único imóvel dessa natureza a inventariar.","dificil",
 [["A","O direito de propriedade exclusiva sobre o imóvel, excluindo os demais herdeiros",false],["B","Nenhum direito adicional sobre o imóvel, além da participação na herança",false],["C","O direito real de habitação sobre o imóvel de residência da família",true],["D","O direito de vender o imóvel e reverter o produto exclusivamente para si",false]]],

[7,"Um testador, anos após lavrar seu testamento, decide alterar completamente suas disposições, revogando o testamento anterior. Segundo o art. 1.858 do CC, essa alteração é juridicamente possível a qualquer momento?",
 "Art. 1.858 CC — o testamento é ato personalíssimo, podendo ser mudado a qualquer tempo. A revogabilidade é característica essencial do testamento: ninguém pode se vincular de forma irrevogável às disposições de última vontade enquanto vivo.","facil",
 [["A","Sim, o testamento pode ser mudado a qualquer tempo, por ser ato personalíssimo e revogável",true],["B","Não, o testamento só pode ser alterado uma única vez na vida do testador",false],["C","Não, uma vez lavrado, o testamento é irrevogável",false],["D","Sim, mas apenas mediante autorização judicial prévia",false]]],

[7,"Uma mulher grávida falece antes do nascimento de seu filho. Segundo o art. 1.798 do CC, o nascituro (já concebido, mas ainda não nascido) tem legitimação para suceder nessa sucessão?",
 "Art. 1.798 CC — legitimam-se a suceder as pessoas nascidas ou já concebidas no momento da abertura da sucessão. O nascituro, por já estar concebido ao tempo da morte, tem legitimação para suceder (efetivando-se a sucessão se nascer com vida).","medio",
 [["A","Não, pois o nascituro não é considerado pessoa para nenhum efeito",false],["B","Sim, mas apenas se a mãe tivesse deixado testamento expresso nesse sentido",false],["C","Não, a legitimação para suceder exige nascimento com vida antes da abertura da sucessão",false],["D","Sim, pois o nascituro já concebido ao tempo da abertura da sucessão tem legitimação para suceder",true]]],

[7,"Um casal era casado sob o regime de separação total de bens. O marido falece, deixando como único bem residencial do espólio o apartamento onde a família sempre viveu. Os filhos do casal pretendem excluir a viúva do direito de continuar morando no imóvel, sob o argumento de que, tendo o casamento sido celebrado sob separação de bens, ela não teria qualquer direito sobre bens do marido. Segundo o art. 1.831 do CC, esse argumento dos filhos procede?",
 "Art. 1.831 CC — ao cônjuge sobrevivente, qualquer que seja o regime de bens, será assegurado, sem prejuízo da participação que lhe caiba na herança, o direito real de habitação relativamente ao imóvel destinado à residência da família, desde que seja o único dessa natureza a inventariar. O direito real de habitação independe do regime de bens do casamento — inclusive na separação total, a viúva tem esse direito.","dificil",
 [["A","Procede, pois no regime de separação de bens o cônjuge sobrevivente não tem direito real de habitação",false],["B","Não procede, pois o direito real de habitação é assegurado qualquer que seja o regime de bens do casamento",true],["C","Procede, mas apenas se o casamento tivesse durado menos de 10 anos",false],["D","Não procede, mas somente se a viúva for economicamente hipossuficiente",false]]],

[8,"Uma pessoa exerce, de forma habitual e organizada, atividade econômica de produção de bens para o mercado, coordenando capital, mão de obra e insumos. Segundo o art. 966 do CC, essa pessoa é considerada:",
 "Art. 966, caput, CC — considera-se empresário quem exerce profissionalmente atividade econômica organizada para a produção ou a circulação de bens ou de serviços. Os elementos centrais são profissionalismo, organização dos fatores de produção e finalidade de produção/circulação de bens ou serviços.","facil",
 [["A","Empresário, nos termos do art. 966 do CC",true],["B","Simples prestador de serviços autônomo, sem qualquer regime jurídico próprio",false],["C","Consumidor, para todos os efeitos legais",false],["D","Servidor público, se atuar em cooperação com o Estado",false]]],

[8,"Em uma sociedade em nome coletivo, todos os sócios são pessoas físicas. Segundo o art. 1.039 do CC, qual o regime de responsabilidade desses sócios pelas obrigações sociais?",
 "Art. 1.039 CC — somente pessoas físicas podem tomar parte na sociedade em nome coletivo, respondendo todos os sócios, solidária e ilimitadamente, pelas obrigações sociais. É o tipo societário de responsabilidade mais gravosa aos sócios.","medio",
 [["A","Responsabilidade limitada ao capital social integralizado",false],["B","Responsabilidade solidária e ilimitada de todos os sócios",true],["C","Responsabilidade subsidiária, apenas após esgotado o patrimônio social",false],["D","Ausência de responsabilidade pessoal dos sócios, em qualquer hipótese",false]]],

[8,"Em uma sociedade limitada, o capital social ainda não foi totalmente integralizado por um dos sócios. Segundo o art. 1.052 do CC, os demais sócios respondem por essa integralização faltante?",
 "Art. 1.052 CC — na sociedade limitada, a responsabilidade de cada sócio é restrita ao valor de suas quotas, mas todos respondem solidariamente pela integralização do capital social. Ou seja, embora a responsabilidade individual seja limitada às próprias quotas, há solidariedade entre os sócios quanto à integralização total do capital.","dificil",
 [["A","Não, cada sócio responde exclusivamente pela sua própria quota, sem qualquer solidariedade",false],["B","Sim, mas apenas o sócio administrador responde pela integralização faltante",false],["C","Sim, todos os sócios respondem solidariamente pela integralização do capital social",true],["D","Não, a integralização do capital é sempre de responsabilidade exclusiva da sociedade",false]]],

[8,"Uma empresa adquire o estabelecimento comercial de outra (trespasse), incluindo os débitos regularmente contabilizados anteriores à transferência. Segundo o art. 1.146 do CC, quem responde por esses débitos anteriores?",
 "Art. 1.146 CC — o adquirente do estabelecimento responde pelos débitos anteriores à transferência, desde que regularmente contabilizados, continuando o devedor primitivo solidariamente obrigado pelo prazo de um ano (contado da publicação, quanto aos créditos vencidos, ou do vencimento, quanto aos demais).","medio",
 [["A","Apenas o alienante (devedor primitivo), que nunca se exonera",false],["B","Nenhum dos dois responde, pois os débitos se extinguem com a transferência",false],["C","Somente os credores podem escolher discricionariamente quem cobrar, sem prazo",false],["D","O adquirente responde, e o alienante permanece solidariamente obrigado por um ano",true]]],

[8,"Uma sociedade empresária celebrou seu contrato social, mas ainda não inscreveu seus atos constitutivos no registro próprio. Segundo os arts. 985 e 986 do CC, essa sociedade:",
 "Arts. 985 e 986 CC — a sociedade adquire personalidade jurídica com a inscrição de seus atos constitutivos no registro próprio; enquanto não inscritos, a sociedade rege-se pelas normas da sociedade em comum (sociedade não personificada), aplicando-se subsidiariamente as regras da sociedade simples.","medio",
 [["A","Ainda não possui personalidade jurídica, regendo-se como sociedade não personificada até a inscrição",true],["B","Já possui plena personalidade jurídica desde a assinatura do contrato social",false],["C","É automaticamente nula, não podendo jamais adquirir personalidade jurídica",false],["D","Só pode adquirir personalidade jurídica mediante decisão judicial",false]]],

[8,"Um credor da sociedade pretende executar diretamente os bens particulares de um dos sócios, sem antes ter executado os bens sociais. Segundo o art. 1.024 do CC, isso é possível?",
 "Art. 1.024 CC — os bens particulares dos sócios não podem ser executados por dívidas da sociedade, senão depois de executados os bens sociais. É o chamado benefício de ordem, que garante prioridade de excussão ao patrimônio social.","facil",
 [["A","Sim, o credor pode escolher livremente executar os bens que preferir",false],["B","Não, os bens particulares só podem ser executados depois de executados os bens sociais",true],["C","Sim, mas apenas se o sócio for o administrador da sociedade",false],["D","Não, os bens particulares dos sócios jamais podem responder por dívidas sociais",false]]],
]

async function main() {
  console.log('📚 Inserindo NOVAS questões (aditivo, sem apagar as existentes)...')
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

  console.log(`✅ ${total} NOVAS questões inseridas com sucesso (mantendo as já existentes)!`)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
