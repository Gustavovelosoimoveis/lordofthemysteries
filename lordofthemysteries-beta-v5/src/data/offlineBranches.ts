export type RelationshipFork = "protected" | "coerced" | "lost";
export type ObjectFork = "preserved" | "weaponized" | "surrendered";
export type EndgameFork = "expose" | "infiltrate" | "sever" | "descend";
export type NpcFate = "active" | "protected" | "hostile" | "missing" | "dead" | "escaped";

export interface OfflineBranchBeat {
  title: string;
  /** Cena imediata quando esta rota substitui as outras duas. Aceita {{primary}}, {{secondary}}, {{object}}, {{nextLocation}} e {{secret}}. */
  scene: string;
  clue: string;
  unlockLocation: string;
  /** Capítulo tardio exclusivo desta rota. */
  delayedTitle: string;
  delayedScene: string;
  delayedClue: string;
}

export interface OfflineBranchArc {
  protected: OfflineBranchBeat;
  coerced: OfflineBranchBeat;
  lost: OfflineBranchBeat;
  /** Imagem/ideia que volta no epílogo para amarrar a bifurcação ao final alcançado. */
  finalEcho: string;
}

/**
 * V3.3 — capítulos condicionais.
 *
 * Estes textos NÃO são três alinhamentos morais. Eles representam o que aconteceu com a
 * pessoa-chave do caso. O jogador pode protegê-la e depois traí-la, ou começar pressionando
 * e reconstruir a relação. O estado final do NPC é reavaliado pelo motor a cada interação.
 *
 * Cada prólogo possui três capítulos mutuamente exclusivos e um retorno tardio próprio.
 * Assim, uma decisão pequena no começo pode criar um local, pista ou encontro que literalmente
 * não existe nas outras versões da mesma campanha.
 */
export const OFFLINE_BRANCH_ARCS: Record<string, OfflineBranchArc> = {
  "iron-cross-room": {
    protected: {
      title: "A Chave que Evan Não Devia Ter",
      scene: "Ao perceber que não pretendo usar {{secondary}} como isca, ele tira do forro do casaco uma segunda chave marcada 17. O antigo inquilino lhe entregou a cópia na noite em que desapareceu e o fez prometer que jamais a colocaria na mesma fechadura que a minha.",
      clue: "existem duas chaves 17, e o antigo inquilino fez questão de mantê-las separadas",
      unlockLocation: "Tingen, escada de serviço esquecida da Rua Cruz de Ferro",
      delayedTitle: "Duas Chaves, Uma Porta",
      delayedScene: "{{secondary}} reaparece depois de dias escondido. Ele descobriu que as duas chaves não abrem a porta: uma segura o trinco e a outra libera uma válvula antiga sob a alvenaria. Usadas juntas, permitem baixar a pressão sem abrir passagem para o que existe do outro lado.",
      delayedClue: "as duas chaves permitem despressurizar a passagem sem abri-la por completo",
    },
    coerced: {
      title: "O Vizinho Aprende a Mentir",
      scene: "A pressão funciona, mas ensina {{secondary}} a me temer antes de me respeitar. Ele entrega uma planta incompleta e guarda a parte que mostra o duto para o Tussock. Na mesma noite, alguém testa a porta do meu quarto com uma chave que não é a minha.",
      clue: "{{secondary}} reteve deliberadamente a parte da planta que mostra um duto para o rio",
      unlockLocation: "Tingen, lavanderia abandonada atrás da pensão",
      delayedTitle: "O Preço da Planta Incompleta",
      delayedScene: "Sigo a versão que me foi dada e quase entro pela rota errada. No último instante percebo sal fresco nos tijolos: {{secondary}} conduziu outra pessoa pelo duto antes de mim. Não sei se está tentando fugir da sociedade ou me entregar a ela.",
      delayedClue: "o duto escondido foi usado recentemente por {{secondary}} e por uma segunda pessoa",
    },
    lost: {
      title: "O Quarto Vazio ao Lado",
      scene: "Quando finalmente procuro {{secondary}}, encontro o quarto arrumado demais. Livros foram levados, mas uma caneca ainda está quente. Ninguém na pensão admite tê-lo visto sair. Na parede, onde havia um mapa de Tingen, restou apenas o contorno de um círculo de sal.",
      clue: "{{secondary}} desapareceu sem levar tudo e deixou um círculo de sal removido às pressas",
      unlockLocation: "Tingen, quarto vazio de Evan Royce",
      delayedTitle: "A Voz Atrás da Parede",
      delayedScene: "Dias depois, alguém bate três vezes do interior da parede sem porta. A voz de {{secondary}} pronuncia meu nome e pede que eu não use a chave. Quando quebro o reboco ao lado, encontro apenas um caderno úmido — e nenhuma cavidade onde uma pessoa pudesse caber.",
      delayedClue: "o caderno de {{secondary}} reapareceu dentro de uma parede sólida após seu desaparecimento",
    },
    finalEcho: "A história do quarto 17 passa a depender menos da porta que existia na parede e mais de quem eu permiti — ou obriguei — a ficar do meu lado quando ela começou a respirar.",
  },

  "khoy-archive": {
    protected: {
      title: "Mina Guarda a Página Errada",
      scene: "{{secondary}} aceita esconder uma das folhas proféticas fora do catálogo. Horas depois, todas as cópias mudam menos a que está com ela. Pela primeira vez temos uma frase que o mecanismo da Khoy não consegue reescrever retroativamente.",
      clue: "uma página retirada do circuito do arquivo permanece imune às alterações do catálogo",
      unlockLocation: "Tingen, sala de restauração lacrada da Universidade Khoy",
      delayedTitle: "A Margem que Sobreviveu ao Futuro",
      delayedScene: "{{secondary}} retorna com a folha guardada. Na margem surgiu uma anotação que não estava ali: não descreve o que acontecerá, mas algo que já aconteceu e foi apagado dos registros da universidade — o nome do primeiro operador da prensa.",
      delayedClue: "a página isolada registra um fato apagado do passado em vez de prever o futuro",
    },
    coerced: {
      title: "Uma Bibliotecária Contra o Catálogo",
      scene: "Forço {{secondary}} a escolher entre me ajudar e perder o emprego. Ela obedece, mas substitui uma referência antes de me entregar o índice. A falsificação é boa o bastante para me levar ao depósito certo pela entrada errada.",
      clue: "{{secondary}} adulterou uma referência do índice depois de ser pressionada",
      unlockLocation: "Tingen, corredor técnico atrás das estantes de coleções especiais",
      delayedTitle: "O Futuro que Ela Plantou para Mim",
      delayedScene: "Uma nova página prevê que eu acusarei {{secondary}} de traição. Ela a deixa aberta de propósito e observa se cumpro o texto. Pela primeira vez percebo que ela não está apenas resistindo a mim; está testando se uma previsão pode ser quebrada pela desobediência consciente.",
      delayedClue: "{{secondary}} começou a usar as previsões como experimentos para quebrar a causalidade da prensa",
    },
    lost: {
      title: "A Funcionária que Nunca Existiu",
      scene: "Quando volto ao arquivo, ninguém reconhece o nome de {{secondary}}. O livro de ponto não tem sua assinatura, a mesa dela está vazia e o crachá que guardo no bolso agora traz outro nome. Só minhas anotações ainda afirmam que ela existiu.",
      clue: "registros da universidade foram reescritos para apagar a existência de {{secondary}}",
      unlockLocation: "Tingen, depósito de fichas descartadas da Universidade Khoy",
      delayedTitle: "A Pessoa no Rodapé",
      delayedScene: "Encontro {{secondary}} apenas como erro tipográfico: as primeiras letras dos rodapés de vinte e uma páginas formam uma mensagem. Ela não pede resgate. Pede que eu destrua a vigésima segunda página antes que o catálogo termine de removê-la da memória das pessoas.",
      delayedClue: "{{secondary}} deixou uma mensagem acrostica nas páginas antes de ser apagada dos registros",
    },
    finalEcho: "No fim, a pergunta não é se a página previa minhas escolhas, mas qual versão do futuro ganhou força porque eu tratei uma pessoa como aliada, ferramenta ou detalhe descartável.",
  },

  "tussock-crate": {
    protected: {
      title: "Nora Conta Quatro Respirações",
      scene: "{{secondary}} confia em mim o bastante para revelar que contou quatro ritmos dentro da caixa, não um. Três cessaram quando os nomes do manifesto foram raspados. O quarto acelerou no instante em que eu toquei o papel.",
      clue: "cada nome raspado do manifesto correspondia a um ritmo de respiração dentro da caixa",
      unlockLocation: "Backlund, escritório de conferência sob o Armazém 6",
      delayedTitle: "A Carga que Ainda Tem Nome",
      delayedScene: "{{secondary}} retorna com uma cópia clandestina do livro aduaneiro. O quarto nome não foi raspado: foi deslocado para outra carga que parte ao amanhecer. A caixa não está transportando pessoas; está transferindo alguma coisa entre identidades registradas.",
      delayedClue: "o quarto nome foi movido para outra carga, sugerindo transferência de identidade por documentação portuária",
    },
    coerced: {
      title: "A Conferente Vende um Horário",
      scene: "Depois de ser pressionada, {{secondary}} me entrega o horário do Armazém 6 — e vende o mesmo horário a outra pessoa. Descubro isso quando dois grupos chegam ao mesmo portão esperando ser os únicos informados.",
      clue: "{{secondary}} vendeu a mesma janela de acesso a lados diferentes da disputa pela caixa",
      unlockLocation: "Backlund, passarela superior do Armazém 6",
      delayedTitle: "A Emboscada das Três Listas",
      delayedScene: "Três manifestos aparecem sobre a mesma mesa, cada um me colocando em posição diferente: fiscal, contrabandista e cadáver não identificado. {{secondary}} assiste de longe. Ela transformou meu medo em moeda e agora quer descobrir qual documento o sistema aceitará como verdadeiro.",
      delayedClue: "há três manifestos conflitantes que tentam atribuir ao investigador identidades portuárias incompatíveis",
    },
    lost: {
      title: "A Cadeira de Nora Continua Quente",
      scene: "Ignoro {{secondary}} por tempo suficiente para que outra pessoa a procure primeiro. Sua cadeira está vazia, a chaleira ainda ferve e uma linha de tinta atravessa o livro de cargas até cair no chão como se alguém tivesse sido arrastado durante a escrita.",
      clue: "{{secondary}} desapareceu no meio do registro de uma carga ligada ao Armazém 6",
      unlockLocation: "Backlund, sala de pesagem interditada das docas",
      delayedTitle: "O Peso de Uma Pessoa Ausente",
      delayedScene: "A balança do cais registra uma diferença de cinquenta e oito quilos na noite do desaparecimento — exatamente o peso anotado no exame médico de {{secondary}}. A carga saiu com o mesmo peso total. Alguém a incorporou ao manifesto sem alterar um único número.",
      delayedClue: "o peso corporal de {{secondary}} foi absorvido pela contabilidade da carga sem alterar o peso final declarado",
    },
    finalEcho: "No Tussock, nomes, corpos e caixas terminam parecendo partes do mesmo sistema de transporte; o que muda é quem eu deixei virar carga e quem conseguiu permanecer pessoa.",
  },

  "east-district-apothecary": {
    protected: {
      title: "Elsie Reconhece o Homem Sem Dente",
      scene: "{{secondary}} aceita ficar protegida e, longe da rua, admite que já viu o paciente antes — saudável, elegante e com todos os dentes. Ele visitava uma oficina onde trabalhadores recebiam próteses de cobre após acidentes que nunca eram registrados.",
      clue: "o paciente frequentava uma oficina que instalava dentes de cobre em trabalhadores sem registrar os acidentes",
      unlockLocation: "Backlund, porão de lavanderia diante da Viela Moss",
      delayedTitle: "A Boca que Não Pertencia ao Morto",
      delayedScene: "{{secondary}} traz uma fotografia de casamento em que o paciente aparece ao fundo, vinte anos mais jovem e com o mesmo rosto. No verso, alguém anotou a sequência de dentes substituídos como se fossem datas.",
      delayedClue: "os dentes de cobre parecem marcar uma sequência de substituições ao longo de décadas",
    },
    coerced: {
      title: "O Testemunho Comprado Duas Vezes",
      scene: "Assustada comigo, {{secondary}} repete o que quero ouvir. Depois descubro que repetiu outra história para os homens da carruagem. As duas versões são falsas em pontos diferentes — e justamente essas diferenças indicam o que ela está tentando esconder de ambos os lados.",
      clue: "as mentiras divergentes de {{secondary}} escondem a mesma oficina na Viela Moss",
      unlockLocation: "Backlund, telhado da oficina da Viela Moss",
      delayedTitle: "A Lavadeira Faz Sua Própria Barganha",
      delayedScene: "{{secondary}} entrega meu nome à oficina em troca da retirada de alguém de sua família da lista de pacientes. A barganha funciona pela metade. A família some da lista; meu nome aparece no lugar, ao lado da palavra 'mandíbula'.",
      delayedClue: "a oficina mantém uma lista de futuras substituições corporais e adicionou o nome do investigador",
    },
    lost: {
      title: "Roupa Lavada com Sangue Frio",
      scene: "Quando procuro {{secondary}}, encontro apenas roupas recém-lavadas penduradas no pátio. Uma camisa masculina continua liberando sangue na água, por mais vezes que seja enxaguada. No bolso costurado há uma ficha metálica da oficina.",
      clue: "uma ficha da oficina foi escondida numa camisa que continua sangrando depois de lavada",
      unlockLocation: "Backlund, pátio fechado da lavanderia de Elsie Marr",
      delayedTitle: "O Avental Vazio",
      delayedScene: "O avental de {{secondary}} aparece dobrado diante da botica. Dentro dele há um dente de cobre recém-aquecido. Não encontro corpo, apenas a certeza de que a sequência continuou sem que eu estivesse olhando.",
      delayedClue: "um novo dente de cobre apareceu dentro do avental de {{secondary}} após seu desaparecimento",
    },
    finalEcho: "Cada dente parecia uma peça pequena até eu entender que pequenas peças podem substituir partes inteiras de uma vida — inclusive relações que eu tratei como descartáveis.",
  },

  "st-george-coffin": {
    protected: {
      title: "Lorna Ouve a Quarta Batida",
      scene: "{{secondary}} aceita permanecer comigo durante a vigília. Juntos ouvimos uma quarta batida — não do caixão, mas sob o piso. Ela reconhece o ritmo como um código antigo usado por voluntários da Igreja para marcar sepultamentos suspeitos.",
      clue: "as batidas sob o piso reproduzem um código funerário antigo da Igreja da Noite",
      unlockLocation: "Backlund, capela de vigília desativada de St. George",
      delayedTitle: "O Livro que a Igreja Não Enterrou",
      delayedScene: "{{secondary}} retorna com um livro escondido por uma predecessora. Há páginas arrancadas, mas os números das covas formam um mapa do ossuário. Um túmulo vazio fica exatamente abaixo da sala onde ouvi a quarta batida.",
      delayedClue: "os números das covas ocultam um mapa que converge para um túmulo vazio sob a capela",
    },
    coerced: {
      title: "A Freira Fecha a Boca, Não os Olhos",
      scene: "Minha pressão cala {{secondary}}, mas não a paralisa. Ela passa a me seguir à distância e deixa sinais para outra pessoa. Cada vez que entro no cemitério, um sino toca numa ala diferente sem que ninguém puxe a corda.",
      clue: "{{secondary}} criou um sistema de sinais para avisar terceiros sempre que o investigador entra no cemitério",
      unlockLocation: "Backlund, torre sineira lateral de St. George",
      delayedTitle: "O Funeral Preparado para Mim",
      delayedScene: "Encontro uma ficha funerária preenchida com meu nome, mas a caligrafia não é de {{secondary}}. Ela me esperava na torre para mostrar isso. A hostilidade entre nós não desapareceu; apenas ganhou um inimigo comum com acesso aos registros do cemitério.",
      delayedClue: "alguém além de {{secondary}} preparou antecipadamente o registro funerário do investigador",
    },
    lost: {
      title: "A Voluntária da Última Ala",
      scene: "{{secondary}} some durante um turno em que ninguém percebe sua ausência até o sino da meia-noite. No banco onde costumava sentar há terra vermelha e um rosário com um nó novo a cada conta.",
      clue: "terra vermelha e um rosário alterado ligam o desaparecimento de {{secondary}} aos corpos irregulares",
      unlockLocation: "Backlund, ala funerária interditada de St. George",
      delayedTitle: "A Voz no Livro de Sepultamentos",
      delayedScene: "O nome de {{secondary}} aparece no livro sem número de cova. Quando passo o dedo pela tinta, ouço sua voz dentro do papel recitando nomes de pessoas ainda vivas. O último nome é o meu.",
      delayedClue: "o registro de {{secondary}} sem sepultura contém vozes associadas a futuras entradas no livro",
    },
    finalEcho: "St. George me ensinou que cemitérios guardam corpos e dívidas; algumas nasceram do que fiz com quem ainda respirava.",
  },

  "hillston-bookshop": {
    protected: {
      title: "Clara Reconstrói a Página Vinte e Dois",
      scene: "{{secondary}} aceita trabalhar comigo e identifica fibras diferentes na lombada de {{object}}. A página arrancada foi substituída três vezes ao longo dos anos. Cada versão deixou fragmentos microscópicos suficientes para reconstruir parte do texto original.",
      clue: "a página 22 foi substituída repetidamente, mas suas versões antigas deixaram vestígios na encadernação",
      unlockLocation: "Backlund, oficina particular de Clara Mott",
      delayedTitle: "A Lei que Só Existe Rasgada",
      delayedScene: "{{secondary}} conclui a reconstrução: a vigésima segunda 'lei' não descreve uma essência, mas uma exceção — algo capaz de alterar a relação entre as outras vinte e uma. Antes que eu copie tudo, alguém incendeia a oficina pela porta dos fundos.",
      delayedClue: "a vigésima segunda lei parece ser uma exceção que altera como as demais regras interagem",
    },
    coerced: {
      title: "A Encadernadora Faz Uma Cópia Para Si",
      scene: "Pressionada, {{secondary}} abre o caderno, mas fotografa mentalmente cada dobra e marca. Dias depois circula no mercado oculto uma cópia imperfeita. Ela não me vendeu; vendeu o conhecimento para não depender de mim.",
      clue: "uma cópia clandestina das 22 Leis começou a circular depois da coerção sobre {{secondary}}",
      unlockLocation: "Backlund, depósito de papel da Rua Rose",
      delayedTitle: "O Leilão da Lei Falsa",
      delayedScene: "A cópia de {{secondary}} aparece num leilão como original. Três compradores sabem que é falsa e ainda assim disputam por ela. Percebo então que o valor não está no texto correto, mas em identificar quem acredita que determinada versão é verdadeira.",
      delayedClue: "compradores poderosos usam versões falsas do caderno para mapear o conhecimento dos rivais",
    },
    lost: {
      title: "A Oficina Sem Encadernadora",
      scene: "Quando finalmente vou atrás de {{secondary}}, sua oficina está aberta e vazia. Todas as lombadas foram cortadas no mesmo ponto: onde uma vigésima segunda folha caberia. No chão há cola fresca formando um símbolo que não reconheço.",
      clue: "todas as encadernações de {{secondary}} foram abertas no espaço correspondente a uma página 22 ausente",
      unlockLocation: "Backlund, oficina abandonada de Clara Mott",
      delayedTitle: "O Livro que Aprendeu o Rosto Dela",
      delayedScene: "Um exemplar barato chega à livraria sem remetente. Ao abrir, encontro o rosto de {{secondary}} impresso em marcas d'água entre as páginas. Em cada folha seguinte ela parece um pouco mais distante, como se o livro registrasse uma viagem.",
      delayedClue: "um livro comum passou a registrar em marcas d'água o deslocamento desconhecido de {{secondary}}",
    },
    finalEcho: "As 22 Leis nunca foram apenas texto. Viraram uma disputa sobre quem podia copiar, esconder ou sobreviver ao conhecimento — e minhas relações determinaram qual versão chegou ao fim.",
  },

  "bridge-club": {
    protected: {
      title: "Martha Guarda a Taça Certa",
      scene: "{{secondary}} me entrega a taça da mesa aristocrática antes que o mordomo a lave. Sob a borda há um resíduo que reage ao calor e revela números: não coordenadas, mas horários de votação de três comissões parlamentares.",
      clue: "o vinho da reunião ocultava horários ligados a comissões políticas, não apenas coordenadas geográficas",
      unlockLocation: "Backlund, despensa privada do clube da Ponte",
      delayedTitle: "A Copeira que Conhece Todos os Brindes",
      delayedScene: "{{secondary}} reaparece com um padrão de vinte anos de menus e garrafas. O mesmo vinho foi servido antes de escândalos, falências e desaparecimentos específicos. A adega do clube funciona como calendário de operações.",
      delayedClue: "a escolha de vinhos do clube codifica antecipadamente operações políticas e financeiras",
    },
    coerced: {
      title: "Martha Serve a Mesa Errada",
      scene: "Depois de ser pressionada, {{secondary}} finge submissão e troca duas garrafas de lugar. O gesto parece pequeno até um aristocrata beber o vinho reservado a outro e abandonar a reunião em pânico, convencido de que recebeu uma ordem destinada a seu rival.",
      clue: "{{secondary}} sabe que a distribuição de bebidas funciona como canal de instruções entre membros do clube",
      unlockLocation: "Backlund, adega de serviço sob o clube da Ponte",
      delayedTitle: "O Banquete da Desconfiança",
      delayedScene: "A troca plantada por {{secondary}} provoca uma guerra silenciosa entre duas mesas. Ela me oferece a lista de quem acusa quem — em troca de eu apagar meu papel na confusão. Pela primeira vez, podemos usar a paranoia do clube contra ele.",
      delayedClue: "a troca de sinais criou uma ruptura interna explorável entre duas facções do clube",
    },
    lost: {
      title: "A Copeira que Saiu Pela Porta da Frente",
      scene: "{{secondary}} desaparece no horário mais movimentado, carregando uma bandeja vazia. Ninguém lembra de tê-la visto sair. No livro de salários, sua linha foi substituída por uma despesa de 'quebra de louça'.",
      clue: "o desaparecimento de {{secondary}} foi mascarado contabilmente como despesa de serviço",
      unlockLocation: "Backlund, arquivo de despesas do clube da Ponte",
      delayedTitle: "A Conta que Não Fecha",
      delayedScene: "Somando pequenas despesas de anos diferentes encontro valores idênticos sempre que um funcionário some. A contabilidade do clube não registra apenas dinheiro: registra pessoas eliminadas do quadro sem gerar perguntas.",
      delayedClue: "despesas padronizadas do clube funcionam como código para desaparecimento de funcionários",
    },
    finalEcho: "No clube, ninguém precisava dizer 'mate', 'compre' ou 'cale'. Bastava servir a taça certa — e eu aprendi que meu tratamento dos trabalhadores podia ser mais decisivo que qualquer conversa com nobres.",
  },

  "joewood-ledger": {
    protected: {
      title: "Rose Mostra o Recibo que o Marido Não Assinou",
      scene: "{{secondary}} confia em mim um recibo que guardou por vergonha. A assinatura do marido morto é perfeita, exceto por uma mania gráfica que só aparecia quando ele estava com medo. O documento foi produzido por alguém que o conhecia em vida.",
      clue: "a assinatura falsificada reproduz um vício gráfico íntimo que o devedor morto só apresentava sob medo",
      unlockLocation: "Backlund, quarto alugado de Rose Pike em Joewood",
      delayedTitle: "Os Mortos Pagam em Ordem",
      delayedScene: "{{secondary}} encontra recibos de outras viúvas. As datas formam uma sequência que atravessa o mapa do distrito casa por casa. Os pagamentos dos mortos parecem acompanhar a movimentação de uma única equipe de cobrança clandestina.",
      delayedClue: "os recibos pós-morte traçam a rota física de uma equipe clandestina por Joewood",
    },
    coerced: {
      title: "A Viúva Entrega um Nome Falso",
      scene: "Assustada, {{secondary}} me dá o nome de um cobrador. Ele não existe. Quando procuro o endereço, encontro um escritório montado às pressas com meu próprio nome no livro de funcionários.",
      clue: "um escritório falso foi preparado para vincular o investigador à cobrança dos mortos",
      unlockLocation: "Backlund, escritório fantasma da Viela Copper",
      delayedTitle: "A Dívida Transferida",
      delayedScene: "{{secondary}} admite que recebeu instruções para me indicar aquele endereço. Em troca, a dívida do marido desapareceu. O problema é que o valor reaparece agora associado a mim — com juros acumulados desde antes de eu nascer neste mundo.",
      delayedClue: "a dívida de um morto foi transferida documentalmente para o investigador com data retroativa impossível",
    },
    lost: {
      title: "A Casa Sem Viúva",
      scene: "Quando vou atrás de {{secondary}}, a casa está vazia e anunciada para aluguel. Os vizinhos juram que ela nunca morou ali. Só uma marca de quadro na parede e um recibo queimado confirmam que a memória coletiva está errada.",
      clue: "vizinhos perderam ou alteraram a lembrança de {{secondary}}, mas vestígios materiais de sua vida permanecem",
      unlockLocation: "Backlund, casa vazia dos Pike em Joewood",
      delayedTitle: "O Aluguel Pago por um Morto",
      delayedScene: "O proprietário mostra recibos: o aluguel da casa continua sendo pago, agora pelo marido falecido de {{secondary}}. O dinheiro não chega em mãos; aparece na conta todas as sextas-feiras com uma assinatura bancária impossível de rastrear.",
      delayedClue: "o marido morto continua pagando o aluguel da casa de onde {{secondary}} foi apagada",
    },
    finalEcho: "Joewood transformou morte em contabilidade. A única coisa que os livros não conseguiram reduzir a números foi a forma como eu tratei quem ainda tinha algo a perder.",
  },

  "north-factory": {
    protected: {
      title: "Ada Conta os Segundos que Faltam",
      scene: "{{secondary}} me mostra um caderno de produção. Em todo turno anormal, exatamente quarenta e sete segundos desaparecem dos relógios dos operários, mas não das máquinas. O maquinário continua trabalhando num intervalo que ninguém lembra de viver.",
      clue: "as máquinas acumulam quarenta e sete segundos de operação que os trabalhadores não experienciam",
      unlockLocation: "Backlund, passarela de manutenção acima do tear 4",
      delayedTitle: "O Turno Dentro do Turno",
      delayedScene: "{{secondary}} instala marcas mecânicas que não dependem de relógio. Depois de três noites, elas provam que existe um turno inteiro sendo montado aos poucos com segundos roubados de centenas de trabalhadores.",
      delayedClue: "os segundos ausentes dos operários estão sendo reunidos até formar um turno completo fora da percepção humana",
    },
    coerced: {
      title: "A Operária Sabota o Relógio",
      scene: "Pressionada, {{secondary}} me leva até o painel central, mas antes desloca uma engrenagem. A fábrica perde onze minutos. Nesse intervalo, um supervisor desaparece e a produção registra peças que ninguém fabricou.",
      clue: "uma sabotagem de onze minutos permitiu produção sem trabalhadores e o desaparecimento de um supervisor",
      unlockLocation: "Backlund, sala central de reguladores da fábrica",
      delayedTitle: "Onze Minutos que Compraram Uma Vingança",
      delayedScene: "{{secondary}} admite ter usado a falha para acertar uma conta pessoal com o supervisor. Isso não explica as peças impossíveis, mas prova que uma anomalia pode ser explorada por gente comum por motivos completamente humanos.",
      delayedClue: "{{secondary}} explorou deliberadamente a anomalia temporal para fins pessoais, separando crime humano de fenômeno oculto",
    },
    lost: {
      title: "O Tear que Trabalha Sozinho",
      scene: "{{secondary}} deixa de aparecer. O tear 4 continua registrando a produtividade dela, exatamente na média dos últimos seis meses. Quando desligamos a correia, o contador segue aumentando por quarenta e sete segundos.",
      clue: "o tear 4 mantém a produtividade de {{secondary}} mesmo após seu desaparecimento",
      unlockLocation: "Backlund, setor lacrado do tear 4",
      delayedTitle: "A Folha de Pagamento do Próximo Mês",
      delayedScene: "O escritório recebe antecipadamente uma folha salarial. {{secondary}} está nela, com horas extras em datas que ainda não chegaram. Ao lado do nome dela existe uma linha em branco com meu número de funcionário.",
      delayedClue: "uma folha futura registra trabalho de {{secondary}} após seu desaparecimento e reserva uma linha para o investigador",
    },
    finalEcho: "A fábrica me ensinou que pessoas podem ser consumidas não apenas por máquinas, mas por sistemas capazes de continuar registrando seu trabalho depois que elas somem.",
  },

  "empress-heirloom": {
    protected: {
      title: "Jonas Abre a Ala Sem Acender as Luzes",
      scene: "{{secondary}} concorda em me levar à ala fechada sob uma condição: nenhuma chama. No escuro, o bordado de {{object}} emite um brilho quase invisível que aponta para retratos cujos rostos foram repintados ao longo das gerações.",
      clue: "o bordado reage no escuro a retratos familiares que tiveram identidades repintadas",
      unlockLocation: "Backlund, galeria escura da ala Voss",
      delayedTitle: "O Retrato Por Baixo do Retrato",
      delayedScene: "{{secondary}} consegue remover uma camada de tinta sem danificar o quadro. A mulher por baixo tem o rosto da herdeira desaparecida, mas a pintura é cem anos mais antiga. A família não perdeu uma filha; repete uma pessoa.",
      delayedClue: "um retrato centenário contém o rosto exato da herdeira desaparecida sob uma camada posterior",
    },
    coerced: {
      title: "O Mordomo Entrega a Chave Certa e o Corredor Errado",
      scene: "{{secondary}} cede a chave, mas me conduz por um corredor coberto de espelhos. A rota acrescenta minutos e me expõe aos criados da casa. Só depois percebo que ele queria que todos soubessem que eu entrei na ala proibida.",
      clue: "{{secondary}} deliberadamente tornou pública a entrada do investigador na ala fechada",
      unlockLocation: "Backlund, corredor dos espelhos da mansão Voss",
      delayedTitle: "O Álibi da Casa Inteira",
      delayedScene: "Quando uma peça some da coleção, todos os criados lembram de ter me visto no corredor. {{secondary}} construiu um álibi coletivo para a família usando minha própria invasão como cobertura.",
      delayedClue: "a presença visível do investigador foi usada para encobrir o desaparecimento planejado de outra peça da coleção",
    },
    lost: {
      title: "O Mordomo que Nunca Chegou ao Café",
      scene: "{{secondary}} desaparece entre a copa e a escadaria — vinte passos num corredor cheio de criados. Uma bandeja cai, mas ninguém vê pessoa alguma cair. O lenço bordado passa a carregar uma nova inicial na manhã seguinte.",
      clue: "o lenço ganhou uma inicial correspondente a {{secondary}} após seu desaparecimento impossível",
      unlockLocation: "Backlund, copa selada da mansão Voss",
      delayedTitle: "A Inicial que Envelhece",
      delayedScene: "A nova letra no lenço começa a desbotar mais rápido que as antigas. Consultando livros de serviço, descubro que ex-mordomos também aparecem como iniciais em peças da família. A casa transforma funcionários desaparecidos em genealogia decorativa.",
      delayedClue: "iniciais de antigos funcionários desaparecidos foram incorporadas às relíquias da família Voss",
    },
    finalEcho: "Na mansão Voss, herança deixou de significar apenas sangue. Também significava quem a família conseguia absorver sem deixar registro — a menos que alguém decidisse enxergar os criados como pessoas.",
  },

  "pritz-manifest": {
    protected: {
      title: "Vera Confere o Carimbo Pelo Avesso",
      scene: "{{secondary}} arrisca o cargo e leva {{object}} à mesa de luz. O carimbo da cidade inexistente contém, em negativo, o brasão de Pritz. Não é falsificação estrangeira: foi produzido localmente para parecer vindo de um lugar que não existe.",
      clue: "o carimbo impossível foi fabricado em Pritz e invertido para simular origem estrangeira",
      unlockLocation: "Pritz, sala de matrizes da alfândega",
      delayedTitle: "O Porto que Só Existe no Papel",
      delayedScene: "{{secondary}} encontra dezenas de manifestos com a mesma origem fictícia. Somados, descrevem um porto completo: docas, armazéns, taxas e funcionários. A cidade inexistente funciona como jurisdição contábil para cargas que ninguém quer possuir oficialmente.",
      delayedClue: "documentos dispersos constroem uma jurisdição portuária fictícia usada para esconder propriedade e responsabilidade",
    },
    coerced: {
      title: "A Fiscal Abre Uma Investigação Contra Mim",
      scene: "Pressionada, {{secondary}} entrega acesso e simultaneamente protocola meu nome como suspeito. Ganha proteção institucional enquanto me obriga a resolver o caso antes que o procedimento oficial me alcance.",
      clue: "{{secondary}} formalizou suspeita contra o investigador para se proteger enquanto coopera parcialmente",
      unlockLocation: "Pritz, arquivo disciplinar da alfândega",
      delayedTitle: "O Processo que Virou Cobertura",
      delayedScene: "A acusação contra mim faz contrabandistas presumirem que fui afastado. {{secondary}} percebe a vantagem e mantém o processo vivo de propósito. Por alguns dias, ser oficialmente suspeito se torna o melhor disfarce que possuo.",
      delayedClue: "o procedimento disciplinar passou a funcionar como cobertura involuntária para infiltração",
    },
    lost: {
      title: "A Mesa de Vera Continua Assinando",
      scene: "{{secondary}} some do turno, mas carimbos continuam surgindo com sua autenticação. A tinta está fresca e a pressão da mão corresponde aos documentos antigos. Alguém consegue reproduzir não só sua assinatura, mas sua força e hesitação.",
      clue: "documentos continuam recebendo autenticação biométrica de {{secondary}} após seu desaparecimento",
      unlockLocation: "Pritz, cabine de inspeção 12 abandonada",
      delayedTitle: "A Funcionária no Manifesto",
      delayedScene: "Um novo navio chega trazendo {{secondary}} listada como carga diplomática, peso zero e condição 'em trânsito'. Não há pessoa a bordo. O documento, porém, é aceito por todos os sistemas do porto.",
      delayedClue: "{{secondary}} foi convertida documentalmente em carga de peso zero e continua circulando entre registros",
    },
    finalEcho: "Pritz mostrou que uma pessoa pode desaparecer muito antes do corpo, bastando mudar qual coluna do formulário diz quem ela é.",
  },

  "pritz-smugglers": {
    protected: {
      title: "Inez Reconhece o Nó da Mala",
      scene: "{{secondary}} identifica o nó sob o couro de {{object}} como código antigo de contrabandistas: cada volta indica uma pessoa que deve receber a mala sem abri-la. Há uma volta a mais do que nomes conhecidos.",
      clue: "o nó oculto da mala registra um destinatário adicional que não aparece no recibo",
      unlockLocation: "Pritz, taverna fechada da Doca Cinzenta",
      delayedTitle: "O Destinatário Sem Nome",
      delayedScene: "{{secondary}} reencontra um antigo contato e descobre que a última volta do nó significa 'devolver ao mar'. A mala nunca teve um dono final; sua rota termina numa coordenada onde embarcações costumam perder bússola.",
      delayedClue: "a rota codificada da mala termina no mar, em uma zona evitada por navegadores locais",
    },
    coerced: {
      title: "Inez Reabre Uma Dívida Antiga",
      scene: "Minha pressão força {{secondary}} a procurar antigos contatos. Um deles aceita falar apenas porque acredita que ela voltou ao negócio. Isso reativa uma dívida que dormia há quinze anos e coloca cobradores na nossa rota.",
      clue: "a coerção sobre {{secondary}} reativou uma dívida do antigo circuito de contrabando",
      unlockLocation: "Pritz, armazém inundado da Doca Cinzenta",
      delayedTitle: "A Dívida Vem Buscar Juros",
      delayedScene: "Os cobradores não querem dinheiro. Querem {{object}} e o nome de quem me contou sobre ele. {{secondary}} percebe que pode me entregar e encerrar a própria dívida — ou usar minha existência para renegociá-la.",
      delayedClue: "a dívida de {{secondary}} pode ser quitada entregando o objeto e a fonte da investigação",
    },
    lost: {
      title: "A Aposentada Volta ao Mar",
      scene: "{{secondary}} some antes que eu faça a pergunta certa. No cais encontro apenas um lenço amarrado num poste com o nó de quem 'partiu sem porto de destino'. Marinheiros evitam olhar para ele.",
      clue: "o nó deixado por {{secondary}} significa partida sem destino ou retorno previsto",
      unlockLocation: "Pritz, píer antigo fora do registro municipal",
      delayedTitle: "A Lanterna no Horizonte",
      delayedScene: "Numa madrugada sem vento, uma lanterna verde pisca no mar no padrão pessoal de {{secondary}}. A resposta correta exigiria uma embarcação e coragem para seguir para fora das rotas cartografadas.",
      delayedClue: "{{secondary}} possivelmente sinaliza de uma área marítima fora das rotas oficiais",
    },
    finalEcho: "Contrabandistas vivem de rotas. A minha história passou a ser definida por quais rotas abri para pessoas e quais fechei quando já era tarde.",
  },

  "conot-mine": {
    protected: {
      title: "Elias Marca a Parede Antes que Ela Mude",
      scene: "{{secondary}} aceita voltar à Galeria 9 comigo e risca marcas profundas a cada vinte passos. Na volta, uma das marcas aparece no teto, outra atrás de nós e uma terceira dentro de uma rocha que ninguém cortou.",
      clue: "a geometria da Galeria 9 se rearranja fisicamente depois que alguém atravessa determinados trechos",
      unlockLocation: "Conot, nicho de ventilação acima da Galeria 9",
      delayedTitle: "O Mapa que Precisa de Duas Pessoas",
      delayedScene: "{{secondary}} descobre que a galeria só mantém forma estável quando duas pessoas observam pontos diferentes ao mesmo tempo. Sozinho, o mapa mente. Em dupla, surge uma passagem que não existia nos levantamentos da mina.",
      delayedClue: "a Galeria 9 estabiliza sua geometria quando observada simultaneamente por duas pessoas",
    },
    coerced: {
      title: "O Mineiro Me Deixa Ir na Frente",
      scene: "{{secondary}} obedece, mas para de me corrigir. Só percebo a vingança quando sigo uma corrente de ar que ele sabe ser falsa e quase piso numa seção sem sustentação. Ele não tentou me matar; apenas decidiu não me salvar do meu próprio excesso de confiança.",
      clue: "{{secondary}} conhece falsos sinais de ventilação na Galeria 9 e deixou o investigador segui-los",
      unlockLocation: "Conot, poço lateral sem escoramento da Galeria 9",
      delayedTitle: "A Trégua Sob Toneladas de Pedra",
      delayedScene: "Um desabamento parcial nos prende no mesmo bolsão. {{secondary}} tem a rota e eu tenho a lâmpada. Nenhum de nós precisa perdoar o outro para entender que cooperação temporária é a única maneira de sair vivo.",
      delayedClue: "um bolsão oculto sob a Galeria 9 conecta áreas que o mapa oficial trata como separadas",
    },
    lost: {
      title: "O Capacete na Entrada da Galeria",
      scene: "{{secondary}} não aparece para o turno. Seu capacete está limpo demais na entrada, com a lamparina ainda acesa. Dentro encontro poeira do minério transparente, embora ele jurasse nunca ter tocado na amostra.",
      clue: "o equipamento de {{secondary}} contém minério da Galeria 9 apesar de sua recusa em manipulá-lo",
      unlockLocation: "Conot, vestiário selado dos mineiros veteranos",
      delayedTitle: "As Batidas de Elias",
      delayedScene: "Trabalhadores começam a ouvir o código pessoal de {{secondary}} vindo de rocha maciça. As batidas migram noite após noite em direção à superfície. Se for ele, está se movendo por um espaço que não existe no mapa.",
      delayedClue: "o código de batidas de {{secondary}} se desloca por trás de rocha sólida em direção à superfície",
    },
    finalEcho: "Em Conot, a pedra não foi a única coisa que mudou de forma. Confiança, medo e utilidade rearranjaram as rotas humanas tanto quanto a própria Galeria 9.",
  },

  "bayam-incense": {
    protected: {
      title: "Tomas Recusa Acender o Incenso",
      scene: "{{secondary}} reconhece o lacre azul e impede que eu abra {{object}} dentro da hospedaria. Leva-me de barco a um ponto onde o vento sopra para o mar. Quando o pacote é exposto, a fumaça desenha ruas de Bayam que não existem mais.",
      clue: "a fumaça do pacote reconstrói o traçado de ruas antigas de Bayam quando levada pelo vento marítimo",
      unlockLocation: "Bayam, píer de pedras da cidade antiga",
      delayedTitle: "A Rua que o Mar Conservou",
      delayedScene: "{{secondary}} encontra uma maré baixa excepcional e me leva até fundações submersas que coincidem com o mapa de fumaça. Sob uma soleira existe uma caixa de moedas iguais às do pacote, todas cunhadas depois de o bairro ter sido demolido.",
      delayedClue: "ruínas submersas contêm moedas cunhadas após a destruição oficial do bairro",
    },
    coerced: {
      title: "O Barqueiro Leva a Fumaça Para Outro Homem",
      scene: "Pressionado, {{secondary}} concorda em ajudar e simultaneamente oferece a mesma travessia a um comprador. Quando acendo uma amostra do incenso, vejo duas embarcações seguindo o mesmo mapa de fumaça por lados opostos.",
      clue: "{{secondary}} vendeu a rota criada pelo incenso a um segundo interessado",
      unlockLocation: "Bayam, canal estreito atrás do mercado de especiarias",
      delayedTitle: "A Cidade se Divide em Duas Rotas",
      delayedScene: "As duas equipes chegam a lugares diferentes e ambas encontram pistas verdadeiras. O mapa não mostra uma rota única; reage a quem o respira. {{secondary}} percebe antes de mim que o incenso talvez esteja mapeando desejo, não geografia.",
      delayedClue: "o mapa de fumaça muda conforme quem respira o incenso, sugerindo que reage a intenção ou desejo",
    },
    lost: {
      title: "O Barco Volta Sem Barqueiro",
      scene: "O barco de {{secondary}} retorna sozinho, com o remo preso e o fundo coberto por pó azul. O pacote de incenso está aberto sobre o banco, embora eu tivesse certeza de que ainda estava comigo horas antes.",
      clue: "uma segunda versão do pacote apareceu no barco vazio de {{secondary}}",
      unlockLocation: "Bayam, ancoradouro abandonado da Cidade Velha",
      delayedTitle: "O Cheiro que Chega Antes do Barco",
      delayedScene: "Toda madrugada sinto o mesmo aroma segundos antes de um barco vazio cruzar a névoa. Em uma dessas passagens ouço {{secondary}} chamando do porão, mas o casco é raso demais para possuir porão algum.",
      delayedClue: "a voz de {{secondary}} é ouvida de um compartimento impossível em barcos vazios que repetem a mesma rota",
    },
    finalEcho: "Bayam nunca me deu um mapa neutro. Cada caminho parecia responder à pessoa que o seguia — talvez por isso o destino de quem caminhou comigo tenha mudado tanto a própria cidade.",
  },

  "bayam-diver": {
    protected: {
      title: "Sela Não Cura o Primeiro Ferimento",
      scene: "{{secondary}} recusa tratar o corte causado por {{object}} antes de observar como ele fecha sozinho. A cicatriz cresce na forma do recife onde a máscara foi encontrada. Pela primeira vez, meu corpo funciona como mapa.",
      clue: "ferimentos causados pela máscara cicatrizam formando o desenho do recife",
      unlockLocation: "Bayam, casa costeira de Sela Roon",
      delayedTitle: "A Cicatriz Mostra Uma Segunda Profundidade",
      delayedScene: "{{secondary}} compara minha cicatriz com a de antigos mergulhadores. Cada uma acrescenta uma camada ao mesmo mapa vertical. A máscara não veio apenas de um ponto do recife; veio de uma profundidade que os barcos locais não conseguem alcançar.",
      delayedClue: "cicatrizes de mergulhadores diferentes compõem um mapa de profundidades abaixo do recife conhecido",
    },
    coerced: {
      title: "A Curandeira Deixa o Veneno Trabalhar",
      scene: "Depois de ser ameaçada, {{secondary}} trata meu ferimento apenas o suficiente para eu andar. Ela quer que eu sinta o efeito completo da máscara. Horas depois, começo a ouvir maré mesmo longe da água — e descubro uma entrada no cais seguindo o som.",
      clue: "o efeito não tratado da máscara permite perceber uma entrada oculta guiada por som de maré",
      unlockLocation: "Bayam, túnel de drenagem sob o cais oriental",
      delayedTitle: "Uma Cura que Também Apaga",
      delayedScene: "{{secondary}} oferece o antídoto completo depois, mas avisa: ele apagará a percepção que me permitiu encontrar o túnel. Curar-se significa perder uma vantagem; manter a vantagem significa continuar envenenado.",
      delayedClue: "o tratamento completo remove também a percepção anormal concedida pela máscara",
    },
    lost: {
      title: "A Casa da Curandeira Está Cheia de Água",
      scene: "Encontro a casa de {{secondary}} inundada até os tornozelos apesar da rua seca. Pequenos peixes nadam sob a cama. Na parede há uma marca de maré na altura do teto e nenhuma saída recente.",
      clue: "a casa de {{secondary}} sofreu uma inundação impossível sem afetar a rua ao redor",
      unlockLocation: "Bayam, casa inundada de Sela Roon",
      delayedTitle: "O Canto Debaixo do Assoalho",
      delayedScene: "À noite, a água retorna apenas dentro da casa. Sob o assoalho ouço {{secondary}} cantar uma canção usada por mergulhadores para marcar subida. Cada verso termina um pouco mais perto da superfície.",
      delayedClue: "a voz de {{secondary}} parece subir de uma profundidade impossível sob a própria casa",
    },
    finalEcho: "A máscara ensinou que profundidade não é apenas distância para baixo. Também é o quanto alguém aceita sofrer para enxergar um caminho que os outros não veem.",
  },

  "trier-clockwork": {
    protected: {
      title: "Célie Chega Antes do Próprio Bilhete",
      scene: "{{secondary}} aceita confiar em mim e mostra um recibo datado de amanhã. Enquanto conversamos, uma versão mais velha do papel desliza sob a porta, amarelada por anos. A mesma assinatura aparece nas duas.",
      clue: "o mesmo recibo existe em versões separadas por anos, ambas com a assinatura de {{secondary}}",
      unlockLocation: "Trier, oficina de calibração sob o Bairro Antigo",
      delayedTitle: "A Mulher que Está Perdendo Minutos",
      delayedScene: "{{secondary}} percebe que suas lembranças não estão desaparecendo; estão chegando cedo demais. Ela recorda conversas que só teremos no dia seguinte. Uma dessas memórias inclui meu corpo caído ao lado do relógio aberto.",
      delayedClue: "{{secondary}} começou a receber lembranças do próprio futuro, inclusive uma possível morte do investigador",
    },
    coerced: {
      title: "Célie Me Vende Um Minuto Falso",
      scene: "Pressionada, {{secondary}} entrega o horário em que o mecanismo fica vulnerável. Ela omite que o relógio 'atrasado' cria dois minutos subjetivos para quem está dentro da oficina. Entro acreditando ter sessenta segundos e descubro que todos lá fora tiveram cento e vinte.",
      clue: "o mecanismo altera a relação entre tempo interno e externo da oficina",
      unlockLocation: "Trier, câmara de escapamento do relógio experimental",
      delayedTitle: "O Minuto Que Ela Usou Para Fugir",
      delayedScene: "{{secondary}} usa a diferença temporal para desaparecer enquanto eu ainda acredito que ela está ao meu lado. Deixa, porém, uma peça ajustada para atrasar exatamente meu próximo movimento — como se soubesse quando eu a encontraria.",
      delayedClue: "{{secondary}} explorou a diferença temporal para preparar uma peça destinada a um encontro futuro específico",
    },
    lost: {
      title: "A Cliente Que Chega Todo Dia Pela Primeira Vez",
      scene: "{{secondary}} some dos registros, mas continua entrando na relojoaria toda tarde sem reconhecer ninguém. A cada visita está alguns minutos mais jovem. Maître Bellac finge que não percebe porque tem medo do que acontecerá quando ela chegar à idade zero do mecanismo.",
      clue: "{{secondary}} reaparece diariamente mais jovem e sem memória das visitas anteriores",
      unlockLocation: "Trier, sala de espera privada da relojoaria Bellac",
      delayedTitle: "A Última Visita de Célie",
      delayedScene: "Ela entra adolescente, depois criança. Na visita seguinte ninguém chega — apenas um relógio de bolso novo aparece sobre o balcão, gravado com as iniciais dela e batendo ao contrário.",
      delayedClue: "o desaparecimento regressivo de {{secondary}} culminou num relógio com suas iniciais que funciona ao contrário",
    },
    finalEcho: "Trier transformou relações em relógios: algumas adiantaram, outras atrasaram, e algumas só percebi que tinham terminado quando já não havia tempo para refazê-las.",
  },

  "trier-river": {
    protected: {
      title: "Renard Não Entrega a Carta à Polícia",
      scene: "{{secondary}} decide confiar em mim antes de confiar na própria instituição. Em vez de protocolar {{object}}, compara o selo com memorandos internos. O escritório emissor foi extinto oficialmente, mas continua emitindo ordens por uma cadeia paralela.",
      clue: "um escritório público extinto continua produzindo ordens válidas por uma cadeia administrativa clandestina",
      unlockLocation: "Trier, arquivo morto do antigo Escritório Serifim",
      delayedTitle: "A Repartição que Ainda Tem Expediente",
      delayedScene: "{{secondary}} encontra uma porta de serviço que só abre no horário descrito na carta. Do outro lado há funcionários trabalhando em silêncio sob um brasão abolido há anos. Nenhum parece saber que seu órgão deixou de existir.",
      delayedClue: "uma repartição oficialmente extinta continua funcionando fisicamente com funcionários que ignoram sua extinção",
    },
    coerced: {
      title: "O Agente Faz de Mim a Fonte",
      scene: "Depois de ser pressionado, {{secondary}} coopera e registra secretamente que todas as informações vieram de mim. Se a investigação der certo, ele fica limpo; se der errado, eu viro a origem oficial do vazamento.",
      clue: "{{secondary}} documentou o investigador como fonte exclusiva para transferir responsabilidade pelo caso",
      unlockLocation: "Trier, sala reservada do posto fluvial",
      delayedTitle: "A Fonte que Nunca Falou",
      delayedScene: "Surge um depoimento assinado por mim descrevendo fatos que ainda não contei a {{secondary}}. Ele jura não ter escrito. A assinatura é boa, mas o vocabulário reproduz expressões da carta do rio, não as minhas.",
      delayedClue: "um depoimento falso do investigador usa a linguagem do escritório extinto e conhece fatos não revelados",
    },
    lost: {
      title: "O Agente Cai Fora do Mapa",
      scene: "{{secondary}} deixa de responder. Seu posto existe, seus colegas existem, mas a mesa foi retirada e o número de matrícula pula do anterior para o seguinte. Apenas a carta molhada ainda menciona sua unidade.",
      clue: "a matrícula funcional de {{secondary}} foi removida sem alterar a sequência administrativa ao redor",
      unlockLocation: "Trier, depósito de mobiliário público à margem do Serifim",
      delayedTitle: "A Mesa que Volta Pelo Rio",
      delayedScene: "Uma mesa de escritório é retirada do rio dias depois. Dentro da gaveta há o distintivo de {{secondary}} e relatórios datados das próximas semanas, descrevendo minha investigação com detalhes cada vez mais imprecisos.",
      delayedClue: "relatórios futuros ligados a {{secondary}} antecipam a investigação, mas perdem precisão conforme avançam no tempo",
    },
    finalEcho: "No Serifim, documentos sobreviveram melhor que pessoas. Minha escolha foi decidir quais pessoas mereciam mais proteção do que o papel que poderia substituí-las.",
  },

  "backlund-morgue": {
    protected: {
      title: "Wren Confere o Segundo Corpo",
      scene: "{{secondary}} aceita reabrir a rota de remoção e encontra uma duplicidade: o mesmo número de cadáver foi usado em duas macas que saíram de lugares diferentes. Uma chegou ao necrotério; a outra nunca chegou a lugar algum.",
      clue: "o mesmo número de cadáver foi atribuído a duas remoções diferentes, e uma delas desapareceu no trajeto",
      unlockLocation: "Backlund, garagem de remoção do necrotério municipal",
      delayedTitle: "A Maca Que Volta Vazia",
      delayedScene: "{{secondary}} monta vigília na garagem. Às 03:12 uma maca entra sozinha, molhada de chuva embora a noite esteja seca. Presa à alça há uma nova etiqueta com o meu nome e um número ainda não usado.",
      delayedClue: "uma maca autônoma trouxe antecipadamente uma etiqueta de cadáver com o nome do investigador",
    },
    coerced: {
      title: "O Policial Corrige a Cadeia de Custódia",
      scene: "Pressionado, {{secondary}} decide que a melhor defesa é fazer de mim parte oficial do problema. Ele corrige relatórios antigos para mostrar que eu toquei em {{object}} antes de a duplicidade ser descoberta.",
      clue: "{{secondary}} alterou registros para vincular o investigador formalmente à etiqueta duplicada",
      unlockLocation: "Backlund, sala de formulários da remoção funerária",
      delayedTitle: "O Corpo Que Me Dá Álibi",
      delayedScene: "A falsificação se volta contra {{secondary}} quando o cadáver 'ligado' a mim respira diante de três testemunhas no horário em que eu estava preso numa sala. O documento criado para me incriminar torna-se a prova mais forte de que o sistema está sendo manipulado.",
      delayedClue: "um registro falsificado para incriminar o investigador acabou criando álibi durante um evento impossível",
    },
    lost: {
      title: "O Constable na Gaveta Errada",
      scene: "{{secondary}} desaparece do turno. Horas depois, uma gaveta refrigerada emperra. Dentro não há corpo, mas seu uniforme dobrado, seu distintivo e uma etiqueta declarando hora da morte vinte minutos no futuro.",
      clue: "os pertences de {{secondary}} foram preparados como cadáver antes da hora de morte registrada",
      unlockLocation: "Backlund, câmara fria secundária do necrotério",
      delayedTitle: "Vinte Minutos Depois",
      delayedScene: "A hora escrita chega. Todas as lâmpadas apagam por três segundos. Quando voltam, a etiqueta está vazia e o uniforme de {{secondary}} cheira a rua molhada, como se tivesse acabado de ser usado do lado de fora.",
      delayedClue: "a etiqueta de {{secondary}} apagou a própria inscrição no instante previsto para a morte",
    },
    finalEcho: "O necrotério me obrigou a separar documento, corpo e pessoa. Descobri que salvar um deles não significava necessariamente salvar os outros dois.",
  },

  "court-testament": {
    protected: {
      title: "Beatrice Encontra o Herdeiro Impossível",
      scene: "{{secondary}} cruza o testamento com registros sucessórios e encontra um herdeiro tecnicamente válido: alguém declarado morto antes do nascimento do último testador. A assinatura reaparece em inventários espaçados por cento e quarenta anos.",
      clue: "o mesmo herdeiro juridicamente impossível assina sucessões separadas por mais de um século",
      unlockLocation: "Backlund, arquivo sucessório reservado de Cherwood",
      delayedTitle: "A Herança Que Escolhe o Advogado",
      delayedScene: "{{secondary}} descobre que toda pessoa que contestou a linhagem recebeu depois um pequeno legado anônimo. Seu próprio nome surge agora num codicilo recém-localizado. A herança não elimina opositores; tenta incorporá-los como beneficiários.",
      delayedClue: "o patrimônio usa legados para transformar contestadores em interessados na continuidade da linhagem",
    },
    coerced: {
      title: "A Advogada Redige Uma Saída Para Si",
      scene: "Pressionada, {{secondary}} coopera e ao mesmo tempo protocola uma petição que limita a responsabilidade dela. O texto parece burocrático até eu perceber que me nomeia informalmente como possuidor de {{object}} e, portanto, potencial sucessor de obrigações que ninguém definiu.",
      clue: "{{secondary}} transferiu documentalmente ao investigador parte do risco jurídico ligado ao objeto do espólio",
      unlockLocation: "Backlund, sala de protocolos antigos de Cherwood",
      delayedTitle: "A Cláusula Que Só Vale Depois da Morte",
      delayedScene: "A petição de {{secondary}} recebe despacho num processo encerrado há décadas. O juiz que assina está morto. A decisão declara que minhas obrigações começam 'quando a personalidade anterior deixar de produzir efeitos'. Para um transmigrado, a frase é aterrorizantemente específica.",
      delayedClue: "uma decisão assinada por juiz morto condiciona obrigações à extinção de uma identidade anterior",
    },
    lost: {
      title: "A Cadeira Vazia na Mesa de Audiência",
      scene: "{{secondary}} falta a uma reunião que jamais faltaria. Seu escritório continua aberto, mas cada procuração foi revogada com data de ontem por clientes que negam ter assinado. No processo, surge uma petição pedindo que ela seja considerada 'inexistente para fins sucessórios'.",
      clue: "documentos passaram a tratar {{secondary}} como juridicamente inexistente antes de qualquer declaração formal",
      unlockLocation: "Backlund, arquivo de procurações revogadas de Cherwood",
      delayedTitle: "A Herdeira Que Passou a Ser Beatrice",
      delayedScene: "Uma mulher desconhecida comparece ao cartório com documentos perfeitos usando o nome de {{secondary}}. Ela reconhece detalhes íntimos da vida profissional, mas segura a caneta com a mão oposta. O sistema aceita a identidade sem hesitar.",
      delayedClue: "uma substituta documentalmente perfeita assumiu a identidade de {{secondary}} sem reproduzir seus hábitos físicos",
    },
    finalEcho: "O testamento mostrou que identidade também pode ser herdada. O ponto mais perigoso foi perceber que a lei conseguia registrar a troca mesmo quando a realidade ainda resistia a ela.",
  },

  "tram-ticket": {
    protected: {
      title: "Mabel Lembra da Plataforma Sem Dizer o Nome",
      scene: "{{secondary}} aceita me ajudar, mas se recusa a pronunciar o nome antigo da estação. Em vez disso, desenha o caminho. Toda vez que tenta escrever a palavra, a tinta escorre para fora das letras como se o papel rejeitasse o destino.",
      clue: "o nome da estação não pode ser registrado normalmente, mas sua rota pode ser descrita",
      unlockLocation: "Backlund, sala de mapas antigos do terminal de Cherwood",
      delayedTitle: "O Bonde das 02:17",
      delayedScene: "{{secondary}} reaparece antes do amanhecer e me leva a uma plataforma técnica. Às 02:17 um bonde vazio passa sem constar da grade. No vidro há passageiros refletidos que não existem dentro do veículo.",
      delayedClue: "um bonde fora da grade atravessa a plataforma com reflexos de passageiros ausentes",
    },
    coerced: {
      title: "A Bilheteira Me Dá o Horário Certo Uma Vez",
      scene: "Pressionada, {{secondary}} entrega 02:17. Ela não explica que o horário muda depois de ser conhecido. Chego à plataforma e encontro um bilhete recém-perfurado para 02:34 com meu nome no verso.",
      clue: "o horário da estação clandestina muda quando alguém toma conhecimento dele",
      unlockLocation: "Backlund, túnel de manutenção entre Cherwood e a linha antiga",
      delayedTitle: "O Horário Aprende Meu Atraso",
      delayedScene: "Cada tentativa de chegar cedo move a passagem alguns minutos adiante. {{secondary}} observa meus cálculos e conclui que a estação não está fugindo do relógio; está fugindo especificamente de mim.",
      delayedClue: "a passagem muda de horário em resposta às tentativas do investigador de alcançá-la",
    },
    lost: {
      title: "Mabel Compra Um Bilhete Só de Ida",
      scene: "{{secondary}} desaparece depois de adquirir um bilhete para a estação inexistente. O caixa jura ter vendido, mas a gaveta não contém dinheiro correspondente. No livro, a transação ocupa uma linha entre 02:16 e 02:17 sem duração registrada.",
      clue: "{{secondary}} embarcou para a estação em uma transação registrada fora da passagem normal do tempo",
      unlockLocation: "Backlund, guichê desativado número 4 do terminal",
      delayedTitle: "A Voz no Próximo Bonde",
      delayedScene: "Em um bonde comum, o alto-falante inexistente anuncia a próxima parada com a voz de {{secondary}}. Nenhum outro passageiro reage. Quando desço, descubro que viajei três quarteirões além do trajeto normal.",
      delayedClue: "a voz de {{secondary}} passou a surgir como anúncio de uma linha que desvia passageiros do trajeto comum",
    },
    finalEcho: "A estação que não existia provou que caminhos podem ser apagados dos mapas sem desaparecer do mundo. O mesmo valeu para pessoas que eu não protegi a tempo.",
  },

  "newspaper-proof": {
    protected: {
      title: "Nell Publica Uma Linha Errada de Propósito",
      scene: "{{secondary}} propõe um teste: altera discretamente um detalhe da prova sobre o crime futuro. Na chapa seguinte, o acontecimento previsto muda para acomodar a mentira. A matéria não descreve o futuro; participa de sua construção.",
      clue: "alterar deliberadamente a notícia modifica o evento futuro descrito na prova seguinte",
      unlockLocation: "Backlund, arquivo de chapas descartadas do Morning Post",
      delayedTitle: "A Manchete Que Salvou Um Homem e Matou Outro",
      delayedScene: "{{secondary}} usa uma edição controlada para afastar a vítima prevista do local. Funciona. Horas depois a prova muda e anuncia outra morte no mesmo endereço. Evitamos um destino, não a necessidade do jornal de preencher a manchete.",
      delayedClue: "a previsão pode trocar de vítima quando o evento original é impedido, preservando a estrutura do crime",
    },
    coerced: {
      title: "A Repórter Escreve Meu Nome na Coluna Errada",
      scene: "Depois de ser pressionada, {{secondary}} testa até onde vai o fenômeno incluindo meu nome num parágrafo que não será impresso. A prova seguinte me descreve chegando ao local do crime antes da polícia — algo que ainda posso decidir não fazer.",
      clue: "o sistema tipográfico incorporou o nome do investigador depois que {{secondary}} o inseriu experimentalmente",
      unlockLocation: "Backlund, sala de composição noturna do Morning Post",
      delayedTitle: "A Notícia Sobre Minha Ausência",
      delayedScene: "{{secondary}} apaga meu nome. A próxima prova não diz que sobrevivi; diz que 'o indivíduo não compareceu e por isso o incêndio se espalhou'. O jornal transforma até minha recusa em causa narrativa.",
      delayedClue: "as provas atribuem consequências causais também a ações que o investigador decide não realizar",
    },
    lost: {
      title: "A Repórter Vira Nota de Rodapé",
      scene: "{{secondary}} desaparece antes de fechar a edição. Na prova seguinte, há uma breve nota sobre uma jornalista morta em acidente sem nomear ninguém. Na edição impressa, a nota some — e os colegas deixam de lembrar para quem era a mesa vazia.",
      clue: "o jornal antecipou e depois apagou a morte de {{secondary}} enquanto memórias dos colegas também se alteravam",
      unlockLocation: "Backlund, depósito de edições recolhidas do Morning Post",
      delayedTitle: "A Edição Que Só Eu Recebi",
      delayedScene: "Um exemplar é entregue em minha casa com uma matéria assinada por {{secondary}} depois de seu desaparecimento. Ela descreve minhas escolhas com precisão e termina com a frase: 'se você está lendo, ainda dá tempo de não publicar o final'.",
      delayedClue: "uma edição privada contém texto de {{secondary}} escrito após seu desaparecimento e reage à trajetória do investigador",
    },
    finalEcho: "No Morning Post, cada escolha ameaçou virar manchete antes de eu compreender suas consequências. O único espaço que o jornal nunca controlou totalmente foi o que eu devia às pessoas ao meu redor.",
  },

  "theatre-mask": {
    protected: {
      title: "Giles Corta a Cena que Não Está no Roteiro",
      scene: "{{secondary}} aceita interromper o ensaio e encontra uma sequência de marcações cênicas escrita sob o palco. Elas pertencem a uma versão antiga da peça em que a atriz da máscara não morria no terceiro ato — ela saía pela plateia.",
      clue: "existe uma versão antiga da peça em que a portadora da máscara sobrevive saindo pela plateia",
      unlockLocation: "Backlund, arquivo cenográfico sob o teatro de Hillston",
      delayedTitle: "A Plateia Ensaiada",
      delayedScene: "{{secondary}} reúne programas antigos e percebe os mesmos sobrenomes em lugares específicos da plateia ao longo de décadas. Algumas famílias não vêm assistir à peça; vêm ocupar posições necessárias para que determinado final aconteça.",
      delayedClue: "assentos específicos são ocupados por famílias recorrentes para sustentar uma versão do final da peça",
    },
    coerced: {
      title: "O Diretor Me Dá Um Papel",
      scene: "Pressionado, {{secondary}} me coloca em cena como figurante para me manter sob controle. A máscara vira o rosto na minha direção antes de qualquer ator tocá-la. No roteiro do ponto, aparece uma fala nova com meu nome.",
      clue: "o roteiro começou a incorporar o investigador como personagem depois de sua entrada em cena",
      unlockLocation: "Backlund, cabine do ponto no teatro de Hillston",
      delayedTitle: "A Cena Que Exige Minha Queda",
      delayedScene: "{{secondary}} tenta cortar minhas falas, mas toda cópia do roteiro passa a incluí-las. Uma delas termina com uma rubrica simples: 'ele cai'. Pela primeira vez, recusar um papel pode ser mais importante que descobrir quem escreveu a peça.",
      delayedClue: "todas as cópias do roteiro passaram a exigir uma queda do investigador no terceiro ato",
    },
    lost: {
      title: "O Diretor Continua Dando Ordens do Subpalco",
      scene: "{{secondary}} desaparece durante a troca de cenário. Mesmo assim, sua voz continua chegando pelo tubo acústico, dando ordens corretas para o restante do espetáculo. Quando abro o subpalco, o tubo termina numa parede.",
      clue: "a voz de {{secondary}} continua dirigindo o espetáculo de um ponto fisicamente inacessível",
      unlockLocation: "Backlund, rede antiga de tubos acústicos do teatro",
      delayedTitle: "O Aplauso Para Quem Não Saiu",
      delayedScene: "Na noite seguinte o público aplaude quando o nome de {{secondary}} é anunciado, embora o programa não o mencione. Por alguns segundos vejo uma silhueta curvar-se atrás da cortina fechada.",
      delayedClue: "o público reage à presença de {{secondary}} mesmo quando nenhuma aparição física é registrada",
    },
    finalEcho: "O teatro insistiu que todo mundo tinha papel. A diferença foi decidir se eu trataria as pessoas como atores substituíveis ou como alguém capaz de abandonar o roteiro comigo.",
  },

  "hospital-ward": {
    protected: {
      title: "Peter Fecha o Corredor dos Espelhos",
      scene: "{{secondary}} acredita em mim o bastante para impedir visitantes e cobrir cada superfície refletora do corredor. Sem os espelhos, o paciente entra em pânico e chama por um nome que não consta de nenhum prontuário.",
      clue: "sem reflexos disponíveis, o paciente revela espontaneamente um nome ausente dos registros hospitalares",
      unlockLocation: "Backlund, corredor de isolamento desativado da enfermaria",
      delayedTitle: "O Porteiro Reconhece o Homem do Outro Lado",
      delayedScene: "{{secondary}} encontra uma fotografia de antigos funcionários. Um homem ao fundo tem o mesmo rosto da figura nos espelhos atuais. O mais inquietante: ele está usando uniforme de porteiro e o crachá de Peter.",
      delayedClue: "uma fotografia antiga mostra a entidade refletida usando a identidade funcional de {{secondary}} décadas antes",
    },
    coerced: {
      title: "Peter Deixa Uma Porta Aberta",
      scene: "Depois de ser pressionado, {{secondary}} obedece formalmente e deixa de me alertar sobre uma porta de serviço. Ela parece atalho até eu notar espelhos pequenos pregados na parte interna, todos inclinados para quem entra.",
      clue: "uma porta de serviço foi preparada com múltiplos espelhos voltados para o visitante",
      unlockLocation: "Backlund, passagem de serviço espelhada do hospital",
      delayedTitle: "A Culpa Vira Uma Chave",
      delayedScene: "{{secondary}} admite ter deixado a porta aberta para me assustar, não matar. Agora a figura dos espelhos começou a aparecer atrás dele também. A pequena vingança criou um vínculo que nenhum dos dois sabe romper.",
      delayedClue: "a exposição causada por {{secondary}} transferiu a perseguição da entidade também para ele",
    },
    lost: {
      title: "O Porteiro Não Aparece no Espelho",
      scene: "{{secondary}} some do posto. No espelho do saguão, porém, continua sentado lendo jornal. Quando me aproximo, o reflexo levanta os olhos e coloca um dedo sobre os lábios.",
      clue: "o reflexo de {{secondary}} permanece no hospital depois do desaparecimento do corpo",
      unlockLocation: "Backlund, saguão fechado da ala antiga",
      delayedTitle: "O Reflexo Abre a Porta",
      delayedScene: "Dias depois, o {{secondary}} refletido se levanta, atravessa um corredor que não existe no mundo real e abre uma porta do outro lado do vidro. Atrás dela vejo o paciente e várias pessoas desaparecidas olhando para fora.",
      delayedClue: "o reflexo de {{secondary}} revelou um corredor onde pessoas desaparecidas permanecem presas do outro lado",
    },
    finalEcho: "No hospital, salvar alguém podia significar manter seu corpo deste lado do vidro — e às vezes eu só percebi isso depois que a relação já tinha atravessado para o outro.",
  },

  "canal-photograph": {
    protected: {
      title: "Eleanor Aceita Ser Fotografada Sozinha",
      scene: "{{secondary}} consente num retrato de controle. A figura não aparece atrás dela; aparece ocupando exatamente o espaço onde eu estaria se estivesse ao lado da câmera. Pela primeira vez, ela parece reagir mais ao observador que ao fotografado.",
      clue: "a figura nas chapas parece seguir o observador principal, não necessariamente a pessoa fotografada",
      unlockLocation: "Backlund, sala escura secundária do estúdio Carden",
      delayedTitle: "A Chapa Tirada Sem Fotógrafo",
      delayedScene: "{{secondary}} prepara uma câmera com disparo mecânico e deixa a sala vazia. A fotografia revela apenas o estúdio comum — e uma sombra no lugar onde eu costumo ficar. A entidade talvez dependa de alguém olhando para criar presença.",
      delayedClue: "uma fotografia sem observador humano não mostra a figura, apenas a ausência de quem costuma observá-la",
    },
    coerced: {
      title: "Eleanor Faz Uma Fotografia Minha Sem Permissão",
      scene: "Depois de ser pressionada, {{secondary}} reage com sua própria invasão: captura meu retrato enquanto durmo numa cadeira do estúdio. Na chapa, a figura está tão próxima de mim que sua mão cobre parte do meu ombro.",
      clue: "uma fotografia não consentida mostra a figura quase tocando o investigador",
      unlockLocation: "Backlund, mezanino de câmeras antigas do estúdio Carden",
      delayedTitle: "A Cópia Que Ela Vendeu",
      delayedScene: "{{secondary}} vende uma cópia do meu retrato a um colecionador. Horas depois, a figura some das chapas do estúdio. Percebo com horror que talvez não esteja mais ligada ao negativo original — mas à cópia em circulação.",
      delayedClue: "a figura desapareceu do original depois que uma cópia do retrato foi vendida",
    },
    lost: {
      title: "Eleanor Some da Foto de Família",
      scene: "{{secondary}} desaparece primeiro das fotografias e só depois da rua. A família continua posando com um espaço vazio entre duas cadeiras e não sabe explicar por que ninguém ocupa aquele lugar.",
      clue: "{{secondary}} foi removida das imagens antes de desaparecer fisicamente da rotina familiar",
      unlockLocation: "Backlund, residência da família Price em Cherwood",
      delayedTitle: "A Sexta Pessoa Ganha o Vestido Dela",
      delayedScene: "Na fotografia original, a figura desconhecida agora veste a roupa de {{secondary}}. O rosto continua o mesmo. A contagem do broche diminui mais uma vez.",
      delayedClue: "a figura incorporou as roupas de {{secondary}} depois de seu desaparecimento e a contagem do broche avançou",
    },
    finalEcho: "O estúdio mostrou que ser visto também pode ser uma forma de vínculo. Quem eu mantive por perto mudou literalmente quem continuou aparecendo nas imagens.",
  },

  "police-evidence": {
    protected: {
      title: "May Faz Uma Cópia Fora da Delegacia",
      scene: "{{secondary}} confia em mim o bastante para copiar a cadeia de custódia e deixar uma versão numa igreja antes de qualquer confronto. Pela primeira vez, alterar o livro interno deixa de ser suficiente para apagar o que sabemos.",
      clue: "existe uma cópia externa da cadeia de custódia que não pode ser reescrita dentro da delegacia",
      unlockLocation: "Tingen, arquivo paroquial usado por Constable May",
      delayedTitle: "A Prova Que Sobrevive ao Incêndio",
      delayedScene: "A sala de evidências pega fogo de madrugada. {{secondary}} volta com a cópia que salvamos e descobre que uma única etiqueta destruída no incêndio nunca existiu no duplicado. Alguém inseriu a prova falsa depois que criamos o controle externo.",
      delayedClue: "a comparação com a cópia externa identifica uma prova inserida clandestinamente após o controle independente",
    },
    coerced: {
      title: "May Aprende a Me Registrar Antes de Falar",
      scene: "Pressionada, {{secondary}} passa a abrir ocorrência toda vez que me vê. Isso me irrita até eu perceber que os horários oficiais criam uma linha temporal que a pessoa do armário clandestino precisa trabalhar para contradizer.",
      clue: "os registros defensivos de {{secondary}} criam uma cronologia difícil de falsificar sem deixar divergências",
      unlockLocation: "Tingen, sala de livros diários da delegacia",
      delayedTitle: "A Falsificação Que Chegou Cedo Demais",
      delayedScene: "Surge uma ocorrência descrevendo uma discussão nossa antes de ela acontecer. {{secondary}} me mostra o documento e, pela primeira vez, a hostilidade vira vantagem: se não discutirmos, criamos uma inconsistência objetiva no sistema.",
      delayedClue: "um registro antecipou uma discussão e pode ser desmentido simplesmente recusando o comportamento previsto",
    },
    lost: {
      title: "O Plantão Sem May",
      scene: "{{secondary}} some, mas o livro de escala mostra que trabalhou normalmente. Três presos lembram de ter falado com ela. Nenhum consegue descrever seu rosto. A cadeira do posto tem sangue seco sob a borda.",
      clue: "testemunhas lembram da função de {{secondary}} durante o plantão, mas não de sua aparência",
      unlockLocation: "Tingen, cela de triagem junto à sala de evidências",
      delayedTitle: "A Testemunha Que Usa a Voz Dela",
      delayedScene: "Um preso pede para falar comigo e reproduz perfeitamente a voz de {{secondary}} sem saber quem ela é. Diz que aprendeu ouvindo alguém atrás da parede da cela recitar os relatórios da delegacia inteira.",
      delayedClue: "uma voz semelhante à de {{secondary}} recita documentos policiais de dentro de uma parede da carceragem",
    },
    finalEcho: "A delegacia ensinou que prova não é verdade: é verdade preservada contra gente interessada em reescrevê-la. Relações funcionaram do mesmo jeito.",
  },

  "church-donation": {
    protected: {
      title: "Agnes Se Lembra do Crime que Não Cometeu",
      scene: "{{secondary}} aceita falar sem tocar em {{object}}. Ela descreve com detalhes uma lembrança de ter roubado a caixa de ofertas na juventude — depois prova documentalmente que estava em outra cidade naquele dia. A culpa permanece mesmo quando o fato é impossível.",
      clue: "a moeda consegue produzir culpa autobiográfica por atos que documentos provam nunca ter ocorrido",
      unlockLocation: "Tingen, arquivo de confissões antigas da paróquia",
      delayedTitle: "A Confissão Que Salvou Uma Vida",
      delayedScene: "{{secondary}} reconhece numa confissão antiga a mesma memória falsa que agora sente. O autor se matou acreditando ser culpado. Nas margens, porém, deixou uma lista de pensamentos que nunca executou — e um deles descreve a origem das moedas.",
      delayedClue: "uma vítima antiga registrou a origem possível das moedas ao separar pensamentos de atos reais",
    },
    coerced: {
      title: "Agnes Me Faz Confessar Primeiro",
      scene: "Pressionada, {{secondary}} se recusa a falar enquanto eu não disser algo de que me envergonho. A conversa parece pessoal até {{object}} ficar mais pesada a cada frase. Percebo que a moeda reage à estrutura da confissão, não ao conteúdo moral.",
      clue: "a moeda reage fisicamente ao ato de confessar, independentemente de a culpa relatada ser verdadeira",
      unlockLocation: "Tingen, confessionário desativado da capela",
      delayedTitle: "A Mentira Mais Pesada",
      delayedScene: "{{secondary}} testa uma confissão falsa e a moeda quase quebra a madeira da mesa. Uma verdade pequena produz menos efeito. O objeto não pesa culpa; pesa distância entre o que alguém diz e o que acredita sobre si mesmo.",
      delayedClue: "o peso da moeda aumenta com a divergência entre confissão e autoimagem, não com gravidade moral do ato",
    },
    lost: {
      title: "Agnes Deixa de Reconhecer as Próprias Mãos",
      scene: "{{secondary}} some da rotina sem sair da capela. Ela continua varrendo o chão, mas afirma ter outro nome e outra vida. Father Roland jura que a mulher é Agnes; ela reage ao nome como se fosse de uma estranha.",
      clue: "{{secondary}} permanece fisicamente presente, mas perdeu a identidade autobiográfica ligada ao próprio nome",
      unlockLocation: "Tingen, depósito de objetos votivos da capela",
      delayedTitle: "A Vida que a Moeda Escreveu Para Ela",
      delayedScene: "A nova identidade de {{secondary}} possui lembranças detalhadas, inclusive crimes e afetos verificavelmente falsos. Uma das pessoas que ela 'lembra' aparece na capela procurando por ela — e carrega outra moeda negra.",
      delayedClue: "uma segunda moeda conecta uma identidade falsa de {{secondary}} a uma pessoa real que a reconhece",
    },
    finalEcho: "A moeda tornou culpa, intenção e identidade perigosamente parecidas. O que me manteve inteiro foi lembrar que pessoas concretas importavam mais que qualquer rótulo de bom ou mau.",
  },
};

export const OFFLINE_BRANCH_STATS = {
  starts: Object.keys(OFFLINE_BRANCH_ARCS).length,
  relationshipVariants: Object.keys(OFFLINE_BRANCH_ARCS).length * 3,
  delayedChapters: Object.keys(OFFLINE_BRANCH_ARCS).length * 3,
};
