import { AudioMood, GameOrigin, LedgerData, NPCRecord } from "../types";

export type LocalIntent =
  | "observe"
  | "investigate"
  | "question"
  | "persuade"
  | "deceive"
  | "threaten"
  | "follow"
  | "hide"
  | "flee"
  | "fight"
  | "protect"
  | "steal"
  | "read"
  | "use-item"
  | "travel"
  | "wait"
  | "report"
  | "occult"
  | "improvise";

type AttributeKey = "vigor" | "destreza" | "intelecto" | "percepcao" | "carisma";

export type NpcAgendaGoal =
  | "conceal-evidence"
  | "recover-object"
  | "sell-information"
  | "seek-protection"
  | "flee-town"
  | "test-player"
  | "alert-network"
  | "seek-authorities"
  | "frame-player"
  | "investigate-alone";

export interface OfflineNpcAgenda {
  npcName: string;
  role: string;
  goal: NpcAgendaGoal;
  progress: number;
  urgency: number;
  nextActionTurn: number;
  exposed: boolean;
  resolved: boolean;
  history: string[];
}

export interface OfflineGameState {
  engineVersion: 3;
  startId: string;
  turn: number;
  phase: number;
  seed: number;
  /** Código curto e compartilhável que torna a campanha reproduzível. */
  campaignSeed: string;
  pressure: number;
  evidence: number;
  trust: number;
  occultExposure: number;
  violence: number;
  deception: number;
  mercy: number;
  lawfulness: number;
  curiosity: number;
  route: string;
  flags: string[];
  visitedLocations: string[];
  npcTrust: Record<string, number>;
  playerCommitments: string[];
  /** Eventos já usados para evitar repetição dentro da mesma crônica. */
  eventHistory: string[];
  lastEventTurn: number;
  /** Objetivos que avançam mesmo quando o jogador ignora os NPCs. */
  npcAgendas: Record<string, OfflineNpcAgenda>;
  /** Último foco inferido para resolver referências como “ele”, “ela” ou “isso” em turnos seguintes. */
  focusNpc?: string;
  focusItem?: string;
  lastIntents?: LocalIntent[];
  endingId?: string;
}

export interface OfflineTurnResult {
  text: string;
  ledger: LedgerData;
  mood: AudioMood;
  suggestedActions: string[];
  ending?: OfflineEnding;
}

interface OfflineStart {
  id: string;
  title: string;
  location: string;
  time: string;
  role: string;
  hook: string;
  object: string;
  npc: { name: string; role: string; attitude: string };
  threat: string;
  secret: string;
  clue: string;
  nextLocation: string;
  secondNpc: { name: string; role: string };
}

interface OfflineEnding {
  id: string;
  title: string;
  condition: (s: OfflineGameState, l: LedgerData) => boolean;
  epilogue: (origin: GameOrigin, s: OfflineGameState, l: LedgerData) => string;
}

interface OfflineEventResult {
  text: string;
  dialogue?: string;
  clue?: string;
  mystery?: string;
  secret?: string;
  pressureDelta?: number;
  evidenceDelta?: number;
  trustDelta?: number;
  lawfulnessDelta?: number;
  occultDelta?: number;
  sanityDelta?: number;
  mood?: AudioMood;
}

interface OfflineEventTemplate {
  id: string;
  minTurn?: number;
  maxTurn?: number;
  minPhase?: number;
  maxPhase?: number;
  condition?: (s: OfflineGameState, l: LedgerData) => boolean;
  run: (start: OfflineStart, s: OfflineGameState, l: LedgerData) => OfflineEventResult;
}

interface ParsedAction {
  raw: string;
  normalized: string;
  intents: Array<{ intent: LocalIntent; score: number }>;
  primary: LocalIntent;
  secondary?: LocalIntent;
  attribute: AttributeKey;
  target?: string;
  item?: string;
  cautious: boolean;
  aggressive: boolean;
  empathetic: boolean;
  deceptive: boolean;
  promise: boolean;
  directSpeech?: string;
  clauses: string[];
  specificity: number;
}

const STARTS: OfflineStart[] = [
  {
    id: "iron-cross-room",
    title: "O Quarto 17 da Rua Cruz de Ferro",
    location: "Tingen, Rua Cruz de Ferro",
    time: "05:20, amanhecer cinzento sob garoa fina",
    role: "copista desempregado",
    hook: "acordo com a porta trancada por dentro e uma poça de água salgada avançando debaixo da cama, embora o quarto fique no terceiro andar",
    object: "uma chave de latão marcada com o número 17",
    npc: { name: "Sra. Smyrin", role: "senhoria do prédio", attitude: "nervosa e desconfiada" },
    threat: "alguém no corredor conta meus passos em voz baixa",
    secret: "o antigo inquilino fazia entregas para uma sociedade que usava símbolos de olhos fechados",
    clue: "pegadas molhadas terminam diante de uma parede sem porta",
    nextLocation: "porão selado da pensão",
    secondNpc: { name: "Evan Royce", role: "vizinho estudante de história" },
  },
  {
    id: "khoy-archive",
    title: "A Página que Não Existia",
    location: "Tingen, Arquivo da Universidade Khoy",
    time: "22:40, noite fria e silenciosa",
    role: "assistente de arquivo",
    hook: "encontro uma página recém-escrita dentro de um catálogo fechado há vinte anos; a caligrafia descreve exatamente o que faço neste instante",
    object: "um cartão de empréstimo assinado amanhã",
    npc: { name: "Professor Arlen Vick", role: "historiador adjunto", attitude: "cético, porém inquieto" },
    threat: "a luz a gás apaga sempre que leio a última linha",
    secret: "um acervo privado foi removido da universidade sem registro oficial",
    clue: "a tinta da página contém pó metálico usado por gravadores de Backlund",
    nextLocation: "depósito subterrâneo da biblioteca",
    secondNpc: { name: "Mina Welch", role: "bibliotecária do turno noturno" },
  },
  {
    id: "tussock-crate",
    title: "A Caixa que Sussurra no Tussock",
    location: "Backlund, Docas do Rio Tussock",
    time: "03:10, madrugada de névoa ácida",
    role: "vigia noturno do cais",
    hook: "uma lancha sem identificação deixa uma caixa imperial cujo interior produz um murmúrio ritmado, parecido com respiração humana",
    object: "um manifesto de carga com três nomes raspados",
    npc: { name: "Garrick Holt", role: "capataz do cais", attitude: "autoritário e evasivo" },
    threat: "dois homens de casaco escuro procuram a caixa sem mostrar credenciais",
    secret: "o selo imperial foi falsificado por alguém de dentro da alfândega",
    clue: "a cera do lacre contém cinza funerária",
    nextLocation: "armazém 6 das docas",
    secondNpc: { name: "Nora Bell", role: "conferente de carga" },
  },
  {
    id: "east-district-apothecary",
    title: "O Dente de Cobre",
    location: "Backlund, Distrito Leste",
    time: "00:35, noite abafada por fumaça de carvão",
    role: "assistente de boticário",
    hook: "um homem tossindo sangue compra láudano, desmaia e deixa cair um dente humano revestido de cobre que permanece morno",
    object: "o dente de cobre e uma chave com fita de veludo",
    npc: { name: "Dr. Melvin Crow", role: "boticário", attitude: "pragmático e assustado" },
    threat: "uma carruagem sem brasão estaciona do outro lado da rua e não vai embora",
    secret: "o paciente vinha comprando compostos que não constam de nenhum receituário médico",
    clue: "a chave possui limalha azul presa aos dentes",
    nextLocation: "oficina fechada na Viela Moss",
    secondNpc: { name: "Elsie Marr", role: "lavadeira que viu o paciente chegar" },
  },
  {
    id: "st-george-coffin",
    title: "Três Batidas no Caixão",
    location: "Backlund, Cemitério Memorial de St. George",
    time: "18:55, crepúsculo chuvoso",
    role: "ajudante de funerária",
    hook: "ouço três batidas dentro do caixão de um indigente oficialmente declarado morto desde ontem",
    object: "um prego de prata fosco retirado da tampa",
    npc: { name: "Abel Grimshaw", role: "agente funerário", attitude: "supersticioso e defensivo" },
    threat: "o livro de sepultamentos registra meu próprio sobrenome na próxima linha em branco",
    secret: "alguns corpos do necrotério chegam ao cemitério sem passar pelo registro municipal",
    clue: "terra vermelha sob as botas do cadáver não existe em nenhum setor do cemitério",
    nextLocation: "ossuário antigo de St. George",
    secondNpc: { name: "Irmã Lorna", role: "voluntária da Igreja da Noite" },
  },
  {
    id: "hillston-bookshop",
    title: "As Vinte e Duas Leis",
    location: "Backlund, Hillston",
    time: "16:15, tarde nublada e fria",
    role: "livreiro de segunda mão",
    hook: "descubro um caderno cifrado escondido no fundo falso de uma caixa de romances baratos, comprado de uma idosa que desapareceu da rua minutos depois",
    object: "caderno intitulado 'Notas sobre as 22 Leis das Essências'",
    npc: { name: "Edmund Vale", role: "colecionador de livros", attitude: "cordial demais para ser inocente" },
    threat: "clientes diferentes começam a pedir exatamente pelo mesmo caderno",
    secret: "uma página do caderno foi arrancada recentemente e vendida separadamente",
    clue: "há um endereço em Backlund escondido nas letras capitais do prefácio",
    nextLocation: "casa de leilões da Rua Rose",
    secondNpc: { name: "Clara Mott", role: "encadernadora" },
  },
  {
    id: "bridge-club",
    title: "O Guardanapo do Clube",
    location: "Backlund, Bairro da Ponte",
    time: "23:05, noite de vento e névoa baixa",
    role: "garçom de clube privado",
    hook: "após uma reunião de nobres encontro um guardanapo com coordenadas cifradas e o nome de um inspetor riscado de vermelho",
    object: "guardanapo de linho com cifras e uma marca de vinho incomum",
    npc: { name: "Sir Wallace Kent", role: "frequentador aristocrata", attitude: "polido e ameaçador" },
    threat: "o mordomo tranca as portas e anuncia uma revista nos funcionários",
    secret: "a reunião discutia uma carga desaparecida antes mesmo de a polícia saber do caso",
    clue: "o vinho derramado veio de uma garrafa reservada a uma única mesa",
    nextLocation: "sala de cartas do clube",
    secondNpc: { name: "Martha Keen", role: "copeira veterana" },
  },
  {
    id: "joewood-ledger",
    title: "O Livro-Caixa dos Mortos",
    location: "Backlund, Distrito de Joewood",
    time: "07:30, manhã pálida sob fumaça industrial",
    role: "auxiliar de cobrança",
    hook: "recebo uma lista de devedores e percebo que quatro deles morreram meses atrás, embora pagamentos tenham sido registrados ontem",
    object: "livro-caixa com recibos recentes assinados por mortos",
    npc: { name: "Harold Finch", role: "supervisor de cobrança", attitude: "impaciente e controlador" },
    threat: "um cobrador que questionou os registros não voltou ao trabalho",
    secret: "a contabilidade falsa financia um endereço sem nome no Distrito Leste",
    clue: "todos os recibos usam a mesma gota de tinta violeta rara",
    nextLocation: "escritório de penhores de Black Palm Street",
    secondNpc: { name: "Rose Pike", role: "viúva de um dos devedores" },
  },
  {
    id: "north-factory",
    title: "O Turno que Nunca Terminou",
    location: "Backlund, Fábricas do Distrito Norte",
    time: "05:50, amanhecer coberto por fuligem",
    role: "ajudante de manutenção",
    hook: "uma máquina continua funcionando depois de o vapor ser cortado e produz peças gravadas com números que não constam no projeto",
    object: "engrenagem negra ainda quente sem marca de fabricante",
    npc: { name: "Mason Tripp", role: "mestre mecânico", attitude: "irritado e temeroso" },
    threat: "o encarregado manda destruir todas as peças antes da inspeção",
    secret: "a máquina foi modificada à noite por engenheiros sem registro na fábrica",
    clue: "as peças formam juntas um diagrama circular incompleto",
    nextLocation: "casa de caldeiras interditada",
    secondNpc: { name: "Ada Snow", role: "operária do tear 4" },
  },
  {
    id: "empress-heirloom",
    title: "A Joia da Ala Fechada",
    location: "Backlund, Empress Borough",
    time: "20:20, noite clara sob o luar carmesim",
    role: "criado temporário de uma mansão",
    hook: "durante um jantar sou enviado por engano à ala interditada e encontro uma joia de família pulsando dentro de uma caixa de vidro",
    object: "lenço bordado com as iniciais de uma herdeira desaparecida",
    npc: { name: "Lady Marianne Voss", role: "viúva aristocrata", attitude: "fria e observadora" },
    threat: "a campainha da ala toca embora ninguém devesse estar lá",
    secret: "a herdeira desaparecida ainda recebe correspondência em nome falso",
    clue: "o lenço cheira a ozônio e ao mesmo perfume usado no salão principal",
    nextLocation: "jardim de inverno lacrado",
    secondNpc: { name: "Jonas Peel", role: "mordomo-chefe" },
  },
  {
    id: "pritz-manifest",
    title: "O Navio Sem Porto de Origem",
    location: "Porto de Pritz, Armazém da Companhia de Navegação",
    time: "14:10, tarde chuvosa com mar revolto",
    role: "escriturário portuário",
    hook: "um navio atraca com manifesto perfeito, exceto por não existir qualquer registro do porto onde diz ter partido",
    object: "manifesto com carimbo de uma cidade inexistente",
    npc: { name: "Capitão Orson Reed", role: "capitão mercante", attitude: "exausto e evasivo" },
    threat: "a tripulação se recusa a descer ao porão e um marinheiro desaparece durante a conferência",
    secret: "o navio fez uma escala não declarada numa ilha fora das rotas oficiais",
    clue: "sal negro se acumula apenas ao redor da escotilha do porão",
    nextLocation: "porão do cargueiro Grey Petrel",
    secondNpc: { name: "Vera Cole", role: "fiscal aduaneira" },
  },
  {
    id: "pritz-smugglers",
    title: "A Lanterna Verde",
    location: "Porto de Pritz, Doca dos Contrabandistas",
    time: "01:45, madrugada de chuva oblíqua",
    role: "carregador avulso",
    hook: "um homem paga três vezes o valor normal para eu levar uma mala até uma lanterna verde que só aparece quando ninguém olha diretamente para ela",
    object: "mala de couro trancada e recibo sem assinatura",
    npc: { name: "Bram Sutter", role: "intermediário portuário", attitude: "amistoso por conveniência" },
    threat: "guardas aduaneiros fecham a doca enquanto o cliente some na neblina",
    secret: "a mala pertence a uma remessa dividida entre três cidades",
    clue: "o recibo usa papel timbrado de um hospital de Backlund",
    nextLocation: "taverna A Âncora Partida",
    secondNpc: { name: "Inez Ward", role: "contrabandista aposentada" },
  },
  {
    id: "conot-mine",
    title: "A Galeria 9",
    location: "Conot, Distrito Minerador",
    time: "11:30, manhã subterrânea sem referência de céu",
    role: "apontador de mina",
    hook: "uma equipe retorna de uma galeria que oficialmente não existe e todos juram ter trabalhado ali durante três dias, embora tenham desaparecido por quarenta minutos",
    object: "fragmento de minério transparente que embaça por dentro",
    npc: { name: "Foreman Darr", role: "capataz da mina", attitude: "hostil e apressado" },
    threat: "a direção ordena selar a galeria antes da chegada dos familiares dos mineiros",
    secret: "mapas antigos mostram uma construção enterrada muito antes da mineração",
    clue: "os relógios dos mineiros pararam no mesmo segundo",
    nextLocation: "entrada interditada da Galeria 9",
    secondNpc: { name: "Elias Thorn", role: "mineiro veterano" },
  },
  {
    id: "bayam-incense",
    title: "O Beco dos Aromas",
    location: "Bayam, Cidade Velha",
    time: "19:05, anoitecer quente antes da tempestade",
    role: "mensageiro de hospedaria",
    hook: "recebo um pacote de incenso para entregar e começo a ouvir o mar dentro dele mesmo a três ruas da costa",
    object: "pacote lacrado com cera azul e moedas coloniais antigas",
    npc: { name: "Mara Ily", role: "proprietária da hospedaria", attitude: "protetora e alarmada" },
    threat: "três marinheiros me seguem desde que aceitei a entrega",
    secret: "o destinatário morreu há uma semana, mas continua pagando o quarto",
    clue: "o lacre traz fibras de uma planta que não cresce no arquipélago",
    nextLocation: "quarto 8 da Pousada Gaivota Cinza",
    secondNpc: { name: "Tomas Quill", role: "barqueiro local" },
  },
  {
    id: "bayam-diver",
    title: "A Máscara Sob o Recife",
    location: "Bayam, cais oriental",
    time: "09:00, manhã luminosa após temporal",
    role: "ajudante de mergulhador",
    hook: "uma rede traz do fundo uma máscara de pedra que parece ter sido esculpida para um rosto com olhos demais",
    object: "máscara de pedra coberta por coral branco",
    npc: { name: "Captain Jero", role: "dono do barco de mergulho", attitude: "ganancioso e cauteloso" },
    threat: "pescadores locais reconhecem a peça e abandonam o cais sem explicar",
    secret: "outros objetos iguais foram encontrados e comprados por um estrangeiro",
    clue: "o coral da máscara é de águas muito mais profundas que o ponto do achado",
    nextLocation: "mercado noturno de Bayam",
    secondNpc: { name: "Sela Roon", role: "curandeira costeira" },
  },
  {
    id: "trier-clockwork",
    title: "O Relógio que Atrasa Pessoas",
    location: "Trier, Bairro Antigo dos Mecânicos de Vapor",
    time: "17:40, fim de tarde enevoado",
    role: "aprendiz de relojoeiro",
    hook: "um relógio recém-reparado perde exatamente sete minutos sempre que determinada cliente entra na oficina, enquanto os demais relógios permanecem corretos",
    object: "mola espiral gravada com caracteres microscópicos",
    npc: { name: "Maître Bellac", role: "relojoeiro", attitude: "orgulhoso e apreensivo" },
    threat: "a cliente retorna exigindo a peça substituída e oferece dinheiro demais",
    secret: "o relógio fazia parte de um lote fabricado para um laboratório fechado pelo governo",
    clue: "os caracteres da mola são números de coordenadas, não decoração",
    nextLocation: "oficina abandonada da Rue Vigne",
    secondNpc: { name: "Célie Arnaud", role: "cliente misteriosa" },
  },
  {
    id: "trier-river",
    title: "A Carta do Rio Serifim",
    location: "Trier, Quartier de l'Avenue",
    time: "06:35, manhã úmida junto ao rio",
    role: "entregador de jornais",
    hook: "retiro do rio uma garrafa com uma carta datada para amanhã, descrevendo um incêndio que ainda não aconteceu",
    object: "carta encharcada com um selo de escritório público",
    npc: { name: "Lucien Barre", role: "jornalista local", attitude: "curioso e oportunista" },
    threat: "um policial à paisana tenta comprar a carta antes de eu mencionar seu conteúdo",
    secret: "o prédio citado na carta guarda arquivos políticos sensíveis",
    clue: "a assinatura pertence a uma pessoa oficialmente fora da cidade",
    nextLocation: "arquivo municipal da Rue Saint-Martin",
    secondNpc: { name: "Officer Renard", role: "agente à paisana" },
  },
  {
    id: "backlund-morgue",
    title: "O Cadáver que Respira",
    location: "Backlund, necrotério municipal",
    time: "02:25, madrugada gelada",
    role: "auxiliar médico-legal",
    hook: "um cadáver retirado do esgoto não apresenta rigidez e suas veias pulsam lentamente embora não exista batimento cardíaco",
    object: "etiqueta de cadáver com número duplicado",
    npc: { name: "Dr. Harlan Pike", role: "legista", attitude: "científico, porém abalado" },
    threat: "alguém apaga o nome do morto no registro enquanto examino o corpo",
    secret: "o mesmo número de etiqueta já foi usado em outro cadáver cremado",
    clue: "há fuligem de vela dentro dos pulmões, não água do esgoto",
    nextLocation: "arquivo frio do necrotério",
    secondNpc: { name: "Constable Wren", role: "policial responsável pela remoção" },
  },
  {
    id: "court-testament",
    title: "O Testamento da Linhagem Extinta",
    location: "Backlund, cartório judicial de Cherwood",
    time: "13:50, tarde de garoa persistente",
    role: "copista de contratos",
    hook: "uma mancha de sangue seco em um testamento da Quarta Era começa a fumegar quando copio o nome do último herdeiro",
    object: "anel de sinete sem brasão guardado com o processo",
    npc: { name: "Clerk Henshaw", role: "escrivão-chefe", attitude: "formal e defensivo" },
    threat: "um advogado desconhecido exige o processo original antes do fechamento",
    secret: "o testamento foi reaberto por ordem que não consta no sistema do tribunal",
    clue: "o papel mais recente foi envelhecido artificialmente",
    nextLocation: "arquivo de processos encerrados",
    secondNpc: { name: "Beatrice Hall", role: "advogada de sucessões" },
  },
  {
    id: "tram-ticket",
    title: "O Bilhete para uma Estação Inexistente",
    location: "Backlund, terminal de bondes de Cherwood",
    time: "21:15, noite de névoa espessa",
    role: "fiscal de bilhetes",
    hook: "um passageiro adormecido carrega um bilhete válido para uma estação removida das linhas há dezenove anos",
    object: "bilhete perfurado com data de hoje e destino apagado dos mapas",
    npc: { name: "Owen Slate", role: "motorneiro", attitude: "ansioso e supersticioso" },
    threat: "o passageiro desaparece quando o bonde entra num túnel curto demais para ocultá-lo",
    secret: "motorneiros antigos conheciam uma parada de serviço mantida em segredo",
    clue: "a perfuração do bilhete foi feita por uma máquina ainda usada no terminal",
    nextLocation: "plataforma de manutenção desativada",
    secondNpc: { name: "Mabel Crane", role: "bilheteira aposentada" },
  },
  {
    id: "newspaper-proof",
    title: "A Notícia Antes do Crime",
    location: "Backlund, redação do Morning Post",
    time: "04:40, madrugada antes da impressão",
    role: "revisor tipográfico",
    hook: "uma prova de jornal anuncia um assassinato com detalhes que nenhum repórter escreveu e que, até onde sei, ainda não aconteceu",
    object: "prova tipográfica com a manchete impossível",
    npc: { name: "Editor Bramley", role: "editor de plantão", attitude: "irritado e desconfiado" },
    threat: "a matéria muda sutilmente cada vez que alguém tenta destruí-la",
    secret: "o endereço do crime pertence a um patrocinador do jornal",
    clue: "o tipo usado na manchete veio de uma gaveta mantida trancada",
    nextLocation: "sala de composição da imprensa",
    secondNpc: { name: "Nell Harper", role: "repórter criminal" },
  },
  {
    id: "theatre-mask",
    title: "A Máscara do Terceiro Ato",
    location: "Backlund, teatro de Hillston",
    time: "20:55, intervalo de uma estreia lotada",
    role: "assistente de palco",
    hook: "uma máscara de cena desaparecida há anos reaparece no camarim da protagonista, ainda úmida de chuva embora o teatro esteja fechado desde a tarde",
    object: "máscara branca com uma rachadura em forma de lágrima",
    npc: { name: "Viola Trent", role: "atriz principal", attitude: "assustada e orgulhosa" },
    threat: "um ator recita falas que não existem no roteiro e se recusa a sair do palco",
    secret: "a máscara pertenceu a uma atriz que morreu durante uma apresentação nunca concluída",
    clue: "há lama de cemitério na fita interna da máscara",
    nextLocation: "subpalco interditado",
    secondNpc: { name: "Giles Mercer", role: "diretor do teatro" },
  },
  {
    id: "hospital-ward",
    title: "O Paciente Sem Reflexo",
    location: "Backlund, enfermaria de caridade do Distrito Leste",
    time: "12:25, meio-dia escuro sob nuvens de fuligem",
    role: "assistente de enfermagem",
    hook: "um paciente ferido conversa normalmente, mas nenhum espelho da enfermaria mostra seu reflexo com clareza",
    object: "pulseira hospitalar com nome corrigido três vezes",
    npc: { name: "Nurse Halley", role: "enfermeira-chefe", attitude: "protetora e exausta" },
    threat: "dois homens alegando ser parentes tentam removê-lo sem autorização",
    secret: "o paciente foi internado com identidade falsa após um incêndio numa casa vazia",
    clue: "os curativos escondem marcas geométricas antigas, não queimaduras comuns",
    nextLocation: "arquivo de admissões do hospital",
    secondNpc: { name: "Peter Dunn", role: "porteiro do hospital" },
  },
  {
    id: "canal-photograph",
    title: "A Fotografia a Mais",
    location: "Backlund, estúdio fotográfico de Cherwood",
    time: "15:45, tarde fria com chuva leve",
    role: "assistente de fotógrafo",
    hook: "ao revelar uma chapa de uma família comum, surge ao fundo uma sexta pessoa que não estava no estúdio e que olha diretamente para a câmera",
    object: "negativo de vidro com a figura desconhecida",
    npc: { name: "Mr. Carden", role: "fotógrafo", attitude: "racional e perturbado" },
    threat: "a família exige todos os negativos e oferece pagar em segredo",
    secret: "a mesma figura aparece em fotografias antigas de pessoas sem relação entre si",
    clue: "o desconhecido veste um broche que mudou de formato entre as fotos",
    nextLocation: "arquivo de negativos do porão",
    secondNpc: { name: "Eleanor Price", role: "cliente retratada" },
  },
  {
    id: "police-evidence",
    title: "A Prova que Voltou ao Armário",
    location: "Tingen, delegacia central",
    time: "23:35, noite de chuva forte",
    role: "escrevente policial",
    hook: "um revólver lacrado como prova reaparece no armário horas depois de ter sido enviado ao laboratório, com uma cápsula recém-deflagrada no tambor",
    object: "etiqueta de cadeia de custódia rasgada",
    npc: { name: "Inspector Hollis", role: "inspetor de polícia", attitude: "severo e desconfiado" },
    threat: "o livro de acesso mostra minha assinatura num horário em que eu estava em outro setor",
    secret: "alguém dentro da delegacia manipula provas ligadas a três crimes aparentemente desconexos",
    clue: "a cápsula tem resíduo de pólvora diferente da munição oficial",
    nextLocation: "sala de evidências do subsolo",
    secondNpc: { name: "Constable May", role: "guarda do turno" },
  },
  {
    id: "church-donation",
    title: "A Moeda da Caixa de Ofertas",
    location: "Tingen, capela da Deusa da Noite",
    time: "06:10, manhã chuvosa antes do primeiro ofício",
    role: "voluntário da paróquia",
    hook: "ao contar as doações encontro uma moeda sem cunhagem que pesa como chumbo e deixa os dedos dormentes",
    object: "moeda negra sem efígie",
    npc: { name: "Father Roland", role: "clérigo local", attitude: "sereno, porém atento" },
    threat: "um homem ensopado espera do lado de fora e insiste que a moeda lhe pertence",
    secret: "moedas semelhantes apareceram em outras paróquias antes de incidentes inexplicáveis",
    clue: "a caixa foi aberta sem arrombar a fechadura",
    nextLocation: "sacristia antiga",
    secondNpc: { name: "Agnes Moor", role: "zeladora da capela" },
  },
];

const INTENT_WORDS: Record<LocalIntent, string[]> = {
  observe: ["olho", "observo", "examino", "vejo", "escuto", "ouço", "reparo", "vigio", "analiso o ambiente"],
  investigate: ["investigo", "procuro", "vasculho", "revisto", "examino", "busco", "verifico", "confiro", "inspeciono", "rastro", "pista"],
  question: ["pergunto", "questiono", "interrogo", "converso", "falo com", "falo para", "digo a", "respondo", "conto para", "indago", "quero saber", "pressiono por resposta"],
  persuade: ["convenço", "persuado", "acalmo", "negocio", "explico", "peço ajuda", "ganho confiança", "argumento"],
  deceive: ["minto", "finjo", "engano", "blefo", "disfarço", "invento", "farsa", "digo que sou"],
  threaten: ["ameaço", "intimido", "pressiono", "encurralo", "dou ultimato", "assusto"],
  follow: ["sigo", "persigo", "acompanho escondido", "vou atrás", "rastreio", "caudo"],
  hide: ["escondo", "me oculto", "fico nas sombras", "silenciosamente", "furtivo", "sem ser visto", "me abaixo"],
  flee: ["fujo", "corro", "escapo", "recuo", "saio daqui", "bato em retirada"],
  fight: ["ataco", "bato", "golpeio", "luto", "agarro", "derrubo", "soco", "chuto", "atirar", "atiro", "esfaqueio"],
  protect: ["protejo", "defendo", "salvo", "ajudo", "cubro", "tiro do perigo", "socorro"],
  steal: ["roubo", "furto", "pego escondido", "subtraio", "bato carteira"],
  read: ["leio", "decifro", "traduzo", "estudo", "interpreto", "código", "cifra", "documento"],
  "use-item": ["uso", "utilizo", "abro com", "acendo", "mostro", "entrego", "quebro", "guardo", "escondo o item"],
  travel: ["vou para", "entro", "subo", "desço", "atravesso", "caminho até", "retorno", "sigo para", "saio para"],
  wait: ["espero", "aguardo", "fico parado", "observo de longe", "deixo passar"],
  report: ["chamo a polícia", "aviso a polícia", "denuncio", "conto ao inspetor", "procuro a igreja", "peço reforço", "autoridades"],
  occult: ["ritual", "invoco", "magia", "feitiço", "espírito", "beyonder", "poção", "adivinhação"],
  improvise: [],
};

const INTENT_PATTERNS: Partial<Record<LocalIntent, RegExp[]>> = {
  observe: [/\b(?:observ|olh|examin|repar|escut|ouv|vigi|not)[a-z0-9'-]*\b/],
  investigate: [/\b(?:investig|procur|vasculh|revist|busc|verific|confer|inspecion|pist)[a-z0-9'-]*\b/],
  question: [/\b(?:pergunt|question|interrog|convers|indag|respond)[a-z0-9'-]*\b/],
  persuade: [/\b(?:convenc|persuad|acalm|negoci|argument|explic|implor)[a-z0-9'-]*\b/],
  deceive: [/\b(?:mint|finj|engan|blef|disfarc|invent)[a-z0-9'-]*\b/],
  threaten: [/\b(?:ameac|intimid|encurral|ultimat|coag)[a-z0-9'-]*\b/],
  follow: [/\b(?:persig|acompanh|caud|rastre)[a-z0-9'-]*\b/, /\bsigo\s+(?:ele|ela|o homem|a mulher|o suspeito|a suspeita|o sujeito|a pessoa)\b/],
  hide: [/\b(?:escond|ocult|furtiv|sorrateir|silencios)[a-z0-9'-]*\b/],
  flee: [/\b(?:fug|escap|recu|retir)[a-z0-9'-]*\b/, /\bcorro\s+(?:para fora|embora|ate a saida)\b/],
  fight: [/\b(?:atac|golpe|lut|agarr|derrub|soc|chut|esfaque|atir)[a-z0-9'-]*\b/],
  protect: [/\b(?:proteg|defend|salv|socorr|ampar)[a-z0-9'-]*\b/],
  steal: [/\b(?:roub|furt|subtra|surrupi|carteir)[a-z0-9'-]*\b/],
  read: [/\b(?:lei|leio|ler|decifr|traduz|estud|interpret|cifr)[a-z0-9'-]*\b/],
  "use-item": [/\b(?:utiliz|acend|entreg|guard|quebr)[a-z0-9'-]*\b/, /\buso\s+(?:o|a|um|uma|meu|minha)\b/],
  travel: [/\b(?:entro|subo|desco|atravess|caminh|retorn|volto)[a-z0-9'-]*\b/, /\b(?:vou|sigo)\s+para\b/],
  wait: [/\b(?:esper|aguard)[a-z0-9'-]*\b/, /\bfico\s+(?:parado|quieto|a distancia)\b/],
  report: [/\b(?:denunci|autoridad|polici|inspetor|reforco)[a-z0-9'-]*\b/, /\b(?:aviso|conto|informo)\s+(?:a|ao)\s+(?:policia|igreja|guarda|autoridade)\b/],
  occult: [/\b(?:ritual|invoc|magia|feitic|espirit|beyonder|pocao|adivinh|mistic|ocult)[a-z0-9'-]*\b/],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsPhrase(normalized: string, phrase: string): boolean {
  const p = normalizeText(phrase);
  if (!p) return false;
  const pattern = p.split(/\s+/).map(escapeRegExp).join("\\s+");
  return new RegExp(`(?:^|\\s)${pattern}(?=$|\\s)`).test(normalized);
}

const ATTRIBUTE_BY_INTENT: Record<LocalIntent, AttributeKey> = {
  observe: "percepcao",
  investigate: "intelecto",
  question: "carisma",
  persuade: "carisma",
  deceive: "carisma",
  threaten: "carisma",
  follow: "destreza",
  hide: "destreza",
  flee: "destreza",
  fight: "vigor",
  protect: "vigor",
  steal: "destreza",
  read: "intelecto",
  "use-item": "intelecto",
  travel: "vigor",
  wait: "percepcao",
  report: "carisma",
  occult: "intelecto",
  improvise: "intelecto",
};

const ENDINGS: OfflineEnding[] = [
  ending("case-solved", "O Caso Encerrado à Luz do Dia", s => s.evidence >= 9 && s.lawfulness >= 4 && s.violence < 5, (_o, s) => `Reuni provas suficientes para transformar rumores em um caso que sobreviveria à luz de um tribunal. Quando a névoa finalmente cedeu, ${s.evidence} peças do quebra-cabeça estavam catalogadas e a conspiração já não dependia da minha palavra.`),
  ending("private-truth", "A Verdade que Não Cabe num Processo", s => s.evidence >= 8 && s.lawfulness < 4 && s.occultExposure < 7, () => `Descobri quem movia as peças, mas compreendi que levar tudo às autoridades destruiria inocentes e alertaria gente poderosa demais. Fechei o caso para o mundo e guardei a verdade onde apenas eu poderia encontrá-la.`),
  ending("watcher", "O Vigia da Névoa", s => s.curiosity >= 8 && s.violence <= 3 && s.occultExposure >= 4, () => `Eu poderia ter ido embora. Em vez disso, escolhi observar. Passei a reconhecer padrões na névoa, horários impossíveis e nomes que nunca apareciam duas vezes. Não venci o mistério; tornei-me alguém capaz de vê-lo chegar.`),
  ending("trusted-network", "A Rede dos que Ainda Confiam", s => s.trust >= 8 && s.mercy >= 4, () => `Sobrevivi porque não tratei todas as pessoas como peças descartáveis. Testemunhas, trabalhadores e antigos suspeitos passaram a trocar informações comigo. A cidade continuou perigosa, mas eu deixei de enfrentá-la sozinho.`),
  ending("merciful", "A Porta Deixada Aberta", s => s.mercy >= 8 && s.pressure < 85, () => `No momento em que seria mais fácil sacrificar alguém, recusei. Essa escolha permitiu que uma testemunha sobrevivesse e que uma cadeia de crimes terminasse sem outro corpo na sarjeta. Algumas respostas escaparam, mas não minha humanidade.`),
  ending("hard-boiled", "O Investigador de Punhos Marcados", s => s.violence >= 8 && s.evidence >= 5 && s.pressure < 95, () => `Resolvi o problema como Backlund costuma resolver problemas que ninguém quer registrar: portas arrombadas, dentes quebrados e silêncio depois da meia-noite. Descobri o bastante para sobreviver, embora parte da verdade tenha se perdido no sangue.`),
  ending("wanted", "Procurado em Três Distritos", s => s.violence >= 7 && s.lawfulness <= -4, () => `Quando percebi, meu retrato já circulava entre guardas e informantes. A conspiração não foi a única coisa que desmontei; também destruí qualquer possibilidade de voltar à vida comum. A névoa virou esconderijo.`),
  ending("master-liar", "Uma Identidade Feita de Mentiras", s => s.deception >= 9 && s.trust >= 3, () => `Menti com tanta precisão que as versões falsas começaram a se sustentar umas às outras. O caso terminou, mas meu nome já não era uma certeza. Sobrevivi protegido por uma identidade que eu mesmo inventei.`),
  ending("betrayed", "A Mentira que Cobrou Juros", s => s.deception >= 7 && s.trust <= -3, () => `As histórias que contei voltaram em ordem diferente, na boca das pessoas erradas. Quando precisei de ajuda, ninguém sabia qual versão de mim merecia crédito. A conspiração venceu sem precisar me matar.`),
  ending("institutional", "Arquivo Selado", s => s.lawfulness >= 8 && s.evidence >= 6, () => `Entreguei cada documento pela via correta. O relatório passou por mãos demais, recebeu carimbos demais e então desapareceu num arquivo restrito. Oficialmente, nada aconteceu. Extraoficialmente, algumas portas passaram a abrir quando eu mostrava meu nome.`),
  ending("fugitive", "Um Trem Antes do Amanhecer", s => s.pressure >= 90 && s.evidence < 6 && s.violence < 7, () => `Não havia vitória naquela noite, apenas distância. Embarquei antes do amanhecer com poucas moedas e informação demais na cabeça. A cidade ficou para trás, mas não a sensação de estar sendo seguido.`),
  ending("broken-mind", "A Névoa Dentro do Quarto", (_s, l) => l.sanity <= 5, () => `Em algum momento parei de saber se os passos vinham do corredor ou de dentro da minha cabeça. O caso continuou sem mim. Restaram páginas cobertas por anotações repetidas e uma janela que eu jurava nunca ter aberto.`),
  ending("scarred-survivor", "Sobrevivente Marcado", s => s.occultExposure >= 9 && s.pressure < 95, () => `Vi mais do que um humano comum deveria ver e continuei respirando. Não saí ileso: certos sons agora me fazem procurar saídas, e certas luas me impedem de dormir. Mas aprendi que sobreviver também é uma forma de vitória.`),
  ending("threshold", "À Beira do Caminho", s => s.occultExposure >= 7 && s.curiosity >= 7 && s.evidence >= 5, () => `Todas as pistas apontaram para uma conclusão impossível: havia regras por trás do impossível. Terminei a investigação com uma fórmula incompleta, um nome de Sequência e a certeza de que dar o próximo passo mudaria para sempre o que eu era.`),
  ending("refusal", "A Escolha de Continuar Humano", s => s.occultExposure >= 7 && s.curiosity <= 3 && s.mercy >= 3, () => `Eu soube o suficiente para entender o preço da porta diante de mim. E recusei. Queimei o que precisava ser queimado, devolvi o que não me pertencia e escolhi uma vida menor — mas ainda minha.`),
  ending("collector", "O Gabinete de Coisas Impossíveis", s => s.curiosity >= 9 && s.evidence >= 7, (_o, _s, l) => `Ao fim, meu quarto parecia um pequeno museu clandestino: documentos, objetos e lembranças que nenhum antiquário sensato aceitaria. Cada peça respondia uma pergunta e abria duas outras. Eu parei de investigar um caso e comecei a catalogar um mundo.`),
  ending("protector", "O Nome que as Testemunhas Sussurram", s => s.mercy >= 6 && s.trust >= 6 && s.violence <= 5, () => `As pessoas que eu tirei do caminho da conspiração passaram a repetir meu nome em voz baixa quando alguém desaparecia ou quando uma porta era encontrada aberta por dentro. Eu não era herói. Apenas atendia.`),
  ending("blackmail", "O Dossiê", s => s.evidence >= 8 && s.deception >= 5 && s.lawfulness <= 1, () => `Em vez de entregar as provas, organizei-as. Cada carta, assinatura e recibo passou a valer mais do que dinheiro. A investigação terminou quando percebi que a verdade também podia ser uma arma guardada numa gaveta.`),
  ending("burned-evidence", "Cinzas no Tussock", s => s.evidence <= 2 && s.pressure >= 75 && s.mercy >= 2, () => `Destruí o que poderia arrastar mais gente para o abismo. Talvez também tenha destruído a única chance de compreender tudo. As cinzas desapareceram no rio e, por algum tempo, ninguém veio atrás de mim.`),
  ending("conspiracy-recruited", "Convite sem Assinatura", s => s.evidence >= 6 && s.deception >= 5 && s.trust <= 1 && s.occultExposure >= 3, () => `Eu esperava uma ameaça. Recebi um convite. Alguém do outro lado concluíra que seria mais útil me ter dentro da sala do que do lado de fora da porta. Aceitar não significava servir; significava chegar mais perto.`),
  ending("double-agent", "Duas Chaves, Duas Portas", s => s.deception >= 7 && s.lawfulness >= 3 && s.evidence >= 6, () => `Entreguei informações suficientes às autoridades para manter sua confiança e informações diferentes o bastante aos conspiradores para manter a minha cobertura. Passei a viver entre duas versões da verdade, sabendo que qualquer erro me deixaria sem nenhuma.`),
  ending("mob-justice", "Justiça na Rua Molhada", s => s.violence >= 6 && s.trust >= 5 && s.lawfulness <= 0, () => `Quando a lei hesitou, os trabalhadores e vizinhos que tinham perdido gente demais deixaram de esperar. Eu apenas mostrei onde olhar. A noite terminou com portas abertas à força e uma justiça que nenhum juiz assinaria.`),
  ending("quiet-life", "Uma Vida Quase Normal", s => s.curiosity <= 1 && s.pressure < 65 && s.occultExposure <= 3, () => `Escolhi parar antes que o mistério pudesse me escolher. Mudei de emprego, de rota e de hábitos. Às vezes ainda acordo com a sensação de ouvir três batidas na madeira, mas de manhã preparo o chá e finjo que foi sonho.`),
  ending("obsession", "O Mapa na Parede", s => s.curiosity >= 10 && s.evidence < 6, () => `As pistas deixaram de caber no caderno. Passei a prender fios entre nomes, ruas e horários, certo de que faltava apenas uma conexão. Talvez faltasse. Talvez o próprio mapa tivesse se tornado o mistério.`),
  ending("public-scandal", "A Cidade Lê a Manchete", s => s.evidence >= 9 && s.lawfulness >= 2 && s.trust >= 3, () => `A história escapou dos gabinetes e chegou às bancas. Pela primeira vez, gente poderosa precisou responder a perguntas em público. Nem todos caíram, mas o silêncio deixou de ser gratuito.`),
  ending("sacrifice", "O Último a Sair", s => s.mercy >= 9 && s.pressure >= 75, () => `Havia uma saída, mas não para todos. Fiquei para trás tempo suficiente para os outros atravessarem. Quando a porta fechou, eu soube que aquela investigação teria um fim mesmo que eu não visse o amanhecer.`),
  ending("vanished", "Sem Corpo, Sem Registro", s => s.pressure >= 100, () => `Depois daquela noite, meu nome aparece apenas em registros incompletos. Nenhum corpo foi encontrado. Nenhuma testemunha concorda sobre a última vez em que me viu. O caso ganhou mais um desaparecido.`),
  ending("accidental-hero", "O Homem que Estava no Lugar Errado", s => s.evidence >= 6 && s.mercy >= 4 && s.curiosity <= 5 && s.violence <= 4, () => `Nunca quis ser investigador. Eu apenas continuei fazendo a próxima coisa razoável enquanto todos ao redor faziam escolhas piores. Quando acabou, chamaram de coragem aquilo que, para mim, tinha sido insistência.`),
  ending("cold-truth", "A Solução Perfeita e Vazia", s => s.evidence >= 10 && s.mercy <= 0, () => `Resolvi cada contradição e identifiquei cada responsável. Também tratei cada pessoa como uma fonte, um risco ou uma ferramenta. O caso ficou impecável. A sala, quando terminei, ficou vazia.`),
  ending("open-door", "O Mistério Continua", s => s.turn >= 26, () => `Cheguei ao fim daquela etapa sem uma resposta capaz de encerrar tudo. Ainda assim, o que aprendi mudou a forma como olho para portas fechadas, notícias pequenas e homens que sorriem cedo demais. Uma nova pista já me esperava sobre a mesa.`),
];

function ending(id: string, title: string, condition: OfflineEnding["condition"], text: OfflineEnding["epilogue"]): OfflineEnding {
  return { id, title, condition, epilogue: text };
}

const NPC_AGENDA_GOALS: NpcAgendaGoal[] = [
  "conceal-evidence",
  "recover-object",
  "sell-information",
  "seek-protection",
  "flee-town",
  "test-player",
  "alert-network",
  "seek-authorities",
  "frame-player",
  "investigate-alone",
];

function agendaLabel(goal: NpcAgendaGoal): string {
  const labels: Record<NpcAgendaGoal, string> = {
    "conceal-evidence": "apagar rastros antes que virem prova",
    "recover-object": "recuperar o objeto central do incidente",
    "sell-information": "transformar informação em vantagem",
    "seek-protection": "encontrar proteção antes de falar demais",
    "flee-town": "sair da cidade sem deixar uma rota óbvia",
    "test-player": "descobrir até onde o investigador pode ser manipulado",
    "alert-network": "avisar uma rede maior sobre a investigação",
    "seek-authorities": "criar um registro oficial que sirva de proteção",
    "frame-player": "empurrar a suspeita para o investigador",
    "investigate-alone": "resolver uma parte do caso sem depender do jogador",
  };
  return labels[goal];
}

function createNpcAgenda(name: string, role: string, seed: number, offset: number): OfflineNpcAgenda {
  const goal = choose(NPC_AGENDA_GOALS, seed + offset * 173);
  return {
    npcName: name,
    role,
    goal,
    progress: 0,
    urgency: 1 + Math.floor(seeded01(seed + offset * 311) * 3),
    nextActionTurn: 2 + Math.floor(seeded01(seed + offset * 521) * 3) + offset,
    exposed: false,
    resolved: false,
    history: [],
  };
}

function initializeNpcAgendas(start: OfflineStart, seed: number): Record<string, OfflineNpcAgenda> {
  const primary = createNpcAgenda(start.npc.name, start.npc.role, seed, 0);
  let secondary = createNpcAgenda(start.secondNpc.name, start.secondNpc.role, seed, 1);
  // Evita que os dois personagens importantes comecem com exatamente o mesmo impulso oculto.
  if (secondary.goal === primary.goal) {
    const idx = (NPC_AGENDA_GOALS.indexOf(secondary.goal) + 3) % NPC_AGENDA_GOALS.length;
    secondary = { ...secondary, goal: NPC_AGENDA_GOALS[idx] };
  }
  return {
    [normalizeText(primary.npcName)]: primary,
    [normalizeText(secondary.npcName)]: secondary,
  };
}

const INTERMEDIATE_EVENTS: OfflineEventTemplate[] = [
  {
    id: "anonymous-note",
    minTurn: 2,
    run: (start) => ({
      text: `Uma folha dobrada aparece onde eu tinha certeza de não haver nada. A mensagem é curta: “Pare de perguntar sobre ${start.nextLocation}.” O papel não traz assinatura, mas foi arrancado de um bloco usado em escritório, não de um caderno pessoal.`,
      clue: `bilhete anônimo manda interromper perguntas sobre ${start.nextLocation}`,
      pressureDelta: 3,
      mood: "mystery",
    }),
  },
  {
    id: "watched-window",
    minTurn: 2,
    condition: (s) => s.pressure >= 20,
    run: () => ({
      text: `No reflexo de uma vidraça noto a mesma silhueta duas vezes, separada por ruas demais para ser coincidência. Quando me viro, sobra apenas o movimento da névoa e um bonde passando devagar.`,
      pressureDelta: 4,
      mystery: "Quem passou a acompanhar meus deslocamentos — e desde quando?",
      mood: "tension",
    }),
  },
  {
    id: "missing-page",
    minTurn: 3,
    condition: (_s, l) => (l.clues || []).length >= 2,
    run: () => ({
      text: `Ao revisar minhas anotações percebo que uma página foi retirada com cuidado, rente à costura. Não levaram tudo: levaram justamente o trecho que ligava duas pistas que pareciam independentes.`,
      pressureDelta: 4,
      clue: "alguém teve acesso às anotações e retirou apenas a ligação entre duas pistas",
      mood: "tension",
    }),
  },
  {
    id: "false-witness",
    minTurn: 3,
    run: (start) => ({
      text: `Uma testemunha que eu não procurei surge com uma versão perfeita demais. Ela cita ${start.object} antes que eu mencione o objeto. O erro é pequeno, mas transforma depoimento em pista.`,
      evidenceDelta: 1,
      clue: `uma testemunha espontânea conhecia ${start.object} antes de eu revelar sua existência`,
      mood: "discovery",
    }),
  },
  {
    id: "street-tail",
    minTurn: 3,
    condition: (s) => s.route === "clandestina" || s.deception >= 2,
    run: () => ({
      text: `O homem que me segue troca de chapéu numa esquina, mas não troca o jeito de poupar a perna esquerda. Percebo a substituição tarde o bastante para entender que não é um curioso: é uma vigilância organizada.`,
      pressureDelta: 5,
      clue: "a vigilância contra mim usa troca de observadores em pontos combinados",
      mood: "tension",
    }),
  },
  {
    id: "carriage-at-dawn",
    minTurn: 4,
    run: (start) => ({
      text: `Uma carruagem sem brasão para por menos de um minuto. Ninguém desce. Um envelope é deixado sob um banco e recolhido por outra pessoa logo depois. O segundo passageiro segue na direção de ${start.nextLocation}.`,
      evidenceDelta: 1,
      clue: `uma troca por mensageiros em carruagem conecta a rua atual a ${start.nextLocation}`,
    }),
  },
  {
    id: "rain-erases-tracks",
    minTurn: 2,
    maxPhase: 1,
    run: () => ({
      text: `A chuva engrossa de repente e apaga marcas que eu ainda pretendia medir. Antes de desaparecerem, consigo notar que um dos rastros vinha no sentido contrário ao que a versão oficial exige.`,
      clue: "rastros apagados pela chuva contradiziam a direção narrada pela versão oficial",
      evidenceDelta: 1,
    }),
  },
  {
    id: "clerk-remembers",
    minTurn: 3,
    condition: (s) => s.trust >= 1 || s.lawfulness >= 2,
    run: (start) => ({
      text: `Um escriturário que eu tratei como pessoa, e não como mobília, me chama de lado. Ele lembra de um registro corrigido duas vezes na mesma noite e de um sobrenome ligado a ${start.nextLocation}.`,
      clue: `um registro administrativo foi corrigido duas vezes para ocultar ligação com ${start.nextLocation}`,
      evidenceDelta: 1,
      trustDelta: 1,
      mood: "discovery",
    }),
  },
  {
    id: "worker-whisper",
    minTurn: 3,
    condition: (s) => s.mercy >= 1 || s.trust >= 2,
    run: (start) => ({
      text: `Um trabalhador espera os outros se afastarem antes de falar. Ele não sabe o que está acontecendo, mas reconhece o padrão: gente recebendo ordem para esquecer horários e não perguntar por ${start.nextLocation}.`,
      clue: `trabalhadores receberam ordens informais para não comentar movimentações ligadas a ${start.nextLocation}`,
      trustDelta: 1,
    }),
  },
  {
    id: "bell-code",
    minTurn: 4,
    run: () => ({
      text: `Sinos tocam fora do horário litúrgico. A sequência se repete depois de alguns minutos, igual demais para acaso. Anoto os intervalos e percebo que funcionam como um código simples de três sinais.`,
      evidenceDelta: 1,
      clue: "uma sequência de sinos fora de hora é usada como sinalização entre pontos distantes",
      mood: "mystery",
    }),
  },
  {
    id: "duplicate-key",
    minTurn: 4,
    condition: (_s, l) => (l.items || []).length > 0,
    run: (start) => ({
      text: `Numa banca de ferragens vejo uma chave com desgaste quase idêntico ao de ${start.object}. O vendedor jura que fez três cópias para um cliente que pagou em dinheiro e não deixou nome.`,
      clue: `existem cópias recentes relacionadas a ${start.object}`,
      evidenceDelta: 1,
      mood: "discovery",
    }),
  },
  {
    id: "burned-letter",
    minTurn: 4,
    condition: (s) => s.pressure >= 30,
    run: (start) => ({
      text: `Num braseiro encontro metade de uma carta que não terminou de queimar. Restam duas palavras úteis: “transferência” e “${start.nextLocation}”. Alguém teve pressa de destruir o resto.`,
      clue: `fragmento queimado menciona uma transferência para ${start.nextLocation}`,
      evidenceDelta: 1,
      pressureDelta: 2,
    }),
  },
  {
    id: "newspaper-column",
    minTurn: 5,
    condition: (s) => s.evidence >= 3,
    run: (start) => ({
      text: `Uma nota curta no jornal descreve um “acidente banal” com detalhes que só quem viu minhas pistas poderia conhecer. O texto tenta encerrar o assunto antes que a cidade comece a fazer perguntas.`,
      clue: `uma nota de jornal antecipa a versão pública do incidente e contém detalhes não divulgados`,
      pressureDelta: 3,
    }),
  },
  {
    id: "police-rounds",
    minTurn: 4,
    condition: (s) => s.lawfulness >= 2 || s.violence >= 2,
    run: () => ({
      text: `Patrulhas passam com frequência incomum. Um guarda me reconhece rápido demais — não como criminoso, ainda, mas como nome que já circulou numa conversa de delegacia.`,
      pressureDelta: 3,
      lawfulnessDelta: 1,
      mystery: "Por que meu nome já circula entre autoridades que eu não procurei?",
    }),
  },
  {
    id: "gaslight-flicker",
    minTurn: 3,
    condition: (s) => s.occultExposure >= 1,
    run: (start) => ({
      text: `As chamas dos lampiões diminuem na mesma ordem em que eu revejo mentalmente as pistas. Quando penso em ${start.secret}, a última chama apaga. Posso chamar de coincidência — uma vez.`,
      occultDelta: 1,
      sanityDelta: -2,
      mystery: "Por que fenômenos físicos parecem reagir quando certas conclusões se aproximam?",
      mood: "mystery",
    }),
  },
  {
    id: "crimson-dream",
    minTurn: 5,
    condition: (s) => s.occultExposure >= 2,
    run: (start) => ({
      text: `Durmo por minutos e sonho com ${start.nextLocation} visto de cima, sob a Lua Carmesim. Ao acordar, encontro barro seco na barra da roupa. Não aceito o sonho como prova, mas também não consigo descartá-lo.`,
      occultDelta: 1,
      sanityDelta: -3,
      clue: `barro seco após um sonho coincide com material ligado a ${start.nextLocation}`,
      mood: "tension",
    }),
  },
  {
    id: "warehouse-shift",
    minPhase: 1,
    run: (start) => ({
      text: `Uma mudança de turno acontece cedo demais. Homens que não estavam escalados entram por uma porta lateral e retiram caixas sem passar pelo registro. Uma delas carrega a mesma marca associada ao caso inicial.`,
      clue: `uma troca de turno irregular permite retirar material sem registro em direção a ${start.nextLocation}`,
      evidenceDelta: 1,
      pressureDelta: 2,
    }),
  },
  {
    id: "dead-drop",
    minPhase: 1,
    condition: (s) => s.route === "clandestina" || s.curiosity >= 4,
    run: () => ({
      text: `Descubro um ponto morto de mensagens: uma rachadura atrás de uma placa de rua onde papéis entram e saem sem que os remetentes se encontrem. O último bilhete foi recolhido há menos de uma hora.`,
      clue: "a rede usa um ponto morto de mensagens para separar remetentes e destinatários",
      evidenceDelta: 1,
    }),
  },
  {
    id: "borrowed-coat",
    minPhase: 1,
    run: () => ({
      text: `Reconheço um casaco que já vi antes, mas não a pessoa dentro dele. A roupa está sendo usada como senha visual; quem observa de longe identifica a peça, não o rosto.`,
      clue: "roupas específicas funcionam como identificação entre membros que não precisam se conhecer",
      evidenceDelta: 1,
    }),
  },
  {
    id: "forged-pass",
    minPhase: 1,
    condition: (s) => s.lawfulness >= 1 || s.evidence >= 4,
    run: (start) => ({
      text: `Um passe oficial parece correto até eu comparar a perfuração com um documento verdadeiro. O carimbo é legítimo; o formulário não. Alguém com acesso institucional está ajudando a circulação até ${start.nextLocation}.`,
      clue: `documentos falsos usam carimbos oficiais verdadeiros para facilitar acesso a ${start.nextLocation}`,
      evidenceDelta: 1,
    }),
  },
  {
    id: "hidden-ledger",
    minPhase: 1,
    condition: (s) => s.evidence >= 4,
    run: (start) => ({
      text: `Atrás de contas comuns encontro uma segunda numeração feita a lápis. Não são valores: são horários. O padrão coincide com movimentações já ligadas a ${start.nextLocation}.`,
      clue: `um livro-caixa esconde horários de movimentação sob números de contabilidade`,
      evidenceDelta: 2,
      mood: "discovery",
    }),
  },
  {
    id: "rival-investigator",
    minPhase: 1,
    minTurn: 6,
    run: (start) => ({
      text: `Alguém está refazendo meus passos. Não parece pertencer à mesma rede que tento descobrir: faz perguntas diferentes e chega sempre algumas horas depois. No bolso de um informante encontro apenas as iniciais “R.V.” e uma referência a ${start.nextLocation}.`,
      mystery: "Quem é o outro investigador que refaz meus passos?",
      clue: `um investigador desconhecido identificado apenas como R.V. também procura ${start.nextLocation}`,
      pressureDelta: 2,
    }),
  },
  {
    id: "locked-room-changed",
    minPhase: 1,
    condition: (s) => s.visitedLocations.length >= 2,
    run: () => ({
      text: `Volto a um ponto já visitado e encontro a disposição do ambiente alterada. Nada valioso sumiu. O que mudou foram ângulos, distâncias e linhas de visão — como se alguém estivesse reconstruindo o que eu pude perceber.`,
      pressureDelta: 4,
      clue: "uma cena já visitada foi rearranjada para ocultar o que eu poderia ter observado antes",
      mood: "tension",
    }),
  },
  {
    id: "river-package",
    minPhase: 1,
    run: (start) => ({
      text: `Um pacote encerado é retirado da água antes de afundar. Dentro há recibos sem nomes, mas as datas acompanham cada passo importante do caso. A última linha termina em ${start.nextLocation}.`,
      clue: `recibos descartados no rio registram pagamentos sincronizados com os principais eventos do caso`,
      evidenceDelta: 1,
    }),
  },
  {
    id: "coded-advert",
    minPhase: 1,
    run: () => ({
      text: `Um anúncio banal se repete em dois jornais com erros de pontuação idênticos. Lidos como separadores, os erros formam uma instrução de encontro. Não é uma cifra sofisticada; é uma cifra feita para parecer desinteressante.`,
      clue: "anúncios de jornal usam pontuação errada como código para marcar encontros",
      evidenceDelta: 1,
    }),
  },
  {
    id: "church-warning",
    minPhase: 1,
    condition: (s) => s.occultExposure >= 2 || s.lawfulness >= 3,
    run: () => ({
      text: `Um clérigo que não conheço pede que eu pare de tratar certos símbolos como simples decoração. Ele não explica o significado; apenas recomenda que eu não os copie e que não os observe antes de dormir.`,
      occultDelta: 1,
      trustDelta: 1,
      mystery: "Que regra torna certos símbolos perigosos mesmo sem um ritual?",
      mood: "mystery",
    }),
  },
  {
    id: "doctor-record",
    minPhase: 1,
    condition: (s) => s.evidence >= 3,
    run: (start) => ({
      text: `Um registro médico descreve três pacientes sem relação aparente. Todos tiveram o mesmo sintoma antes de sumirem da rotina: acordavam repetindo o nome de ${start.nextLocation}.`,
      clue: `pacientes sem relação repetiram o nome de ${start.nextLocation} antes de desaparecer da rotina`,
      occultDelta: 1,
      evidenceDelta: 1,
    }),
  },
  {
    id: "auction-list",
    minPhase: 2,
    run: (start) => ({
      text: `Uma lista de leilão privado inclui objetos descritos de modo propositalmente vago. Um lote corresponde a ${start.object}; outro traz apenas a anotação “recuperado do mesmo incidente”.`,
      clue: `um leilão privado trata ${start.object} como parte de uma série de objetos recuperados`,
      evidenceDelta: 1,
      pressureDelta: 2,
    }),
  },
  {
    id: "midnight-knock",
    minPhase: 2,
    run: () => ({
      text: `Três batidas soam na porta e ninguém responde quando pergunto quem é. No corredor há apenas um fósforo queimado colocado de pé contra o rodapé. Minutos depois, ouço as mesmas três batidas no andar de baixo.`,
      pressureDelta: 5,
      occultDelta: 1,
      sanityDelta: -2,
      mood: "tension",
    }),
  },
  {
    id: "blackout",
    minPhase: 2,
    condition: (s) => s.pressure >= 45,
    run: () => ({
      text: `A iluminação de toda a quadra falha ao mesmo tempo. Na escuridão, portas se abrem, passos mudam de direção e um assobio curto coordena movimentos. Quando a luz retorna, alguém aproveitou os segundos para alterar a cena.`,
      pressureDelta: 6,
      clue: "um apagão coordenado foi usado para movimentar pessoas e material sem testemunhas confiáveis",
      mood: "tension",
    }),
  },
  {
    id: "witness-disappears",
    minPhase: 2,
    condition: (s) => s.trust <= 2 && s.pressure >= 45,
    run: () => ({
      text: `Uma pessoa que aceitaria falar comigo não aparece ao encontro. O quarto está arrumado demais e a mala sumiu. Não encontro sinais de luta — apenas pressa ou obediência.`,
      pressureDelta: 5,
      mystery: "A testemunha fugiu por vontade própria ou foi retirada antes que pudesse falar?",
    }),
  },
  {
    id: "witness-returns",
    minPhase: 2,
    condition: (s) => s.trust >= 4 && s.mercy >= 2,
    run: (start) => ({
      text: `Uma testemunha que havia desaparecido retorna por conta própria. Ela não quer dinheiro; quer a promessa de que outra pessoa ficará fora disso. Em troca, confirma que ${start.secret}.`,
      secret: start.secret,
      evidenceDelta: 1,
      trustDelta: 2,
      mood: "discovery",
    }),
  },
  {
    id: "trap-door",
    minPhase: 2,
    condition: (s) => s.evidence >= 5,
    run: (start) => ({
      text: `Uma diferença no som do piso denuncia uma abertura sob tábuas recentes. O compartimento não guarda tesouro: guarda embalagens, listas de nomes e um mapa parcial de acesso a ${start.nextLocation}.`,
      clue: `um compartimento oculto contém listas e um mapa parcial de acesso a ${start.nextLocation}`,
      evidenceDelta: 2,
      mood: "discovery",
    }),
  },
  {
    id: "broken-watch",
    minPhase: 2,
    run: () => ({
      text: `Dois relógios encontrados em contextos diferentes pararam no mesmo minuto. Um terceiro, ainda funcionando, perde exatamente sete minutos por dia. A coincidência deixa de ser coincidência quando as datas são comparadas.`,
      clue: "relógios de cenas diferentes registram o mesmo minuto crítico e um desvio regular de sete minutos",
      evidenceDelta: 1,
      mystery: "O horário real dos eventos foi deliberadamente deslocado?",
    }),
  },
  {
    id: "cleaner-arrives",
    minPhase: 2,
    condition: (s) => s.evidence >= 6,
    run: () => ({
      text: `Um homem com material de limpeza chega antes de qualquer chamado formal. Ele sabe quais superfícies tocar e quais ignorar. Quando percebe meu interesse, abandona o balde e vai embora sem cobrar serviço algum.`,
      clue: "um agente de limpeza chegou antes do chamado e sabia quais superfícies poderiam conter vestígios",
      pressureDelta: 4,
      evidenceDelta: 1,
    }),
  },
  {
    id: "counterfeit-clue",
    minPhase: 2,
    condition: (s) => s.evidence >= 5,
    run: (start) => ({
      text: `Encontro uma pista boa demais: limpa, direta e apontando para um culpado conveniente. O problema é que o material de suporte foi produzido depois do incidente. Alguém começou a fabricar respostas para mim.`,
      clue: `uma prova plantada foi produzida depois do incidente para apontar um culpado conveniente`,
      pressureDelta: 3,
      evidenceDelta: 1,
    }),
  },
  {
    id: "network-mistake",
    minPhase: 2,
    condition: (s) => s.pressure >= 55,
    run: (start) => ({
      text: `A rede comete um erro por pressa: duas instruções diferentes usam a mesma expressão incomum e o mesmo horário de referência. Pela primeira vez consigo provar coordenação, não apenas semelhança.`,
      clue: `duas ordens independentes repetem a mesma expressão e horário, provando coordenação entre células do caso`,
      evidenceDelta: 2,
      pressureDelta: 2,
      mood: "discovery",
    }),
  },
  {
    id: "official-seal",
    minPhase: 2,
    condition: (s) => s.lawfulness >= 4,
    run: (start) => ({
      text: `Um documento que deveria estar arquivado aparece com selo de retirada autorizado. A assinatura pertence a alguém que estava oficialmente fora da cidade. A burocracia, dessa vez, entrega uma impossibilidade verificável.`,
      clue: `um documento foi retirado oficialmente com assinatura de alguém comprovadamente ausente`,
      evidenceDelta: 1,
      lawfulnessDelta: 1,
    }),
  },
  {
    id: "offer-to-stop",
    minPhase: 2,
    condition: (s) => s.evidence >= 6,
    run: () => ({
      text: `Recebo uma proposta sem ameaça explícita: dinheiro suficiente para mudar de vida em troca de devolver cópias e esquecer nomes. O valor é alto demais para ser blefe e específico demais para vir de alguém que não conhece meu progresso.`,
      pressureDelta: 4,
      mystery: "Quem sabe exatamente quais provas eu possuo e quanto custaria tentar comprá-las?",
      mood: "tension",
    }),
  },
  {
    id: "crimson-alignment",
    minPhase: 3,
    condition: (s) => s.occultExposure >= 4,
    run: (start) => ({
      text: `Sob a Lua Carmesim, três detalhes que eu tratava separadamente se alinham: horário, posição e símbolo. O desenho resultante aponta para ${start.nextLocation}, mas também sugere que o local é parte de algo repetido em escala maior.`,
      clue: `horários, posições e símbolos formam um padrão que converge para ${start.nextLocation}`,
      occultDelta: 1,
      evidenceDelta: 1,
      sanityDelta: -2,
      mood: "discovery",
    }),
  },
  {
    id: "final-cleanup",
    minPhase: 3,
    condition: (s) => s.pressure >= 60,
    run: (start) => ({
      text: `A operação de limpeza começa antes do fim do caso. Arquivos são movidos, testemunhas recebem passagens e portas em ${start.nextLocation} ficam abertas apenas o tempo necessário para retirar caixas. A rede acredita que estou perto demais.`,
      pressureDelta: 7,
      clue: `a rede iniciou uma retirada coordenada de provas e pessoas em ${start.nextLocation}`,
      mood: "tension",
    }),
  },
];

function normalizeText(input: string): string {
  return input
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded01(seed: number): number {
  let x = seed + 0x6d2b79f5;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
}

function choose<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seeded01(seed) * arr.length) % arr.length];
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function findTarget(text: string, ledger: LedgerData, start: OfflineStart): string | undefined {
  const normalized = normalizeText(text);
  const all = [...(ledger.npcs || []), { name: start.npc.name, role: start.npc.role }, { name: start.secondNpc.name, role: start.secondNpc.role }];
  const exact = all.find((n) => normalized.includes(normalizeText(n.name)));
  if (exact) return exact.name;

  // Também entende referências pelo papel social (“o capataz”, “a bibliotecária”, “o inspetor”…).
  const stop = new Set(["assistente", "agente", "pessoa", "homem", "mulher", "turno", "local", "cidade"]);
  const byRole = all.find((n) => {
    const role = "role" in n && n.role ? normalizeText(n.role) : "";
    const tokens = role.split(" ").filter((t) => t.length >= 5 && !stop.has(t));
    return tokens.some((t) => normalized.includes(t));
  });
  if (byRole) return byRole.name;

  // Continuidade conversacional: pronomes retomam o último NPC focalizado.
  const focusNpc = ledger.offlineState?.focusNpc;
  if (focusNpc && /\b(ele|ela|dele|dela|homem|mulher|sujeito|suspeito|suspeita|testemunha)\b/.test(normalized)) return focusNpc;
  return undefined;
}

function findItem(text: string, ledger: LedgerData, start: OfflineStart): string | undefined {
  const normalized = normalizeText(text);
  const items = [...(ledger.items || []).map((i) => i.name), start.object];
  const exact = items.find((name) => {
    const tokens = normalizeText(name).split(" ").filter((t) => t.length > 4);
    return tokens.some((t) => normalized.includes(t));
  });
  if (exact) return exact;

  const focusItem = ledger.offlineState?.focusItem;
  if (focusItem && /\b(isso|isto|aquilo|objeto|item|documento|papel|carta|chave|coisa)\b/.test(normalized)) return focusItem;
  return undefined;
}

export function interpretOfflineAction(action: string, ledger: LedgerData, start: OfflineStart): ParsedAction {
  const normalized = normalizeText(action);
  const ranked = (Object.keys(INTENT_WORDS) as LocalIntent[])
    .map((intent) => {
      let score = 0;
      for (const phrase of INTENT_WORDS[intent]) {
        const p = normalizeText(phrase);
        if (p && containsPhrase(normalized, phrase)) score += p.includes(" ") ? 4 : 2;
      }
      for (const pattern of INTENT_PATTERNS[intent] || []) {
        if (pattern.test(normalized)) score += 3;
      }
      return { intent, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // Heurísticas leves para linguagem natural que não depende de comandos fechados.
  if ((action.includes("?") || /\b(digo|respondo|falo|conto)\b/i.test(action)) && !ranked.some((r) => r.intent === "question")) {
    ranked.push({ intent: "question", score: action.includes("?") ? 3 : 1 });
    ranked.sort((a, b) => b.score - a.score);
  }

  const primary = ranked[0]?.intent || "improvise";
  const secondary = ranked.find((r) => r.intent !== primary)?.intent;
  const clauses = action.split(/(?:,|;|\be depois\b|\bdepois\b|\benquanto\b|\bmas\b|\bentao\b)/i).map((c) => c.trim()).filter(Boolean);
  const specificity = Math.min(5, Math.max(1, Math.ceil(normalized.split(" ").length / 8) + (findTarget(action, ledger, start) ? 1 : 0) + (findItem(action, ledger, start) ? 1 : 0)));
  const quoted = action.match(/[“"]([^”"]{3,180})[”"]/);
  const speechAfterColon = action.match(/(?:digo|pergunto|respondo|falo|conto)[^:]{0,50}:\s*(.{3,180})$/i);
  const directSpeech = (quoted?.[1] || speechAfterColon?.[1] || "").trim() || undefined;
  const speechNorm = normalizeText(directSpeech || "");
  const inferredPromise = /\b(?:promet|jur|garant)[a-z0-9'-]*\b/.test(normalized) ||
    /\bme comprometo\b/.test(normalized) ||
    /\bpode confiar\b/.test(speechNorm) ||
    /\b(?:nao )?vou\s+(?:te\s+|lhe\s+)?(?:entreg|denunci|abandon|trair|revel|contar|machuc|deix|proteg|ajud)[a-z0-9'-]*\b/.test(speechNorm);

  return {
    raw: action,
    normalized,
    intents: ranked,
    primary,
    secondary,
    attribute: ATTRIBUTE_BY_INTENT[primary],
    target: findTarget(action, ledger, start),
    item: findItem(action, ledger, start),
    cautious: /cuidado|cautela|devagar|distancia|sem chamar atencao|discret/i.test(normalized),
    aggressive: /forca|agress|ameac|arma|soco|bato|ataco|quebro|derrubo/i.test(normalized),
    empathetic: /ajudo|acalmo|protejo|confio|gentil|por favor|socorro|salvo/i.test(normalized),
    deceptive: /minto|finjo|blef|engano|disfarc|invento/i.test(normalized),
    promise: inferredPromise || /prometo|juro|dou minha palavra|me comprometo/i.test(normalized),
    directSpeech,
    clauses,
    specificity,
  };
}

function normalizeCampaignSeed(value?: string): string {
  const normalized = (value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 32);
  return normalized || "LOEN-DEFAULT";
}

function originSeedSignature(origin: GameOrigin): string {
  const attrs = origin.attributes || { vigor: 1, destreza: 1, intelecto: 1, percepcao: 1, carisma: 1 };
  return [
    normalizeCampaignSeed(origin.campaignSeed),
    origin.originType || "Pessoa Normal de Loen",
    attrs.vigor,
    attrs.destreza,
    attrs.intelecto,
    attrs.percepcao,
    attrs.carisma,
  ].join("|");
}

function baseState(origin: GameOrigin, start: OfflineStart): OfflineGameState {
  const campaignSeed = normalizeCampaignSeed(origin.campaignSeed);
  const seed = hashString(`${originSeedSignature(origin)}|engine-v3`);
  return {
    engineVersion: 3,
    startId: start.id,
    turn: 0,
    phase: 0,
    seed,
    campaignSeed,
    pressure: 12,
    evidence: 0,
    trust: 0,
    occultExposure: 0,
    violence: 0,
    deception: 0,
    mercy: 0,
    lawfulness: 0,
    curiosity: 1,
    route: "investigação",
    flags: [],
    visitedLocations: [start.location],
    npcTrust: {},
    playerCommitments: [],
    eventHistory: [],
    lastEventTurn: 0,
    npcAgendas: initializeNpcAgendas(start, seed),
  };
}

function getStart(state?: OfflineGameState): OfflineStart {
  return STARTS.find((s) => s.id === state?.startId) || STARTS[0];
}

function selectStart(origin: GameOrigin): OfflineStart {
  // O nome do jogador não entra na seleção: mesma seed + mesma ficha = mesmo mundo inicial.
  const seed = hashString(`${originSeedSignature(origin)}|start-v3`);
  return choose(STARTS, seed);
}

function upgradeOfflineState(origin: GameOrigin, previous: any, start: OfflineStart): OfflineGameState {
  if (!previous) return baseState(origin, start);
  const campaignSeed = normalizeCampaignSeed(previous.campaignSeed || origin.campaignSeed || `LEGACY-${Number(previous.seed || 0).toString(36)}`);
  const seed = Number.isFinite(previous.seed) ? previous.seed : hashString(`${campaignSeed}|legacy-upgrade`);
  return {
    ...previous,
    engineVersion: 3,
    startId: previous.startId || start.id,
    turn: previous.turn || 0,
    phase: previous.phase || 0,
    seed,
    campaignSeed,
    flags: [...(previous.flags || [])],
    visitedLocations: [...(previous.visitedLocations || [start.location])],
    npcTrust: { ...(previous.npcTrust || {}) },
    playerCommitments: [...(previous.playerCommitments || [])],
    eventHistory: [...(previous.eventHistory || [])],
    lastEventTurn: previous.lastEventTurn || 0,
    npcAgendas: previous.npcAgendas && Object.keys(previous.npcAgendas).length > 0
      ? JSON.parse(JSON.stringify(previous.npcAgendas))
      : initializeNpcAgendas(start, seed),
  };
}

function formatTurn(scene: string, dialogue: string, status: string, dilemma: string): string {
  return `[CENA]\n${scene}\n\n[DIÁLOGO]\n${dialogue}\n\n[STATUS DO MUNDO]\n${status}\n\n${dilemma}`;
}

function localOptions(start: OfflineStart, state: OfflineGameState): string[] {
  const pools = [
    [
      `[PERCEPÇÃO] Examinar ${start.clue} sem tocar em nada.`,
      `[CARISMA] Conversar com ${start.npc.name} e testar as contradições do relato.`,
      `[INTELECTO] Analisar ${start.object} e procurar uma conexão prática com o ocorrido.`,
      `[DESTREZA] Manter distância e seguir discretamente quem tentar sair da cena.`,
    ],
    [
      `[INTELECTO] Cruzar as pistas e reconstruir a sequência real dos acontecimentos.`,
      `[CARISMA] Ganhar a confiança de ${start.secondNpc.name} antes que outra pessoa intervenha.`,
      `[PERCEPÇÃO] Vigiar o acesso a ${start.nextLocation} e esperar alguém revelar a rota.`,
      `[DESTREZA] Entrar em ${start.nextLocation} sem anunciar minha presença.`,
    ],
    [
      `[CARISMA] Confrontar o suspeito com uma parte das provas e ocultar o restante.`,
      `[PERCEPÇÃO] Procurar a peça que ainda não combina com a versão dominante.`,
      `[VIGOR] Proteger a testemunha e impedir que a retirem à força.`,
      `[INTELECTO] Preparar uma armadilha lógica usando horários, registros e objetos já encontrados.`,
    ],
    [
      `[CARISMA] Levar o dossiê às autoridades e exigir uma resposta formal.`,
      `[DESTREZA] Seguir a trilha final sozinho antes que ela esfrie.`,
      `[INTELECTO] Desmontar a operação pela documentação, sem confronto direto.`,
      `[PERCEPÇÃO] Observar mais uma noite e descobrir quem aparece quando todos acreditam que o caso acabou.`,
    ],
  ];
  const pool = pools[Math.min(state.phase, pools.length - 1)];
  // A interface e as regras originais trabalham com exatamente 3 sugestões por turno.
  // Mantemos uma quarta alternativa no pool para variar partidas, mas o jogador sempre recebe 3.
  const omitIndex = Math.floor(seeded01(state.seed + state.turn * 43 + state.phase * 101) * pool.length) % pool.length;
  return pool.filter((_option, index) => index !== omitIndex).slice(0, 3);
}

function dilemmaText(options: string[]): string {
  return `O próximo movimento pode mudar quem controla a investigação.\n\n${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}`;
}

export function startOfflineChronicle(origin: GameOrigin, initialLedger: LedgerData): OfflineTurnResult {
  const start = selectStart(origin);
  const state = baseState(origin, start);
  const npc: NPCRecord = {
    name: start.npc.name,
    role: start.npc.role,
    attitude: start.npc.attitude,
    conversationMemory: ["Estava presente ou diretamente ligado ao primeiro incidente da crônica."],
    notes: `Pessoa de interesse no caso: ${start.title}.`,
    lastLocationMet: start.location,
  };

  const ledger: LedgerData = {
    ...initialLedger,
    location: start.location,
    timeAndWeather: start.time,
    npcs: [npc],
    clues: [start.clue],
    mysteries: [start.hook, start.secret],
    items: [
      {
        id: `offline-start-${start.id}`,
        name: start.object,
        description: `Objeto central do incidente inicial: ${start.object}.`,
        category: "Outro",
        quantity: 1,
        acquiredAt: "Prólogo",
      },
    ],
    offlineState: state,
  };

  const options = localOptions(start, state);
  const text = formatTurn(
    `Eu sou ${origin.playerName || "um desconhecido"}, ${start.role}. ${start.hook.charAt(0).toUpperCase()}${start.hook.slice(1)}. Tenho comigo ${start.object}. Antes que eu consiga organizar os pensamentos, noto que ${start.threat}.\n\nNão há explicação confortável. Ainda sou uma pessoa comum; tudo o que tenho são meus sentidos, minha experiência e a decisão de não ignorar o detalhe errado.`,
    `— Não devia estar olhando para isso — diz ${start.npc.name}, ${start.npc.role}. A voz tenta soar firme, mas não combina com ${start.npc.attitude}. — Se quiser sair daqui inteiro, esqueça o que viu.`,
    `${start.location} | ${start.time} | Seed: ${state.campaignSeed} | Pressão: baixa, atenção indesejada começando a crescer`,
    dilemmaText(options)
  );

  return { text, ledger, mood: "mystery", suggestedActions: options };
}

function cloneLedger(ledger: LedgerData): LedgerData {
  return JSON.parse(JSON.stringify(ledger));
}

function upsertNpc(ledger: LedgerData, npc: NPCRecord) {
  const idx = (ledger.npcs || []).findIndex((n) => normalizeText(n.name) === normalizeText(npc.name));
  if (idx >= 0) {
    const old = ledger.npcs[idx];
    ledger.npcs[idx] = {
      ...old,
      ...npc,
      conversationMemory: unique([...(old.conversationMemory || []), ...(npc.conversationMemory || [])]),
    };
  } else {
    ledger.npcs = [...(ledger.npcs || []), npc];
  }
}

function sanityStatus(value: number): LedgerData["sanityStatus"] {
  if (value >= 75) return "Lúcido";
  if (value >= 50) return "Alerta";
  if (value >= 25) return "Perturbado";
  return "À Beira da Mutação";
}

function applyWorldEventResult(state: OfflineGameState, ledger: LedgerData, result: OfflineEventResult, reason: string) {
  state.pressure = Math.max(0, Math.min(100, state.pressure + (result.pressureDelta || 0)));
  state.evidence = Math.max(0, state.evidence + (result.evidenceDelta || 0));
  state.trust = Math.max(-10, Math.min(10, state.trust + (result.trustDelta || 0)));
  state.lawfulness += result.lawfulnessDelta || 0;
  state.occultExposure = Math.max(0, state.occultExposure + (result.occultDelta || 0));

  if (result.clue) ledger.clues = unique([...(ledger.clues || []), result.clue]);
  if (result.mystery) ledger.mysteries = unique([...(ledger.mysteries || []), result.mystery]);
  if (result.secret) ledger.secretsDiscovered = unique([...(ledger.secretsDiscovered || []), result.secret]);
  if (result.sanityDelta) {
    ledger.sanity = Math.max(0, Math.min(100, (ledger.sanity ?? 100) + result.sanityDelta));
    ledger.sanityStatus = sanityStatus(ledger.sanity);
    ledger.sanityHistory = [
      ...(ledger.sanityHistory || []),
      { reason, delta: result.sanityDelta, timestamp: Date.now() },
    ];
  }
}

function maybeIntermediateEvent(start: OfflineStart, state: OfflineGameState, ledger: LedgerData): OfflineEventResult | undefined {
  if (state.turn < 2 || state.turn - state.lastEventTurn < 2) return undefined;
  const elapsed = state.turn - state.lastEventTurn;
  const triggerChance = elapsed >= 3 ? 1 : 0.72;
  const triggerRoll = seeded01(hashString(`${state.seed}|event-trigger|${state.turn}|${state.route}|${state.evidence}|${state.pressure}`));
  if (triggerRoll > triggerChance) return undefined;

  const candidates = INTERMEDIATE_EVENTS.filter((event) => {
    if (state.eventHistory.includes(event.id)) return false;
    if (event.minTurn !== undefined && state.turn < event.minTurn) return false;
    if (event.maxTurn !== undefined && state.turn > event.maxTurn) return false;
    if (event.minPhase !== undefined && state.phase < event.minPhase) return false;
    if (event.maxPhase !== undefined && state.phase > event.maxPhase) return false;
    if (event.condition && !event.condition(state, ledger)) return false;
    return true;
  });
  if (candidates.length === 0) return undefined;

  const event = choose(candidates, hashString(`${state.seed}|event-pick|${state.turn}|${state.eventHistory.join(",")}`));
  const result = event.run(start, state, ledger);
  state.eventHistory = [...state.eventHistory, event.id];
  state.lastEventTurn = state.turn;
  applyWorldEventResult(state, ledger, result, `Evento intermediário: ${event.id}.`);
  return result;
}

function agendaOutcome(agenda: OfflineNpcAgenda, start: OfflineStart, state: OfflineGameState, targeted: boolean): OfflineEventResult {
  const targetReaction = targeted
    ? "Minha interferência obriga o personagem a antecipar o próximo passo."
    : "Como eu não o pressionei diretamente, ele teve espaço para agir por conta própria.";
  const exposedNow = agenda.progress >= 3 && !agenda.exposed;
  if (exposedNow) agenda.exposed = true;
  const resolvedNow = agenda.progress >= 5;
  if (resolvedNow) agenda.resolved = true;

  let result: OfflineEventResult;
  switch (agenda.goal) {
    case "conceal-evidence":
      result = {
        text: `${agenda.npcName} se move antes de mim: um registro muda de lugar, uma gaveta aparece limpa demais e uma pessoa recebe instrução para não lembrar de um horário. ${targetReaction}`,
        dialogue: targeted ? `— Está confundindo cautela com culpa — diz ${agenda.npcName}, sem explicar por que já sabia qual prova eu procuraria.` : undefined,
        pressureDelta: 3 + agenda.urgency,
        clue: exposedNow ? `${agenda.npcName} tentou apagar rastros específicos do caso, revelando que sabia quais provas eram perigosas` : undefined,
        evidenceDelta: exposedNow ? 1 : 0,
        mood: "tension",
      };
      break;
    case "recover-object":
      result = {
        text: `${agenda.npcName} pergunta por ${start.object} através de terceiros e testa caminhos para recuperá-lo sem pedir diretamente. ${targetReaction}`,
        dialogue: targeted ? `— Esse objeto não pertence a você — ${agenda.npcName} diz, rápido demais para fingir desinteresse.` : undefined,
        pressureDelta: 2 + agenda.urgency,
        clue: exposedNow ? `${agenda.npcName} demonstra interesse persistente em recuperar ${start.object}` : undefined,
        evidenceDelta: exposedNow ? 1 : 0,
      };
      break;
    case "sell-information":
      result = {
        text: `${agenda.npcName} começa a negociar versões diferentes da mesma história com pessoas diferentes. O objetivo não parece ser silêncio; parece ser descobrir quem paga mais pela informação. ${targetReaction}`,
        dialogue: targeted ? `— Informação só é perigosa quando alguém finge que ela não tem preço.` : undefined,
        pressureDelta: 2,
        clue: exposedNow ? `${agenda.npcName} está oferecendo partes da investigação a compradores diferentes` : undefined,
        evidenceDelta: exposedNow ? 1 : 0,
      };
      break;
    case "seek-protection":
      result = {
        text: `${agenda.npcName} troca rotas, evita ficar sozinho e procura alguém que possa servir de escudo. Isso muda o comportamento de quem o observa. ${targetReaction}`,
        dialogue: targeted ? `— Eu falo, mas não se me deixar sozinho depois.` : undefined,
        trustDelta: targeted ? 1 : 0,
        clue: exposedNow ? `${agenda.npcName} acredita estar em risco por causa do que sabe` : undefined,
        mood: "mystery",
      };
      break;
    case "flee-town":
      result = {
        text: `${agenda.npcName} converte dinheiro em algo portátil, pergunta horários de trem e para de voltar aos lugares de costume. ${targetReaction}`,
        dialogue: targeted ? `— Às vezes a única resposta inteligente é estar em outra cidade antes do amanhecer.` : undefined,
        pressureDelta: 2,
        clue: exposedNow ? `${agenda.npcName} preparou uma rota de fuga e uma passagem sem data de retorno` : undefined,
        evidenceDelta: exposedNow ? 1 : 0,
      };
      break;
    case "test-player":
      result = {
        text: `${agenda.npcName} deixa uma informação parcialmente verdadeira ao meu alcance e observa não a pista, mas o que eu faço com ela. ${targetReaction}`,
        dialogue: targeted ? `— Eu precisava saber se você corre atrás de qualquer coisa que brilhe.` : undefined,
        pressureDelta: targeted ? 1 : 2,
        clue: exposedNow ? `${agenda.npcName} plantou informação incompleta para medir minhas reações` : undefined,
        evidenceDelta: exposedNow ? 1 : 0,
      };
      break;
    case "alert-network":
      result = {
        text: `${agenda.npcName} envia um aviso por uma rota indireta. Pouco depois, pessoas que eu ainda não conhecia começam a agir como se soubessem meu nome e o alcance das minhas pistas. ${targetReaction}`,
        pressureDelta: 5 + agenda.urgency,
        clue: exposedNow ? `${agenda.npcName} mantém um canal para avisar uma rede maior sobre o avanço da investigação` : undefined,
        mood: "tension",
      };
      break;
    case "seek-authorities":
      result = {
        text: `${agenda.npcName} cria registro, testemunha e horário verificável para tudo que faz. Não é confiança na lei; é a tentativa de tornar um desaparecimento mais caro. ${targetReaction}`,
        dialogue: targeted ? `— Se meu nome entrar em três livros diferentes, alguém vai precisar explicar se eu sumir.` : undefined,
        lawfulnessDelta: 1,
        trustDelta: targeted ? 1 : 0,
        clue: exposedNow ? `${agenda.npcName} vem documentando os próprios passos por medo de ser silenciado` : undefined,
      };
      break;
    case "frame-player":
      result = {
        text: `${agenda.npcName} espalha uma versão em que minhas perguntas precedem problemas que, na verdade, já estavam em curso. É uma inversão pequena, repetida até parecer causalidade. ${targetReaction}`,
        pressureDelta: 5,
        trustDelta: -1,
        clue: exposedNow ? `${agenda.npcName} está construindo uma narrativa para me associar aos incidentes que investigo` : undefined,
        mood: "tension",
      };
      break;
    case "investigate-alone":
    default:
      result = {
        text: `${agenda.npcName} segue uma linha de investigação sem me avisar e volta com informação que não poderia ter obtido ficando parado. ${targetReaction}`,
        dialogue: targeted ? `— Você não é a única pessoa capaz de fazer perguntas.` : undefined,
        evidenceDelta: targeted || exposedNow ? 1 : 0,
        clue: exposedNow ? `${agenda.npcName} investigou por conta própria uma conexão com ${start.nextLocation}` : undefined,
        mood: exposedNow ? "discovery" : "mystery",
      };
      break;
  }

  if (resolvedNow) {
    result.text += ` A agenda chega a um ponto de ruptura: agora ela produz uma consequência que não pode mais ser tratada como simples intenção.`;
    result.pressureDelta = (result.pressureDelta || 0) + 2;
  }
  return result;
}

function advanceNpcAgendas(start: OfflineStart, state: OfflineGameState, ledger: LedgerData, parsed: ParsedAction): OfflineEventResult | undefined {
  const agendas = Object.values(state.npcAgendas || {}).filter((agenda) => !agenda.resolved);
  const visibleAgendas = agendas.filter((agenda) => {
    if (normalizeText(agenda.npcName) === normalizeText(start.secondNpc.name) && state.phase === 0) return false;
    return state.turn >= agenda.nextActionTurn;
  });
  if (visibleAgendas.length === 0) return undefined;

  const agenda = choose(visibleAgendas, hashString(`${state.seed}|agenda|${state.turn}|${state.route}`));
  const targeted = parsed.target ? normalizeText(parsed.target) === normalizeText(agenda.npcName) : false;
  const interferenceBonus = targeted && ["question", "persuade", "threaten", "follow", "protect"].includes(parsed.primary) ? 1 : 0;
  agenda.progress += 1 + interferenceBonus;
  agenda.nextActionTurn = state.turn + 2 + Math.floor(seeded01(hashString(`${state.seed}|${agenda.npcName}|next|${state.turn}`)) * 3);

  const result = agendaOutcome(agenda, start, state, targeted);
  const summary = `Turno ${state.turn}: agenda “${agendaLabel(agenda.goal)}” avançou para ${agenda.progress}/5${targeted ? " após interferência direta do jogador" : " enquanto o jogador estava focado em outra coisa"}.`;
  agenda.history = [...agenda.history, summary].slice(-8);
  state.npcAgendas[normalizeText(agenda.npcName)] = agenda;

  upsertNpc(ledger, {
    name: agenda.npcName,
    role: agenda.role,
    notes: agenda.exposed ? `Objetivo percebido: ${agendaLabel(agenda.goal)}.` : undefined,
    conversationMemory: [summary],
    lastLocationMet: ledger.location,
  });
  applyWorldEventResult(state, ledger, result, `Ação autônoma de ${agenda.npcName}.`);
  return result;
}

function resolveAction(parsed: ParsedAction, origin: GameOrigin, state: OfflineGameState): { success: "strong" | "success" | "mixed" | "fail"; roll: number; difficulty: number } {
  const attr = origin.attributes?.[parsed.attribute] ?? 2;
  const riskByIntent: Partial<Record<LocalIntent, number>> = {
    fight: 4,
    threaten: 3,
    steal: 4,
    follow: 3,
    hide: 3,
    flee: 3,
    occult: 5,
    investigate: 2,
    observe: 1,
    question: 2,
    persuade: 2,
    deceive: 3,
    protect: 3,
    read: 2,
    "use-item": 2,
    travel: 1,
    wait: 1,
    report: 2,
    improvise: 3,
  };
  let difficulty = (riskByIntent[parsed.primary] || 2) + Math.floor(state.pressure / 30) + Math.max(0, parsed.clauses.length - 2);
  if (parsed.cautious) difficulty -= 1;
  if (parsed.specificity >= 4) difficulty -= 1;
  difficulty = Math.max(1, Math.min(9, difficulty));
  const roll = 1 + Math.floor(seeded01(hashString(`${state.seed}|${state.turn}|${parsed.normalized}`)) * 6);
  const total = roll + attr + Math.floor(parsed.specificity / 2);
  if (total >= difficulty + 5) return { success: "strong", roll, difficulty };
  if (total >= difficulty + 2) return { success: "success", roll, difficulty };
  if (total >= difficulty) return { success: "mixed", roll, difficulty };
  return { success: "fail", roll, difficulty };
}

function applyIntentState(state: OfflineGameState, p: ParsedAction, outcome: ReturnType<typeof resolveAction>) {
  state.turn += 1;
  const intents = [p.primary, ...(p.secondary ? [p.secondary] : [])];
  const hasIntent = (...wanted: LocalIntent[]) => intents.some((intent) => wanted.includes(intent));

  // Ações compostas não são tratadas como mero "flavor": a intenção secundária também altera o estado,
  // ainda que com peso menor, evitando que "finjo que vou embora e sigo o suspeito" vire apenas uma mentira.
  if (hasIntent("observe", "investigate", "read", "follow")) state.curiosity += 1;
  if (hasIntent("fight", "threaten")) state.violence += p.aggressive ? 2 : 1;
  if (hasIntent("deceive", "steal", "hide") || p.deceptive) state.deception += 1;
  if (p.empathetic || hasIntent("protect")) state.mercy += 1;
  if (hasIntent("report")) state.lawfulness += 2;
  if (hasIntent("steal", "fight")) state.lawfulness -= 1;

  if (hasIntent("report")) state.route = "institucional";
  else if (hasIntent("fight", "threaten")) state.route = "confronto";
  else if (hasIntent("hide", "follow", "steal", "deceive")) state.route = "clandestina";
  else if (hasIntent("protect", "persuade", "question")) state.route = "alianças";
  else if (hasIntent("flee")) state.route = "fuga";
  else if (hasIntent("investigate", "observe", "read", "occult")) state.route = "mistério";

  state.pressure += outcome.success === "fail" ? 10 : outcome.success === "mixed" ? 5 : -1;
  if (hasIntent("flee")) state.pressure += outcome.success === "fail" ? 4 : -6;
  if (p.aggressive) state.pressure += 4;
  if (p.cautious) state.pressure -= 2;
  if (p.secondary && ["fight", "threaten", "steal"].includes(p.secondary)) state.pressure += 2;

  if (hasIntent("investigate", "observe", "read", "question", "follow") && outcome.success !== "fail") {
    state.evidence += outcome.success === "strong" ? 2 : 1;
  }
  if (hasIntent("persuade", "question", "protect")) {
    state.trust += outcome.success === "fail" ? -1 : (p.empathetic ? 2 : 1);
  }
  if (hasIntent("threaten", "fight", "steal")) state.trust -= 1;
  if (p.promise) state.trust += outcome.success === "fail" ? 0 : 1;
  if (hasIntent("occult")) state.occultExposure += 2;

  state.pressure = Math.max(0, Math.min(100, state.pressure));
  state.trust = Math.max(-10, Math.min(10, state.trust));
  state.phase = Math.min(3, Math.floor(state.turn / 4));
}

function actionConsequenceText(p: ParsedAction, result: ReturnType<typeof resolveAction>, start: OfflineStart, state: OfflineGameState): { scene: string; dialogue: string; sanityDelta: number; newClue?: string; secret?: string; location?: string; mood: AudioMood } {
  const outcomeLead = {
    strong: "Minha abordagem funciona melhor do que eu esperava.",
    success: "A decisão produz resultado.",
    mixed: "Consigo avançar, mas pago por isso com uma nova complicação.",
    fail: "A ideia faz sentido; a execução, não. Algo reage antes que eu consiga controlar a situação.",
  }[result.success];

  const target = p.target || (state.phase >= 1 ? start.secondNpc.name : start.npc.name);
  let detail = "";
  let dialogue = "";
  let clue: string | undefined;
  let secret: string | undefined;
  let location: string | undefined;
  let sanityDelta = 0;
  let mood: AudioMood = result.success === "fail" ? "tension" : "mystery";

  switch (p.primary) {
    case "observe":
    case "investigate":
      clue = state.evidence <= 3 ? start.clue : state.evidence <= 6 ? `uma ligação prática entre ${start.object} e ${start.nextLocation}` : `um registro que confirma que ${start.secret}`;
      detail = `Em vez de procurar por algo extraordinário, sigo o que é verificável. Um detalhe se destaca: ${clue}. Quanto mais comparo posição, horário e comportamento, menos o incidente parece acidental.`;
      dialogue = `— Você percebeu isso também? — ${target} baixa a voz. — Então já estamos metidos nisso mais fundo do que eu queria.`;
      mood = result.success === "strong" ? "discovery" : "mystery";
      break;
    case "question":
    case "persuade":
      secret = result.success === "fail" ? undefined : state.trust >= 3 ? start.secret : `alguém esteve em ${start.nextLocation} antes do incidente`;
      detail = result.success === "fail"
        ? `${target} fecha o rosto e percebe que minhas perguntas têm direção. Não obtenho a resposta, mas a reação confirma que toquei no ponto certo.`
        : `${target} hesita, mede a porta e finalmente abandona parte da cautela. ${secret ? `A informação que escapa é simples e perigosa: ${secret}.` : "A versão contada tem uma contradição clara de horário."}`;
      dialogue = result.success === "fail" ? `— Chega de perguntas. Se continuar, vou chamar alguém que sabe fazê-lo parar.` : `— Eu não devia contar isso... mas você precisa entender que não começou hoje.`;
      break;
    case "deceive":
      detail = result.success === "fail"
        ? `A mentira encontra resistência num detalhe que eu não conhecia. ${target} não me desmente imediatamente; pior, começa a me testar.`
        : `Monto a versão com detalhes suficientes para parecer espontânea. ${target} relaxa apenas um pouco, mas é o bastante para me dar acesso a uma informação que não daria a um estranho.`;
      clue = result.success === "fail" ? undefined : `um horário e uma rota que ${target} acreditava que eu já conhecia`;
      dialogue = result.success === "strong" ? `— Então mandaram você? Certo. Não temos muito tempo.` : `— Essa história é estranha... mas hoje tudo está estranho.`;
      break;
    case "threaten":
      detail = result.success === "fail" ? `A ameaça sai mais alta do que deveria. Uma porta se abre ao fundo e agora há mais olhos sobre mim.` : `A pressão quebra a resistência de ${target}, mas também transforma medo em ressentimento. Consigo uma resposta rápida, não lealdade.`;
      clue = result.success === "fail" ? undefined : `o nome de quem ordenou que ninguém entrasse em ${start.nextLocation}`;
      dialogue = `— Está bem. Eu falo. Mas quando isso voltar para você, não diga que não avisei.`;
      mood = "tension";
      break;
    case "follow":
    case "hide":
      location = result.success === "fail" ? undefined : start.nextLocation;
      detail = result.success === "fail" ? `Tento desaparecer no ritmo da rua, mas piso onde não devia. A pessoa à frente muda o passo. Fui percebido.` : `Mantenho distância e uso vitrines, carruagens e esquinas como cobertura. O trajeto termina em ${start.nextLocation}, um lugar que agora faz a pista inicial parecer menos isolada.`;
      clue = result.success === "strong" ? `uma segunda pessoa encontra o alvo em ${start.nextLocation}` : undefined;
      dialogue = result.success === "fail" ? `— Você é ruim nisso — alguém diz sem se virar. — Volte para casa.` : `Nenhuma palavra é dirigida a mim; apenas escuto uma senha curta sendo dita na entrada.`;
      mood = "tension";
      break;
    case "flee":
      detail = result.success === "fail"
        ? `Tento romper o contato, mas escolho a saída errada. O caminho estreita, passos aceleram atrás de mim e a fuga vira perseguição.`
        : `Abandono a posição antes de ficar cercado. Não é covardia; é escolher onde a próxima cena acontece. Consigo distância suficiente para respirar e reorganizar as pistas sem entregar tudo o que sei.`;
      dialogue = result.success === "fail" ? `— Corra. Assim fica mais fácil saber para onde você vai.` : `Atrás de mim, ninguém grita. Isso é quase mais preocupante.`;
      mood = "tension";
      break;
    case "fight":
      detail = result.success === "fail" ? `Parto para o confronto e descubro tarde demais que força não é o mesmo que controle. Levo um golpe, perco posição e o barulho atrai atenção.` : `O confronto é curto e feio. Não há coreografia, apenas respiração, dor e móveis no caminho. Consigo abrir espaço, mas agora todos sabem que estou disposto a usar força.`;
      dialogue = result.success === "strong" ? `— Pare! Eu digo onde está! — o adversário cospe as palavras entre dentes.` : `— Você acabou de transformar isso em outra coisa.`;
      clue = result.success === "strong" ? `um bolso interno contém um endereço ligado a ${start.nextLocation}` : undefined;
      mood = "tension";
      break;
    case "protect":
      detail = result.success === "fail" ? `Tento tirar alguém da linha de perigo, mas calculo mal o tempo. Ainda assim, minha intenção fica clara e muda a forma como a testemunha me vê.` : `Entro entre a ameaça e a pessoa antes que alguém possa discutir. A escolha custa tempo, mas compra confiança — algo mais difícil de conseguir do que uma pista.`;
      dialogue = `— Por que fez isso? — ${target} pergunta, ainda sem recuperar o fôlego. — Você nem me conhece.`;
      mood = "tension";
      break;
    case "steal":
      detail = result.success === "fail" ? `Meus dedos chegam perto do objeto, mas outro olhar chega primeiro. Preciso recuar sem levar nada e agora minha presença parece muito menos inocente.` : `A oportunidade dura segundos. Quando termina, o objeto já mudou de bolso e ninguém reage de imediato.`;
      clue = result.success === "fail" ? undefined : `uma anotação privada menciona ${start.nextLocation}`;
      dialogue = result.success === "fail" ? `— Procurando alguma coisa?` : `Atrás de mim, a conversa continua como se nada tivesse acontecido.`;
      break;
    case "read":
      detail = result.success === "fail" ? `O texto resiste a uma leitura rápida. Símbolos, abreviações e referências cruzadas parecem projetados para induzir uma conclusão errada.` : `Eu trato o documento como documento, não como profecia. Repetições, datas e marcas físicas revelam uma estrutura que estava escondida à primeira leitura.`;
      clue = result.success === "fail" ? undefined : `a cifra aponta para ${start.nextLocation} e para um encontro marcado depois da meia-noite`;
      dialogue = `Uma frase marginal me incomoda mais que o restante: “o primeiro registro nunca é o verdadeiro”.`;
      mood = result.success === "strong" ? "discovery" : "mystery";
      break;
    case "use-item":
      detail = p.item ? `Uso ${p.item} como parte do plano, não como solução mágica. ${outcomeLead} O objeto produz uma reação concreta no ambiente e reduz as possibilidades.` : `Minha ação depende de um objeto que não consigo identificar com segurança. Improviso com o que tenho, mas o resultado é menos preciso.`;
      clue = result.success === "fail" ? undefined : `a reação de ${start.object} confirma que ele esteve em ${start.nextLocation}`;
      dialogue = `— Onde conseguiu isso? — ${target} pergunta rápido demais.`;
      break;
    case "travel":
      location = /entro|vou|sigo|desco|subo|retorno/.test(p.normalized) ? start.nextLocation : undefined;
      detail = `Eu me movo antes que a situação congele. ${location ? `Chego a ${location}.` : "Mudo de posição e obrigo os outros a reagir."} A mudança de cenário reorganiza quem pode me observar e quais saídas continuam disponíveis.`;
      dialogue = `O som dos meus passos muda de eco. Isso basta para saber que atravessei um limite que alguém preferia manter fechado.`;
      break;
    case "wait":
      detail = result.success === "fail" ? `Espero tempo demais. A cena esfria, uma oportunidade desaparece e alguém percebe que estou vigiando.` : `Não fazer nada por alguns minutos é, desta vez, uma ação. O ritmo das pessoas denuncia quem está esperando sinal de quem.`;
      clue = result.success === "fail" ? undefined : `um mensageiro surge e segue para ${start.nextLocation}`;
      dialogue = `Uma voz distante chama um nome que eu já vi nos registros.`;
      break;
    case "report":
      detail = result.success === "fail" ? `A autoridade ou instituição que procuro escuta o suficiente para registrar meu nome, mas não o suficiente para agir. Agora existe papelada me ligando ao incidente.` : `Apresento fatos, não teorias. A formalização cria uma barreira contra o desaparecimento silencioso do caso, embora também atraia gente interessada em controlar a investigação.`;
      clue = result.success === "strong" ? `um registro oficial anterior menciona o mesmo padrão do caso atual` : undefined;
      dialogue = `— A partir de agora, não mexa em nada sem nos avisar — diz a autoridade. O tom sugere que esse conselho também serve como aviso.`;
      break;
    case "occult":
      detail = `Minha ideia procura uma solução sobrenatural que eu, como humano mundano, não sei executar com segurança. Posso tentar repetir palavras ou gestos encontrados nas pistas, mas isso não me dá conhecimento real — apenas me expõe ao que quer que esteja por trás delas.`;
      dialogue = `Por um segundo, tenho a impressão de que o silêncio responde. Não com palavras; com a ausência repentina de todos os sons pequenos do lugar.`;
      sanityDelta = result.success === "fail" ? -10 : -5;
      state.occultExposure += 2;
      mood = "tension";
      break;
    default:
      detail = `Minha intenção não cabe numa categoria simples, então quebro o plano em partes: posição, alvo, risco e resultado esperado. ${outcomeLead} A reação do ambiente mostra qual parte da ideia realmente importava.`;
      clue = result.success === "fail" ? undefined : `um detalhe novo liga o incidente a ${start.nextLocation}`;
      dialogue = `— Isso não estava no plano — ${target} murmura.`;
  }

  let secondaryDetail = "";
  if (p.secondary && result.success !== "fail") {
    if (p.secondary === "follow" && !location) {
      location = start.nextLocation;
      secondaryDetail = ` Enquanto sustento a primeira ação, mantenho o alvo sob vigilância e descubro que o deslocamento converge para ${start.nextLocation}.`;
      if (!clue) clue = `o deslocamento observado leva discretamente até ${start.nextLocation}`;
    } else if (p.secondary === "hide") {
      secondaryDetail = " Faço isso sem me expor por completo, usando a própria movimentação da cena como cobertura.";
    } else if (p.secondary === "observe" || p.secondary === "investigate" || p.secondary === "read") {
      secondaryDetail = ` Ao mesmo tempo, separo um detalhe verificável da cena e o guardo como evidência, em vez de confiar apenas na impressão do momento.`;
    } else if (p.secondary === "protect") {
      secondaryDetail = " Mesmo avançando no plano, mantenho a testemunha fora da linha imediata de perigo.";
    } else if (p.secondary === "report") {
      secondaryDetail = " Também deixo um rastro institucional do que encontrei, dificultando que o caso desapareça sem registro.";
    } else if (p.secondary === "deceive") {
      secondaryDetail = " A informação que revelo é calculada: deixo uma versão incompleta circular para medir quem reage a ela.";
    }
  }

  if (result.success === "fail" && sanityDelta === 0 && state.occultExposure > 4) sanityDelta = -2;
  if (state.phase >= 2 && state.evidence >= 6 && !secret) secret = start.secret;

  const scene = `${outcomeLead} ${detail}${p.secondary ? ` Minha ação também carrega uma segunda intenção — ${intentLabel(p.secondary)} — e isso altera a reação das pessoas ao redor.` : ""}${secondaryDetail}`;
  return { scene, dialogue, sanityDelta, newClue: clue, secret, location, mood };
}

function intentLabel(intent: LocalIntent): string {
  const labels: Record<LocalIntent, string> = {
    observe: "observar",
    investigate: "investigar",
    question: "questionar",
    persuade: "persuadir",
    deceive: "enganar",
    threaten: "intimidar",
    follow: "seguir",
    hide: "agir furtivamente",
    flee: "escapar",
    fight: "lutar",
    protect: "proteger",
    steal: "subtrair algo",
    read: "decifrar",
    "use-item": "usar um objeto",
    travel: "mudar de posição",
    wait: "esperar",
    report: "envolver uma instituição",
    occult: "tentar tocar o oculto",
    improvise: "improvisar",
  };
  return labels[intent];
}

function phaseTransitionEvent(start: OfflineStart, previousPhase: number, state: OfflineGameState, ledger: LedgerData): { text: string; clue?: string } | undefined {
  if (state.phase <= previousPhase) return undefined;

  if (state.phase === 1) {
    upsertNpc(ledger, {
      name: start.secondNpc.name,
      role: start.secondNpc.role,
      attitude: "cauteloso e atento",
      conversationMemory: ["Entrou na investigação quando as pistas deixaram de parecer um incidente isolado."],
      lastLocationMet: ledger.location,
    });
    const clue = `${start.secondNpc.name} confirma que ${start.nextLocation} já apareceu em outro episódio suspeito.`;
    return {
      text: `A investigação muda de escala. ${start.secondNpc.name}, ${start.secondNpc.role}, entra no quadro e menciona ${start.nextLocation} sem que eu tenha dito esse nome primeiro. Pela primeira vez, tenho certeza de que o incidente inicial faz parte de algo maior.`,
      clue,
    };
  }

  if (state.phase === 2) {
    state.pressure = Math.min(100, state.pressure + 8);
    const clue = `Duas fontes independentes apontam para a mesma conclusão: ${start.secret}.`;
    ledger.secretsDiscovered = unique([...(ledger.secretsDiscovered || []), start.secret]);
    return {
      text: `As versões começam a convergir de uma maneira desconfortável. O que antes parecia superstição agora tem logística, horários e pessoas protegendo o mesmo segredo. A frase que eu evitava formular torna-se difícil de negar: ${start.secret}.`,
      clue,
    };
  }

  if (state.phase === 3) {
    state.pressure = Math.min(100, state.pressure + 12);
    const clue = `O ponto de convergência do caso é ${start.nextLocation}; quem controla esse lugar controla a saída da investigação.`;
    return {
      text: `Chego à fase em que continuar observando já é uma escolha. Os rastros convergem para ${start.nextLocation}. Pessoas que antes mentiam separadamente agora parecem obedecer à mesma urgência, e alguém começa a limpar as provas antes de mim. O próximo erro pode encerrar o caso — ou me transformar em parte dele.`,
      clue,
    };
  }

  return undefined;
}

function maybeEnding(origin: GameOrigin, state: OfflineGameState, ledger: LedgerData): OfflineEnding | undefined {
  const forced = ENDINGS.find((e) => ["broken-mind", "vanished"].includes(e.id) && e.condition(state, ledger));
  if (forced) return forced;
  if (state.turn < 14) return undefined;
  const candidates = ENDINGS.filter((e) => e.id !== "open-door" && e.condition(state, ledger));
  if (candidates.length > 0 && (state.turn >= 18 || state.evidence >= 9 || state.pressure >= 88)) {
    return candidates[Math.floor(seeded01(state.seed + state.turn * 97) * candidates.length) % candidates.length];
  }
  if (state.turn >= 26) return ENDINGS.find((e) => e.id === "open-door");
  return undefined;
}

function endingTurn(origin: GameOrigin, state: OfflineGameState, ledger: LedgerData, end: OfflineEnding): OfflineTurnResult {
  state.endingId = end.id;
  const finalText = formatTurn(
    `${end.epilogue(origin, state, ledger)}\n\nQuando penso no primeiro detalhe que me trouxe até aqui, ele parece pequeno demais para ter mudado tanta coisa. Ainda assim, foi exatamente assim que começou.`,
    `“Toda investigação termina duas vezes: quando encontramos uma resposta e quando decidimos o que fazer com ela.”`,
    `${ledger.location} | Epílogo | Seed: ${state.campaignSeed} | Fim alcançado: ${end.title}`,
    `FIM — ${end.title}\n\nEsta crônica chegou a um dos ${ENDINGS.length} desfechos do Motor Local. Uma nova partida pode começar por outro dos ${STARTS.length} prólogos e seguir uma combinação diferente de consequências.`
  );
  ledger.offlineState = state;
  return { text: finalText, ledger, mood: "discovery", suggestedActions: [], ending: end };
}

export function runOfflineTurn(action: string, origin: GameOrigin, currentLedger: LedgerData): OfflineTurnResult {
  const ledger = cloneLedger(currentLedger);
  const rawPreviousState = ledger.offlineState as any;
  const fallbackStart = getStart(rawPreviousState);
  const state = upgradeOfflineState(origin, rawPreviousState, fallbackStart);
  const start = getStart(state);
  const parsed = interpretOfflineAction(action, ledger, start);
  const result = resolveAction(parsed, origin, state);
  const previousPhase = state.phase;
  applyIntentState(state, parsed, result);
  if (parsed.target) state.focusNpc = parsed.target;
  if (parsed.item) state.focusItem = parsed.item;
  state.lastIntents = [parsed.primary, ...(parsed.secondary ? [parsed.secondary] : [])];
  const consequence = actionConsequenceText(parsed, result, start, state);

  if (consequence.location) {
    ledger.location = consequence.location;
    state.visitedLocations = unique([...state.visitedLocations, consequence.location]);
  }
  const minute = (state.turn * 17) % 60;
  const hour = (parseInt(start.time.slice(0, 2), 10) + Math.floor(state.turn / 3)) % 24;
  const clock = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  if (hour < 5) {
    ledger.timeAndWeather = `${clock}, madrugada; Lua Carmesim filtrada pela névoa, lampiões a gás e ruas úmidas`;
  } else if (hour < 7) {
    ledger.timeAndWeather = `${clock}, amanhecer; claridade cinzenta, névoa baixa e lampiões se apagando`;
  } else if (hour < 12) {
    ledger.timeAndWeather = `${clock}, manhã; luz fria sobre fumaça de carvão e atividade industrial crescente`;
  } else if (hour < 18) {
    ledger.timeAndWeather = `${clock}, tarde; luz industrial difusa, fuligem suspensa e névoa entre os telhados`;
  } else if (hour < 20) {
    ledger.timeAndWeather = `${clock}, crepúsculo; o céu perde a cor enquanto os lampiões voltam a acender`;
  } else {
    ledger.timeAndWeather = `${clock}, noite; Lua Carmesim acima da névoa, sombras longas e luz de gás nas ruas`;
  }

  if (consequence.newClue) ledger.clues = unique([...(ledger.clues || []), consequence.newClue]);
  if (consequence.secret) ledger.secretsDiscovered = unique([...(ledger.secretsDiscovered || []), consequence.secret]);
  if (consequence.secret) ledger.resolvedMysteries = unique([...(ledger.resolvedMysteries || []), start.secret]);

  if (parsed.deceptive || parsed.primary === "deceive" || parsed.promise) {
    ledger.playerLies = unique([
      ...(ledger.playerLies || []),
      `Turno ${state.turn}: ${parsed.promise ? "Compromisso/declaração" : "Mentira/dissimulação"} — ${parsed.directSpeech || action}`,
    ]);
  }
  if (parsed.promise) {
    state.playerCommitments = unique([...state.playerCommitments, parsed.directSpeech || action]);
  }

  const npcName = parsed.target || (state.phase >= 1 ? start.secondNpc.name : start.npc.name);
  const npcRole = npcName === start.secondNpc.name ? start.secondNpc.role : start.npc.role;
  const npcKey = normalizeText(npcName);
  let npcDelta = 0;
  if (["persuade", "question", "protect"].includes(parsed.primary)) npcDelta += result.success === "fail" ? -1 : (parsed.empathetic ? 2 : 1);
  if (["threaten", "fight", "steal"].includes(parsed.primary)) npcDelta -= 2;
  if (parsed.deceptive && result.success === "fail") npcDelta -= 2;
  if (parsed.promise && result.success !== "fail") npcDelta += 1;
  state.npcTrust[npcKey] = Math.max(-10, Math.min(10, (state.npcTrust[npcKey] || 0) + npcDelta));
  const personalTrust = state.npcTrust[npcKey];

  upsertNpc(ledger, {
    name: npcName,
    role: npcRole,
    attitude: personalTrust >= 5 ? "cooperativo" : personalTrust <= -4 ? "hostil e desconfiado" : personalTrust >= 2 ? "cautelosamente favorável" : "reservado",
    conversationMemory: [
      `Turno ${state.turn}: o jogador tentou ${intentLabel(parsed.primary)}${parsed.secondary ? ` e também ${intentLabel(parsed.secondary)}` : ""}. Resultado: ${result.success}.`,
      ...(parsed.directSpeech ? [`O jogador disse: “${parsed.directSpeech}”`] : []),
      ...(parsed.promise ? ["O jogador fez um compromisso explícito; este NPC deve se lembrar disso."] : []),
    ],
    secretsKnown: consequence.secret,
    lastLocationMet: ledger.location,
  });

  if (consequence.sanityDelta !== 0) {
    ledger.sanity = Math.max(0, Math.min(100, (ledger.sanity ?? 100) + consequence.sanityDelta));
    ledger.sanityStatus = sanityStatus(ledger.sanity);
    ledger.sanityHistory = [
      ...(ledger.sanityHistory || []),
      { reason: "Contato imprudente com um fenômeno que o personagem ainda não compreende.", delta: consequence.sanityDelta, timestamp: Date.now() },
    ];
  }

  // Concrete but non-magical discoveries slowly expose the larger occult layer.
  if (state.evidence >= 4 && !state.flags.includes("pattern-seen")) {
    state.flags.push("pattern-seen");
    state.occultExposure += 1;
    ledger.mysteries = unique([...(ledger.mysteries || []), `Por que incidentes diferentes repetem o mesmo padrão em ${start.nextLocation}?`]);
  }
  if (state.evidence >= 7 && !state.flags.includes("network-seen")) {
    state.flags.push("network-seen");
    state.occultExposure += 2;
    ledger.mysteries = unique([...(ledger.mysteries || []), "Existe uma organização por trás dos incidentes, e ela conhece regras que o mundo comum ignora."]);
  }

  const phaseEvent = phaseTransitionEvent(start, previousPhase, state, ledger);
  if (phaseEvent?.clue) ledger.clues = unique([...(ledger.clues || []), phaseEvent.clue]);

  // O mundo continua se movendo sem esperar o jogador: eventos de ambiente e agendas de NPC
  // são determinísticos pela seed, mas filtrados pelo estado atual da investigação.
  const intermediateEvent = maybeIntermediateEvent(start, state, ledger);
  const agendaEvent = advanceNpcAgendas(start, state, ledger, parsed);

  ledger.offlineState = state;
  const end = maybeEnding(origin, state, ledger);
  if (end) return endingTurn(origin, state, ledger, end);

  const options = localOptions(start, state);
  const statusPressure = state.pressure >= 75 ? "ameaça imediata" : state.pressure >= 45 ? "atenção hostil crescente" : "tensão controlável";
  const sceneParts = [
    consequence.scene,
    phaseEvent?.text,
    intermediateEvent?.text ? `EVENTO — ${intermediateEvent.text}` : undefined,
    agendaEvent?.text ? `MOVIMENTO DE NPC — ${agendaEvent.text}` : undefined,
  ].filter(Boolean);
  const dialogueParts = [consequence.dialogue, intermediateEvent?.dialogue, agendaEvent?.dialogue].filter(Boolean);
  const moods = [consequence.mood, intermediateEvent?.mood, agendaEvent?.mood].filter(Boolean) as AudioMood[];
  const finalMood: AudioMood = moods.includes("tension") ? "tension" : moods.includes("discovery") ? "discovery" : moods.includes("mystery") ? "mystery" : "calm";
  const text = formatTurn(
    sceneParts.join("\n\n"),
    dialogueParts.join("\n\n") || consequence.dialogue,
    `${ledger.location} | ${ledger.timeAndWeather} | Seed: ${state.campaignSeed} | Evidências: ${state.evidence} | Eventos: ${state.eventHistory.length} | ${statusPressure}`,
    dilemmaText(options)
  );

  return { text, ledger, mood: finalMood, suggestedActions: options };
}

export const OFFLINE_ENGINE_STATS = {
  starts: STARTS.length,
  endings: ENDINGS.length,
  intents: Object.keys(INTENT_WORDS).length,
  events: INTERMEDIATE_EVENTS.length,
  agendas: NPC_AGENDA_GOALS.length,
};
