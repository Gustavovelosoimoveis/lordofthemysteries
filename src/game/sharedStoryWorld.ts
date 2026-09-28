import type { GameOrigin, LedgerData } from "../types";

export type SharedSignalKind = "rumor" | "evidence" | "npc" | "incident" | "shipment" | "meeting";
export type SharedSignalStatus = "observed" | "pending" | "intersected" | "missed";
export type ThreadStatus = "latent" | "active" | "intersected" | "resolved" | "collapsed";

export interface SharedStoryThreadState {
  id: string;
  title: string;
  home: string;
  stage: number;
  status: ThreadStatus;
  disturbance: number;
  lastAdvanceTick: number;
  lastSignalTick: number;
}

export interface SharedStorySignal {
  id: string;
  tick: number;
  sourceThreadId: string;
  targetThreadId?: string;
  sourceCharacterId?: string;
  kind: SharedSignalKind;
  title: string;
  detail: string;
  anchor: string;
  location?: string;
  expiresTick?: number;
  status: SharedSignalStatus;
  onlineReady: true;
}

export interface SharedStoryWorldState {
  version: 1;
  worldId: string;
  activeThreadId: string;
  characterId: string;
  threads: Record<string, SharedStoryThreadState>;
  signals: SharedStorySignal[];
  consumedSignalIds: string[];
  intersections: number;
  lastAdvanceTick: number;
}

export interface SharedStoryAdvanceResult {
  state: SharedStoryWorldState;
  echoes: Array<{
    id: string;
    title: string;
    detail: string;
    location?: string;
    tone: "neutral" | "ominous" | "urgent" | "quiet";
    sourceId: string;
  }>;
  clues: string[];
}

interface ThreadDef {
  id: string;
  title: string;
  home: string;
}

interface CrossoverEdge {
  a: string;
  b: string;
  anchor: string;
  kind: SharedSignalKind;
  location: string;
  aSeesB: string;
  bSeesA: string;
}

const THREADS: ThreadDef[] = [
  { id: "iron-cross-room", title: "O Quarto 17 da Rua Cruz de Ferro", home: "Tingen" },
  { id: "khoy-archive", title: "A Página que Não Existia", home: "Tingen" },
  { id: "tussock-crate", title: "A Caixa que Sussurra no Tussock", home: "Backlund" },
  { id: "east-district-apothecary", title: "O Dente de Cobre", home: "Backlund" },
  { id: "st-george-coffin", title: "Três Batidas no Caixão", home: "Backlund" },
  { id: "hillston-bookshop", title: "As Vinte e Duas Leis", home: "Backlund" },
  { id: "bridge-club", title: "O Guardanapo do Clube", home: "Backlund" },
  { id: "joewood-ledger", title: "O Livro-Caixa dos Mortos", home: "Backlund" },
  { id: "north-factory", title: "O Turno que Nunca Terminou", home: "Backlund" },
  { id: "empress-heirloom", title: "A Joia da Ala Fechada", home: "Backlund" },
  { id: "pritz-manifest", title: "O Navio Sem Porto de Origem", home: "Pritz" },
  { id: "pritz-smugglers", title: "A Lanterna Verde", home: "Pritz" },
  { id: "conot-mine", title: "A Galeria 9", home: "Conot" },
  { id: "bayam-incense", title: "O Beco dos Aromas", home: "Bayam" },
  { id: "bayam-diver", title: "A Máscara Sob o Recife", home: "Bayam" },
  { id: "trier-clockwork", title: "O Relógio que Atrasa Pessoas", home: "Trier" },
  { id: "trier-river", title: "A Carta do Rio Serifim", home: "Trier" },
  { id: "backlund-morgue", title: "O Cadáver que Respira", home: "Backlund" },
  { id: "court-testament", title: "O Testamento da Linhagem Extinta", home: "Backlund" },
  { id: "tram-ticket", title: "O Bilhete para uma Estação Inexistente", home: "Backlund" },
  { id: "newspaper-proof", title: "A Notícia Antes do Crime", home: "Backlund" },
  { id: "theatre-mask", title: "A Máscara do Terceiro Ato", home: "Backlund" },
  { id: "hospital-ward", title: "O Paciente Sem Reflexo", home: "Backlund" },
  { id: "canal-photograph", title: "A Fotografia a Mais", home: "Backlund" },
  { id: "police-evidence", title: "A Prova que Voltou ao Armário", home: "Tingen" },
  { id: "church-donation", title: "A Moeda da Caixa de Ofertas", home: "Tingen" },
];

const EDGES: CrossoverEdge[] = [
  {
    a: "iron-cross-room",
    b: "khoy-archive",
    anchor: "símbolo do olho fechado",
    kind: "evidence",
    location: "Tingen",
    aSeesB: "Um estudante da Universidade Khoy procura a pensão por causa de uma página arrancada que descreve exatamente o símbolo encontrado no prédio.",
    bSeesA: "Uma anotação do arquivo cita o antigo morador de um quarto na Rua Cruz de Ferro e repete o mesmo símbolo de olho fechado.",
  },
  {
    a: "khoy-archive",
    b: "church-donation",
    anchor: "marginalia em tinta violeta",
    kind: "evidence",
    location: "Tingen",
    aSeesB: "Uma moeda recolhida numa capela traz no aro a mesma sequência abreviada encontrada na margem do documento desaparecido.",
    bSeesA: "A Universidade Khoy pede discretamente acesso a uma moeda de oferta porque a gravação coincide com notas de um manuscrito restrito.",
  },
  {
    a: "church-donation",
    b: "police-evidence",
    anchor: "moeda de oferta catalogada",
    kind: "incident",
    location: "Tingen",
    aSeesB: "A moeda desaparece por algumas horas e retorna com um pequeno número de evidência policial gravado onde antes não havia marca alguma.",
    bSeesA: "Uma prova devolvida ao armário contém uma moeda que deveria estar guardada numa capela, mas ninguém admite ter feito a apreensão.",
  },
  {
    a: "police-evidence",
    b: "iron-cross-room",
    anchor: "chave numerada 17",
    kind: "evidence",
    location: "Tingen",
    aSeesB: "Uma chave de latão marcada com 17 aparece entre objetos sem cadeia de custódia; o endereço ligado a ela foi raspado do formulário.",
    bSeesA: "Um investigador da delegacia procura discretamente uma chave marcada com 17 e se recusa a dizer por que ela consta de um inventário policial antigo.",
  },
  {
    a: "tussock-crate",
    b: "pritz-manifest",
    anchor: "carga sem porto de origem",
    kind: "shipment",
    location: "Docas do Rio Tussock",
    aSeesB: "Um manifesto vindo de Pritz descreve uma caixa com o mesmo peso, lacre e medidas da carga que sussurra no Tussock — mas o porto de origem está em branco.",
    bSeesA: "Um telegrama de Backlund informa que uma caixa idêntica à carga sem origem já foi descarregada no Tussock antes de o navio oficialmente atracar.",
  },
  {
    a: "pritz-manifest",
    b: "pritz-smugglers",
    anchor: "lanterna verde de sinalização",
    kind: "meeting",
    location: "Porto de Pritz",
    aSeesB: "A tripulação usa uma lanterna verde que não consta do código do porto; homens das docas reconhecem o sinal e imediatamente fecham as portas.",
    bSeesA: "O contrabandista que controla a lanterna recebe um manifesto naval que deveria estar numa repartição e manda queimar apenas a página do porto de origem.",
  },
  {
    a: "pritz-smugglers",
    b: "bayam-diver",
    anchor: "marca verde sob sal marinho",
    kind: "shipment",
    location: "rotas do Mar Sônia",
    aSeesB: "Uma caixa recém-chegada de Bayam tem a mesma tinta verde da lanterna dos contrabandistas, escondida sob uma crosta de sal.",
    bSeesA: "No fundo de uma embarcação afundada há uma lanterna verde de fabricação de Pritz presa por corrente a uma caixa vazia.",
  },
  {
    a: "bayam-diver",
    b: "bayam-incense",
    anchor: "resina azul-acinzentada",
    kind: "evidence",
    location: "Bayam",
    aSeesB: "A máscara retirada do recife conserva nas frestas uma resina aromática vendida apenas em um beco específico da Cidade Velha.",
    bSeesA: "Um vendedor de incenso recebe uma encomenda incomum: resina suficiente para selar uma máscara de mergulho antiga, paga com moeda de Pritz.",
  },
  {
    a: "east-district-apothecary",
    b: "hospital-ward",
    anchor: "liga de cobre dentária",
    kind: "evidence",
    location: "Distrito Leste de Backlund",
    aSeesB: "Uma enfermeira procura o boticário com um dente de cobre idêntico ao do caso, retirado de um paciente sem reflexo.",
    bSeesA: "O prontuário menciona uma liga de cobre preparada por um boticário do Distrito Leste, mas o nome do fornecedor foi arrancado.",
  },
  {
    a: "hospital-ward",
    b: "backlund-morgue",
    anchor: "corpo sem reflexo",
    kind: "npc",
    location: "Backlund",
    aSeesB: "O leito amanhece vazio; horas depois, um auxiliar do necrotério pergunta por um corpo que oficialmente nunca deixou a enfermaria.",
    bSeesA: "O cadáver que respira usa uma pulseira de internação da mesma enfermaria que declarou não ter perdido nenhum paciente.",
  },
  {
    a: "backlund-morgue",
    b: "st-george-coffin",
    anchor: "etiqueta funerária duplicada",
    kind: "incident",
    location: "St. George, Backlund",
    aSeesB: "Uma etiqueta do necrotério aparece presa a um caixão enterrado dois dias antes da data impressa no papel.",
    bSeesA: "O necrotério registra como entregue um corpo que ainda deveria estar sob a terra em St. George.",
  },
  {
    a: "hillston-bookshop",
    b: "theatre-mask",
    anchor: "vigésima segunda lei",
    kind: "evidence",
    location: "Hillston, Backlund",
    aSeesB: "Uma fala improvisada no terceiro ato reproduz palavra por palavra a vigésima segunda lei de um livro que nunca foi publicado.",
    bSeesA: "Um cliente compra o único exemplar das Vinte e Duas Leis e deixa no balcão uma máscara usada por um ator desaparecido.",
  },
  {
    a: "theatre-mask",
    b: "trier-river",
    anchor: "máscara assinada no verso",
    kind: "shipment",
    location: "rota Backlund–Trier",
    aSeesB: "No verso de uma máscara há um endereço em Trier escrito com a mesma caligrafia de uma carta retirada do Rio Serifim.",
    bSeesA: "A carta do rio menciona a remessa de uma máscara para Hillston e descreve uma cena que só seria encenada semanas depois.",
  },
  {
    a: "trier-river",
    b: "newspaper-proof",
    anchor: "notícia datada antes do fato",
    kind: "rumor",
    location: "Trier / Backlund",
    aSeesB: "Um recorte do Morning Post chega dentro de uma carta encharcada; a notícia descreve um crime que ainda não aconteceu em Trier.",
    bSeesA: "O clichê de impressão traz no verso uma frase em francês idêntica à de uma carta retirada do Rio Serifim.",
  },
  {
    a: "joewood-ledger",
    b: "court-testament",
    anchor: "sobrenome riscado",
    kind: "evidence",
    location: "Backlund",
    aSeesB: "Um morto listado no livro-caixa reaparece como beneficiário de um testamento que deveria pertencer a uma linhagem extinta.",
    bSeesA: "O sobrenome riscado do testamento aparece num livro-caixa como recebedor de pagamentos feitos depois da própria morte.",
  },
  {
    a: "court-testament",
    b: "empress-heirloom",
    anchor: "brasão incompleto",
    kind: "evidence",
    location: "Empress Borough, Backlund",
    aSeesB: "A joia da ala fechada completa exatamente a metade ausente do brasão gravado no testamento.",
    bSeesA: "Um tabelião procura a origem da joia porque um brasão idêntico aparece num testamento selado há décadas.",
  },
  {
    a: "empress-heirloom",
    b: "bridge-club",
    anchor: "leilão privado sem catálogo",
    kind: "meeting",
    location: "Backlund",
    aSeesB: "O clube organiza um leilão sem catálogo e alguém oferece uma fortuna por uma joia que oficialmente nunca saiu da ala fechada.",
    bSeesA: "Um nome rabiscado num guardanapo corresponde ao intermediário que tentou comprar uma joia proibida em Empress Borough.",
  },
  {
    a: "bridge-club",
    b: "newspaper-proof",
    anchor: "nome antes da manchete",
    kind: "rumor",
    location: "Backlund",
    aSeesB: "Um nome escrito no guardanapo aparece horas depois numa prova tipográfica de um crime ainda não ocorrido.",
    bSeesA: "A redação recebe de um clube privado uma lista de convidados; um deles já consta como morto na matéria do dia seguinte.",
  },
  {
    a: "north-factory",
    b: "conot-mine",
    anchor: "minério de lote 9",
    kind: "shipment",
    location: "cadeia industrial de Loen",
    aSeesB: "Uma peça quebrada da fábrica contém minério marcado como lote 9, proveniente de uma galeria de Conot oficialmente interditada.",
    bSeesA: "Carrinhos da Galeria 9 carregam peças industriais acabadas de Backlund, algo impossível para uma mina que deveria apenas extrair minério.",
  },
  {
    a: "conot-mine",
    b: "trier-clockwork",
    anchor: "engrenagem de liga negra",
    kind: "shipment",
    location: "Conot / Trier",
    aSeesB: "No fundo da mina há uma engrenagem de precisão fabricada em Trier, coberta por pó de uma camada que ninguém deveria ter alcançado.",
    bSeesA: "O relojoeiro recebe uma liga negra de Conot que faz o mecanismo perder minutos apenas quando determinada pessoa entra na sala.",
  },
  {
    a: "trier-clockwork",
    b: "canal-photograph",
    anchor: "minuto ausente",
    kind: "evidence",
    location: "Trier / Backlund",
    aSeesB: "Uma fotografia de Backlund mostra um relógio público marcando exatamente o minuto que o mecanismo de Trier insiste em apagar.",
    bSeesA: "No canto de uma fotografia aparece um relógio de Trier que não poderia estar em Backlund — e o ponteiro está atrasado pelo mesmo intervalo do caso.",
  },
  {
    a: "canal-photograph",
    b: "tram-ticket",
    anchor: "passageiro a mais",
    kind: "npc",
    location: "Cherwood, Backlund",
    aSeesB: "O passageiro extra da fotografia segura um bilhete para uma estação inexistente; o rosto não aparece em nenhuma outra chapa.",
    bSeesA: "Uma foto de canal mostra alguém usando o mesmo bilhete impossível horas antes de ele ser emitido.",
  },
  {
    a: "tram-ticket",
    b: "newspaper-proof",
    anchor: "estação inexistente",
    kind: "rumor",
    location: "Backlund",
    aSeesB: "Uma pequena nota de jornal menciona uma estação fechada há vinte anos com o mesmo nome impresso no bilhete impossível.",
    bSeesA: "Na prova tipográfica, o endereço do crime foi substituído de última hora pelo nome de uma estação que não existe no mapa.",
  },
  {
    a: "tussock-crate",
    b: "joewood-ledger",
    anchor: "fatura sem recebedor",
    kind: "evidence",
    location: "Backlund",
    aSeesB: "Uma fatura presa à caixa aponta para um pagamento do livro-caixa de Joewood, feito a alguém declarado morto.",
    bSeesA: "O livro-caixa registra uma taxa portuária do Tussock para uma caixa que não aparece em nenhum manifesto oficial.",
  },
];

function normalizeSeed(value?: string): string {
  return (value || "LOEN-DEFAULT").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 48) || "LOEN-DEFAULT";
}

function normalizeText(input: string): string {
  return input.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim();
}

function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded01(seedText: string): number {
  let x = hashString(seedText) || 1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 4294967295;
}

function activeWorldId(origin: GameOrigin): string {
  return normalizeSeed(origin.worldSeed || origin.campaignSeed || "LOEN-DEFAULT");
}

function characterId(origin: GameOrigin, activeThreadId: string): string {
  return origin.characterId || `local:${normalizeSeed(origin.campaignSeed)}:${activeThreadId}`;
}

function edgesFor(threadId: string): CrossoverEdge[] {
  return EDGES.filter((edge) => edge.a === threadId || edge.b === threadId);
}

function edgePerspective(edge: CrossoverEdge, activeThreadId: string, sourceThreadId: string) {
  const targetIsA = edge.a === activeThreadId;
  return {
    detail: targetIsA ? edge.aSeesB : edge.bSeesA,
    sourceIsA: edge.a === sourceThreadId,
  };
}

function cloneState(state: SharedStoryWorldState): SharedStoryWorldState {
  return {
    ...state,
    threads: Object.fromEntries(Object.entries(state.threads).map(([id, thread]) => [id, { ...thread }])),
    signals: state.signals.map((signal) => ({ ...signal })),
    consumedSignalIds: [...state.consumedSignalIds],
  };
}

export function initializeSharedStoryWorld(origin: GameOrigin, activeThreadId: string): SharedStoryWorldState {
  const worldId = activeWorldId(origin);
  const threads: Record<string, SharedStoryThreadState> = {};
  for (const def of THREADS) {
    const initialStage = def.id === activeThreadId ? 1 : seeded01(`${worldId}:thread:${def.id}`) > 0.74 ? 1 : 0;
    threads[def.id] = {
      id: def.id,
      title: def.title,
      home: def.home,
      stage: initialStage,
      status: def.id === activeThreadId ? "active" : initialStage ? "active" : "latent",
      disturbance: 0,
      lastAdvanceTick: 0,
      lastSignalTick: -99,
    };
  }
  return {
    version: 1,
    worldId,
    activeThreadId,
    characterId: characterId(origin, activeThreadId),
    threads,
    signals: [],
    consumedSignalIds: [],
    intersections: 0,
    lastAdvanceTick: 0,
  };
}

function ensureState(previous: SharedStoryWorldState | undefined, origin: GameOrigin, activeThreadId: string): SharedStoryWorldState {
  if (!previous || previous.version !== 1 || !previous.threads?.[activeThreadId]) {
    return initializeSharedStoryWorld(origin, activeThreadId);
  }
  const state = cloneState(previous);
  state.activeThreadId = activeThreadId;
  state.characterId ||= characterId(origin, activeThreadId);
  state.worldId ||= activeWorldId(origin);
  return state;
}

function actionCanPursueSignal(action: string): boolean {
  const t = normalizeText(action);
  return /\b(investig|seguir|sigo|procur|examinar|verific|ir|vou|viajar|rastre|encontr|pergunt|question|vasculh|observar|vigiar|checar)\w*/.test(t);
}

function actionReferencesRecentEcho(action: string): boolean {
  const t = normalizeText(action);
  return /\b(essa pista|esse fio|esse caso|outro caso|o rumor|esse rumor|o recado|esse recado|isso|aquilo|essa conexao|essa historia)\b/.test(t);
}

function actionMentionsSignal(action: string, signal: SharedStorySignal): boolean {
  const text = normalizeText(action);
  const anchorTokens = normalizeText(signal.anchor).split(" ").filter((x) => x.length >= 5);
  const detailTokens = normalizeText(signal.detail).split(" ").filter((x) => x.length >= 7).slice(0, 12);
  return [...anchorTokens, ...detailTokens].some((token) => text.includes(token));
}

function locationLooksRelevant(ledgerLocation: string, signalLocation?: string): boolean {
  if (!signalLocation) return false;
  const a = normalizeText(ledgerLocation);
  const b = normalizeText(signalLocation);
  if (!a || !b) return false;
  const aWords = a.split(" ").filter((x) => x.length >= 5);
  return aWords.some((word) => b.includes(word));
}

function toneForSignal(signal: SharedStorySignal): "neutral" | "ominous" | "urgent" | "quiet" {
  if (signal.status === "missed") return "ominous";
  if (signal.status === "intersected") return "urgent";
  if (signal.kind === "meeting" || signal.kind === "npc") return "urgent";
  if (signal.kind === "rumor") return "quiet";
  return "neutral";
}

function makeSignal(
  state: SharedStoryWorldState,
  edge: CrossoverEdge,
  sourceThreadId: string,
  tick: number
): SharedStorySignal {
  const activeThreadId = state.activeThreadId;
  const perspective = edgePerspective(edge, activeThreadId, sourceThreadId);
  const isTimeSensitive = edge.kind === "meeting" || edge.kind === "npc" || edge.kind === "shipment";
  return {
    id: `cross:${state.worldId}:${sourceThreadId}:${activeThreadId}:${tick}:${hashString(edge.anchor).toString(36)}`,
    tick,
    sourceThreadId,
    targetThreadId: activeThreadId,
    sourceCharacterId: `world-sim:${sourceThreadId}`,
    kind: edge.kind,
    title: isTimeSensitive ? "Um fio de outra história" : "Eco de outra investigação",
    detail: perspective.detail,
    anchor: edge.anchor,
    location: edge.location,
    expiresTick: isTimeSensitive ? tick + 2 : undefined,
    status: isTimeSensitive ? "pending" : "observed",
    onlineReady: true,
  };
}

function advanceBackgroundThreads(state: SharedStoryWorldState, tick: number): string[] {
  const ranked = THREADS
    .filter((def) => def.id !== state.activeThreadId)
    .map((def) => ({
      id: def.id,
      score: seeded01(`${state.worldId}:advance:${tick}:${def.id}`),
    }))
    .sort((a, b) => b.score - a.score);

  // A cada três ticks, força um vizinho narrativo da história ativa a continuar vivendo.
  // Isso garante encontros entre tramas sem tornar todos os casos a mesma história.
  const linkedIds = edgesFor(state.activeThreadId).map((edge) => edge.a === state.activeThreadId ? edge.b : edge.a);
  const forcedLinked = tick >= 3 && tick % 3 === 0 && linkedIds.length
    ? linkedIds[Math.floor(seeded01(`${state.worldId}:linked:${state.activeThreadId}:${tick}`) * linkedIds.length) % linkedIds.length]
    : undefined;

  const ordered = forcedLinked
    ? [{ id: forcedLinked, score: 2 }, ...ranked.filter((entry) => entry.id !== forcedLinked)]
    : ranked;
  const limit = tick % 4 === 0 ? 2 : 1;
  const moved: string[] = [];

  for (const candidate of ordered) {
    if (moved.length >= limit) break;
    const thread = state.threads[candidate.id];
    if (!thread || tick - thread.lastAdvanceTick < 2) continue;
    thread.stage = Math.min(4, thread.stage + 1);
    thread.lastAdvanceTick = tick;
    thread.status = thread.stage >= 4 ? "resolved" : "active";
    moved.push(thread.id);
  }
  return moved;
}

function updatePendingSignals(
  state: SharedStoryWorldState,
  ledger: LedgerData,
  action: string,
  tick: number,
  echoes: SharedStoryAdvanceResult["echoes"],
  clues: string[]
) {
  for (const signal of state.signals) {
    if (signal.targetThreadId !== state.activeThreadId || signal.status !== "pending") continue;

    const pursues = actionCanPursueSignal(action);
    const matches = actionMentionsSignal(action, signal) || locationLooksRelevant(ledger.location, signal.location) || actionReferencesRecentEcho(action);
    if (pursues && matches) {
      signal.status = "intersected";
      state.intersections += 1;
      state.consumedSignalIds.push(signal.id);
      const thread = state.threads[signal.sourceThreadId];
      if (thread) {
        thread.status = "intersected";
        thread.disturbance = Math.min(100, thread.disturbance + 16);
      }
      echoes.push({
        id: `${signal.id}:intersected`,
        title: "As histórias se cruzam",
        detail: `${signal.detail} Sua investigação agora tocou diretamente esse outro fio do mundo.`,
        location: signal.location,
        tone: "urgent",
        sourceId: signal.id,
      });
      clues.push(`Cruzamento de histórias: ${signal.anchor}. ${signal.detail}`);
      continue;
    }

    if (signal.expiresTick !== undefined && tick > signal.expiresTick) {
      signal.status = "missed";
      state.consumedSignalIds.push(signal.id);
      echoes.push({
        id: `${signal.id}:missed`,
        title: "O fio esfriou",
        detail: `A oportunidade ligada a ${signal.anchor} passou sem intervenção. O outro caso continua existindo, mas não mais da mesma forma.`,
        location: signal.location,
        tone: "ominous",
        sourceId: signal.id,
      });
    }
  }
}

function maybeEmitCrossover(
  state: SharedStoryWorldState,
  movedThreadIds: string[],
  tick: number,
  echoes: SharedStoryAdvanceResult["echoes"],
  clues: string[]
) {
  const activeEdges = edgesFor(state.activeThreadId);
  for (const sourceThreadId of movedThreadIds) {
    const edge = activeEdges.find((candidate) => candidate.a === sourceThreadId || candidate.b === sourceThreadId);
    if (!edge) continue;
    const source = state.threads[sourceThreadId];
    const active = state.threads[state.activeThreadId];
    if (!source || !active) continue;
    if (state.signals.some((signal) => signal.sourceThreadId === sourceThreadId && signal.targetThreadId === state.activeThreadId && signal.anchor === edge.anchor)) continue;
    if (tick - source.lastSignalTick < 3 || tick - active.lastSignalTick < 2) continue;
    const hasPriorCrossover = state.signals.some((signal) => signal.targetThreadId === state.activeThreadId);
    if (hasPriorCrossover && seeded01(`${state.worldId}:cross:${sourceThreadId}:${state.activeThreadId}:${tick}`) < 0.46) continue;

    const signal = makeSignal(state, edge, sourceThreadId, tick);
    state.signals.push(signal);
    source.lastSignalTick = tick;
    active.lastSignalTick = tick;
    echoes.push({
      id: signal.id,
      title: signal.title,
      detail: signal.detail,
      location: signal.location,
      tone: toneForSignal(signal),
      sourceId: signal.id,
    });
    if (signal.status === "observed") {
      clues.push(`Eco de outra investigação: ${signal.anchor}. ${signal.detail}`);
      state.consumedSignalIds.push(signal.id);
    }
    break;
  }
}

export function advanceSharedStoryWorld(
  previous: SharedStoryWorldState | undefined,
  origin: GameOrigin,
  ledger: LedgerData,
  action: string,
  tick: number
): SharedStoryAdvanceResult {
  const activeThreadId = ledger.offlineState?.startId || previous?.activeThreadId || "iron-cross-room";
  const state = ensureState(previous, origin, activeThreadId);
  const echoes: SharedStoryAdvanceResult["echoes"] = [];
  const clues: string[] = [];

  updatePendingSignals(state, ledger, action, tick, echoes, clues);
  const moved = advanceBackgroundThreads(state, tick);
  maybeEmitCrossover(state, moved, tick, echoes, clues);

  state.signals = state.signals.slice(-36);
  state.consumedSignalIds = [...new Set(state.consumedSignalIds)].slice(-64);
  state.lastAdvanceTick = tick;

  return { state, echoes, clues };
}

/**
 * Ponto de extensão para o futuro online.
 * O servidor poderá entregar sinais produzidos por outros jogadores no mesmo worldId.
 * A fusão é idempotente e não depende de WebSocket/HTTP, mantendo o motor desacoplado.
 */
export function mergeExternalStorySignals(
  previous: SharedStoryWorldState,
  incoming: SharedStorySignal[]
): SharedStoryWorldState {
  const state = cloneState(previous);
  const existing = new Set(state.signals.map((signal) => signal.id));
  for (const signal of incoming) {
    if (existing.has(signal.id)) continue;
    state.signals.push({ ...signal, onlineReady: true });
    existing.add(signal.id);
  }
  state.signals = state.signals.sort((a, b) => a.tick - b.tick).slice(-64);
  return state;
}

export function getSharedStoryStats() {
  const connected = THREADS.filter((thread) => edgesFor(thread.id).length > 0).length;
  return {
    threads: THREADS.length,
    crossoverLinks: EDGES.length,
    connectedThreads: connected,
  };
}
