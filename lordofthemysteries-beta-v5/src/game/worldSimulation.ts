import type { GameOrigin, LedgerData, NPCRecord } from "../types";

export type WorldWeather = "fog" | "drizzle" | "rain" | "storm" | "smog" | "clear";
export type FactionId = "authorities" | "church" | "press" | "underworld" | "occult-network";
export type WorldNpcStatus = "active" | "hidden" | "missing" | "injured" | "dead" | "left-city";

export interface WorldFactionState {
  id: FactionId;
  label: string;
  awareness: number;
  hostility: number;
  activity: number;
  lastMove?: string;
  lastMoveTurn?: number;
}

export interface WorldEvent {
  id: string;
  turn: number;
  title: string;
  detail: string;
  location?: string;
  tone: "neutral" | "ominous" | "urgent" | "quiet";
  source?: "faction" | "npc" | "story" | "schedule" | "system";
  sourceId?: string;
}

export interface WorldNpcAgent {
  id: string;
  name: string;
  role?: string;
  location: string;
  status: WorldNpcStatus;
  agenda?: string;
  urgency: number;
  exposure: number;
  lastMoveTurn: number;
  nextMoveTurn: number;
  lastAction?: string;
}

export interface WorldScheduledEvent {
  id: string;
  title: string;
  detail: string;
  location: string;
  dueTick: number;
  expiresTick: number;
  status: "pending" | "triggered" | "missed";
  announced?: boolean;
  npcId?: string;
}

export interface WorldSimulationState {
  /** v1 saves são atualizados automaticamente para v2 no próximo turno. */
  version: 1 | 2;
  tick: number;
  day: number;
  minuteOfDay: number;
  weather: WorldWeather;
  cityPressure: number;
  publicAttention: number;
  occultNoise: number;
  factions: Record<FactionId, WorldFactionState>;
  recentEvents: WorldEvent[];
  npcAgents?: Record<string, WorldNpcAgent>;
  scheduledEvents?: WorldScheduledEvent[];
  lastPlayerAction?: string;
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

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

function choose<T>(items: T[], seedText: string): T {
  const index = Math.floor(seeded01(seedText) * items.length) % items.length;
  return items[index];
}

function parseMinuteOfDay(text: string | undefined): number | null {
  if (!text) return null;
  const match = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function inferWeather(text: string): WorldWeather {
  const t = text.toLowerCase();
  if (/tempestade|tormenta|trov[aã]o/.test(t)) return "storm";
  if (/chuva forte|chuva intensa/.test(t)) return "rain";
  if (/garoa|chuvisco/.test(t)) return "drizzle";
  if (/fuma[cç]a|carv[aã]o|smog|n[eé]voa [aá]cida/.test(t)) return "smog";
  if (/n[eé]voa|neblina/.test(t)) return "fog";
  if (/limpo|c[eé]u aberto/.test(t)) return "clear";
  return "fog";
}

function factionBase(id: FactionId, label: string): WorldFactionState {
  return { id, label, awareness: 0, hostility: 0, activity: 8 };
}

function baseFactions(): Record<FactionId, WorldFactionState> {
  return {
    authorities: factionBase("authorities", "Autoridades"),
    church: factionBase("church", "Instituições religiosas"),
    press: factionBase("press", "Imprensa"),
    underworld: factionBase("underworld", "Submundo"),
    "occult-network": factionBase("occult-network", "Rede oculta"),
  };
}

function campaignKey(origin: GameOrigin, ledger: LedgerData): string {
  // A simulação urbana pertence ao mundo. No futuro online, vários personagens podem compartilhar worldSeed.
  return origin.worldSeed || ledger.sharedStoryState?.worldId || ledger.offlineState?.campaignSeed || origin.campaignSeed || origin.id || "LOEN";
}

function npcId(name: string): string {
  return normalizeText(name).replace(/\s+/g, "-") || `npc-${hashString(name).toString(36)}`;
}

function agendaForNpc(ledger: LedgerData, name: string): { goal?: string; urgency?: number } {
  const agendas = ledger.offlineState?.npcAgendas || {};
  const normalized = normalizeText(name);
  const found = Object.values(agendas).find((agenda) => normalizeText(agenda.npcName) === normalized);
  return found ? { goal: found.goal, urgency: found.urgency } : {};
}

function agentFromRecord(npc: NPCRecord, ledger: LedgerData, key: string): WorldNpcAgent {
  const agenda = agendaForNpc(ledger, npc.name);
  const id = npcId(npc.name);
  return {
    id,
    name: npc.name,
    role: npc.role,
    location: npc.lastLocationMet || ledger.location || "local desconhecido",
    status: "active",
    agenda: agenda.goal,
    urgency: clamp((agenda.urgency || 2) * 12, 8, 88),
    exposure: 8,
    lastMoveTurn: 0,
    nextMoveTurn: 2 + Math.floor(seeded01(`${key}:npc:${id}:first`) * 3),
  };
}

function initializeNpcAgents(ledger: LedgerData, key: string): Record<string, WorldNpcAgent> {
  const agents: Record<string, WorldNpcAgent> = {};
  for (const npc of ledger.npcs || []) {
    const agent = agentFromRecord(npc, ledger, key);
    agents[agent.id] = agent;
  }
  // Alguns NPCs do motor local podem ainda não ter sido exibidos no diário. Mantemos agentes mínimos para eles.
  for (const agenda of Object.values(ledger.offlineState?.npcAgendas || {})) {
    const id = npcId(agenda.npcName);
    if (agents[id]) continue;
    agents[id] = {
      id,
      name: agenda.npcName,
      role: agenda.role,
      location: ledger.location || "local desconhecido",
      status: "active",
      agenda: agenda.goal,
      urgency: clamp((agenda.urgency || 2) * 12, 8, 88),
      exposure: 8,
      lastMoveTurn: 0,
      nextMoveTurn: 2 + Math.floor(seeded01(`${key}:npc:${id}:first`) * 3),
    };
  }
  return agents;
}

function syncNpcAgents(existing: Record<string, WorldNpcAgent>, ledger: LedgerData, key: string): Record<string, WorldNpcAgent> {
  const agents = Object.fromEntries(Object.entries(existing).map(([id, agent]) => [id, { ...agent }]));
  for (const npc of ledger.npcs || []) {
    const id = npcId(npc.name);
    const agenda = agendaForNpc(ledger, npc.name);
    if (!agents[id]) {
      agents[id] = agentFromRecord(npc, ledger, key);
      continue;
    }
    agents[id].role ||= npc.role;
    agents[id].agenda ||= agenda.goal;
    if (agenda.urgency) agents[id].urgency = Math.max(agents[id].urgency, clamp(agenda.urgency * 12));
  }
  return agents;
}

function baseWorld(origin: GameOrigin, ledger: LedgerData): WorldSimulationState {
  const key = campaignKey(origin, ledger);
  const minuteFromStatus = parseMinuteOfDay(ledger.timeAndWeather);
  const initialMinute = minuteFromStatus ?? Math.floor(seeded01(`${key}:clock`) * 24 * 60);
  const weather = inferWeather(`${ledger.timeAndWeather || ""} ${ledger.location || ""}`);
  const factions = baseFactions();
  const occult = ledger.offlineState?.occultExposure || 0;
  const pressure = ledger.offlineState?.pressure || 0;
  factions["occult-network"].awareness = clamp(occult * 1.4);
  factions.authorities.awareness = clamp(pressure * 0.65);

  return {
    version: 2,
    tick: 0,
    day: 1,
    minuteOfDay: initialMinute,
    weather,
    cityPressure: clamp(pressure * 0.75),
    publicAttention: clamp((ledger.offlineState?.violence || 0) * 1.2),
    occultNoise: clamp(occult * 1.35),
    factions,
    recentEvents: [],
    npcAgents: initializeNpcAgents(ledger, key),
    scheduledEvents: [],
  };
}

export function initializeWorldSimulation(origin: GameOrigin, ledger: LedgerData): WorldSimulationState {
  return baseWorld(origin, ledger);
}

function upgradeWorld(previous: WorldSimulationState | undefined, origin: GameOrigin, ledger: LedgerData): WorldSimulationState {
  if (!previous) return baseWorld(origin, ledger);
  const key = campaignKey(origin, ledger);
  return {
    ...previous,
    version: 2,
    factions: previous.factions || baseFactions(),
    recentEvents: [...(previous.recentEvents || [])],
    npcAgents: syncNpcAgents(previous.npcAgents || {}, ledger, key),
    scheduledEvents: (previous.scheduledEvents || []).map((event) => ({ ...event })),
  };
}

function nextWeather(current: WorldWeather, key: string, turn: number): WorldWeather {
  const roll = seeded01(`${key}:weather:${turn}`);
  if (roll < 0.66) return current;

  const transitions: Record<WorldWeather, WorldWeather[]> = {
    fog: ["drizzle", "smog", "clear", "fog"],
    drizzle: ["fog", "rain", "smog", "drizzle"],
    rain: ["drizzle", "storm", "fog", "rain"],
    storm: ["rain", "drizzle", "fog"],
    smog: ["fog", "drizzle", "clear", "smog"],
    clear: ["fog", "smog", "drizzle", "clear"],
  };
  return choose(transitions[current], `${key}:weather-choice:${turn}`);
}

function classifyAction(action: string) {
  const t = action.toLowerCase();
  return {
    violent: /mato|matar|ataco|atacar|bato|golpe|arma|tiro|esfaque|briga|amea[cç]o/.test(t),
    public: /pol[ií]cia|delegacia|autoridade|jornal|imprensa|denuncio|denunciar|grito|pra[cç]a/.test(t),
    secretive: /escond|furtiv|sil[eê]ncio|disfar|sigo|seguir|vigio|observo de longe|sem ser visto/.test(t),
    occult: /ritual|oculto|s[ií]mbolo|mistic|artefato|invoca|espiritual|sobrenatural/.test(t),
    lawful: /pol[ií]cia|autoridade|mandado|procedimento|registro|formalizo|denuncio/.test(t),
    deceptive: /minto|mentir|blefo|finjo|fingir|engano|enganar/.test(t),
  };
}

function factionMove(
  id: FactionId,
  faction: WorldFactionState,
  turn: number,
  location: string,
  key: string
): { faction: WorldFactionState; event?: WorldEvent } {
  if (turn < 2 || turn - (faction.lastMoveTurn || 0) < 2) return { faction };

  const threshold = Math.min(0.72, 0.16 + faction.activity / 180 + faction.awareness / 260);
  if (seeded01(`${key}:faction:${id}:${turn}`) > threshold) return { faction };

  const moves: Record<FactionId, Array<{ title: string; detail: string; tone: WorldEvent["tone"] }>> = {
    authorities: [
      { title: "Batida discreta", detail: "Dois agentes fazem perguntas no distrito sem explicar quem procuram.", tone: "ominous" },
      { title: "Registro recolhido", detail: "Um livro de entradas desaparece de um balcão público antes do fechamento.", tone: "urgent" },
      { title: "Patrulha reforçada", detail: "Mais uniformes surgem nas ruas e as conversas baixam quando eles passam.", tone: "neutral" },
    ],
    church: [
      { title: "Sinos fora de hora", detail: "Uma igreja próxima toca os sinos brevemente sem cerimônia anunciada.", tone: "quiet" },
      { title: "Visita reservada", detail: "Clérigos entram num prédio comum e saem sem falar com curiosos.", tone: "ominous" },
      { title: "Portas fechadas", detail: "Uma capela encerra o atendimento mais cedo e mantém vigias na entrada.", tone: "neutral" },
    ],
    press: [
      { title: "Rumor impresso", detail: "Uma nota curta sobre incidentes estranhos circula numa edição vespertina.", tone: "neutral" },
      { title: "Repórter no distrito", detail: "Um jornalista oferece moedas em troca de nomes e horários.", tone: "quiet" },
      { title: "Versão conveniente", detail: "Os jornais publicam uma explicação simples demais para o que ocorreu.", tone: "ominous" },
    ],
    underworld: [
      { title: "Recado no submundo", detail: "Informantes começam a perguntar quem anda comprando respostas demais.", tone: "ominous" },
      { title: "Mercadoria movida", detail: "Caixas sem marca deixam o distrito antes do amanhecer.", tone: "urgent" },
      { title: "Porta que não abre", detail: "Um contato conhecido some e seu ponto habitual permanece fechado.", tone: "quiet" },
    ],
    "occult-network": [
      { title: "Símbolos apagados", detail: "Marcas incomuns desaparecem de uma parede durante a noite, raspadas até o tijolo.", tone: "ominous" },
      { title: "Compradores silenciosos", detail: "Objetos aparentemente banais passam a ser procurados por gente que paga sem negociar.", tone: "urgent" },
      { title: "Olhos sobre a investigação", detail: "A sensação de estar sendo observado surge em lugares onde não deveria haver ninguém.", tone: "ominous" },
    ],
  };

  const move = choose(moves[id], `${key}:faction-move:${id}:${turn}`);
  const event: WorldEvent = {
    id: `${id}-${turn}-${hashString(move.title).toString(36)}`,
    turn,
    title: move.title,
    detail: move.detail,
    location,
    tone: move.tone,
    source: "faction",
    sourceId: id,
  };

  return {
    faction: {
      ...faction,
      activity: clamp(faction.activity + 4, 0, 100),
      lastMove: move.title,
      lastMoveTurn: turn,
    },
    event,
  };
}

function targetLocationForAgenda(agent: WorldNpcAgent, ledger: LedgerData, key: string, turn: number): string {
  const visited = ledger.offlineState?.visitedLocations?.filter(Boolean) || [];
  const known = [...new Set([ledger.location, ...visited].filter(Boolean))];
  switch (agent.agenda) {
    case "seek-authorities": return "delegacia ou repartição das autoridades";
    case "seek-protection": return "santuário ou igreja do distrito";
    case "flee-town": return "estação, porto ou estrada para fora da cidade";
    case "alert-network": return "ponto de contato da rede oculta";
    case "conceal-evidence": return "arquivo secundário fora da rota habitual";
    case "recover-object": return ledger.location || agent.location;
    default: return known.length ? choose(known, `${key}:npc-location:${agent.id}:${turn}`) : agent.location;
  }
}

function maybeScheduleNpcMeeting(
  agent: WorldNpcAgent,
  schedules: WorldScheduledEvent[],
  ledger: LedgerData,
  key: string,
  turn: number
) {
  if (!agent.agenda || !["sell-information", "seek-protection", "test-player", "seek-authorities"].includes(agent.agenda)) return;
  if (schedules.some((event) => event.npcId === agent.id && event.status === "pending")) return;
  if (seeded01(`${key}:meeting:${agent.id}:${turn}`) > 0.31) return;
  const visited = ledger.offlineState?.visitedLocations?.filter(Boolean) || [];
  const location = visited.length ? choose(visited, `${key}:meeting-location:${agent.id}:${turn}`) : ledger.location;
  schedules.push({
    id: `meeting:${agent.id}:${turn}`,
    title: `Recado de ${agent.name}`,
    detail: `${agent.name} deixou um encontro marcado e não explicou por que não podia falar imediatamente.`,
    location: location || agent.location,
    dueTick: turn + 1,
    expiresTick: turn + 3,
    status: "pending",
    npcId: agent.id,
  });
}

function advanceNpcAgents(
  agents: Record<string, WorldNpcAgent>,
  schedules: WorldScheduledEvent[],
  ledger: LedgerData,
  key: string,
  turn: number,
  cityPressure: number,
  occultHostility: number
): { agents: Record<string, WorldNpcAgent>; events: WorldEvent[] } {
  const next = Object.fromEntries(Object.entries(agents).map(([id, agent]) => [id, { ...agent }]));
  const events: WorldEvent[] = [];

  for (const agent of Object.values(next)) {
    if (["dead", "left-city"].includes(agent.status) || turn < agent.nextMoveTurn) continue;
    const roll = seeded01(`${key}:npc-move:${agent.id}:${turn}`);
    const target = targetLocationForAgenda(agent, ledger, key, turn);
    agent.lastMoveTurn = turn;
    agent.nextMoveTurn = turn + 2 + Math.floor(seeded01(`${key}:npc-next:${agent.id}:${turn}`) * 4);
    agent.exposure = clamp(agent.exposure + cityPressure * 0.035 + occultHostility * 0.025);

    if (agent.agenda === "flee-town" && roll > 0.42) {
      agent.status = "left-city";
      agent.location = target;
      agent.lastAction = "deixou a cidade";
      events.push({ id: `npc:${agent.id}:left:${turn}`, turn, title: "Uma cadeira vazia", detail: `${agent.name} deixou a cidade antes que alguém pudesse impedi-lo.`, location: target, tone: "urgent", source: "npc", sourceId: agent.id });
      continue;
    }

    const lethalWindow = cityPressure >= 86 && occultHostility >= 74 && agent.exposure >= 66;
    if (lethalWindow && roll < 0.025) {
      agent.status = "dead";
      agent.location = target;
      agent.lastAction = "foi encontrado morto enquanto seguia a própria agenda";
      events.push({ id: `npc:${agent.id}:dead:${turn}`, turn, title: "Uma linha foi cortada", detail: `${agent.name} foi encontrado morto. A história não esperou o jogador chegar.`, location: target, tone: "urgent", source: "npc", sourceId: agent.id });
      continue;
    }
    if (agent.exposure >= 55 && roll < 0.14) {
      agent.status = "missing";
      agent.location = target;
      agent.lastAction = "desapareceu da rotina conhecida";
      events.push({ id: `npc:${agent.id}:missing:${turn}`, turn, title: "Ninguém sabe onde está", detail: `${agent.name} desapareceu da rotina conhecida. O motivo ainda não é claro.`, location: target, tone: "ominous", source: "npc", sourceId: agent.id });
      continue;
    }

    agent.status = agent.agenda === "conceal-evidence" || agent.agenda === "alert-network" ? "hidden" : "active";
    agent.location = target;
    agent.lastAction = agent.agenda ? `avançou a agenda: ${agent.agenda}` : "mudou de lugar por conta própria";
    if (roll > 0.64) {
      events.push({ id: `npc:${agent.id}:move:${turn}`, turn, title: "Movimento fora de cena", detail: `${agent.name} não ficou esperando: mudou de posição enquanto a investigação avançava.`, location: target, tone: "quiet", source: "npc", sourceId: agent.id });
    }
    maybeScheduleNpcMeeting(agent, schedules, ledger, key, turn);
  }

  return { agents: next, events };
}

function processSchedules(
  schedules: WorldScheduledEvent[],
  ledger: LedgerData,
  turn: number
): { schedules: WorldScheduledEvent[]; events: WorldEvent[] } {
  const next = schedules.map((event) => ({ ...event }));
  const events: WorldEvent[] = [];
  const here = normalizeText(ledger.location || "");

  for (const event of next) {
    if (event.status !== "pending" || turn < event.dueTick) continue;
    const target = normalizeText(event.location);
    const words = target.split(" ").filter((word) => word.length >= 5);
    const atLocation = words.some((word) => here.includes(word));

    if (atLocation && turn <= event.expiresTick) {
      event.status = "triggered";
      events.push({ id: `${event.id}:triggered`, turn, title: event.title, detail: `${event.detail} Você chegou enquanto a janela ainda estava aberta.`, location: event.location, tone: "urgent", source: "schedule", sourceId: event.id });
      continue;
    }
    if (turn > event.expiresTick) {
      event.status = "missed";
      events.push({ id: `${event.id}:missed`, turn, title: "Você chegou tarde", detail: `O encontro em ${event.location} passou. Quem esperava por você já tomou outra decisão.`, location: event.location, tone: "ominous", source: "schedule", sourceId: event.id });
      continue;
    }
    if (!event.announced) {
      event.announced = true;
      events.push({ id: `${event.id}:announced`, turn, title: event.title, detail: `${event.detail} Local: ${event.location}.`, location: event.location, tone: "quiet", source: "schedule", sourceId: event.id });
    }
  }

  return { schedules: next.slice(-24), events };
}

export function advanceWorldSimulation(
  previous: WorldSimulationState | undefined,
  origin: GameOrigin,
  ledger: LedgerData,
  action: string,
  externalEvents: WorldEvent[] = []
): WorldSimulationState {
  const base = upgradeWorld(previous, origin, ledger);
  const key = campaignKey(origin, ledger);
  const turn = Math.max(base.tick + 1, ledger.offlineState?.turn || base.tick + 1);
  const actionClass = classifyAction(action);
  const engine = ledger.offlineState;

  const elapsed = 18 + Math.floor(seeded01(`${key}:elapsed:${turn}`) * 43);
  const totalMinutes = base.minuteOfDay + elapsed;
  const dayAdvance = Math.floor(totalMinutes / (24 * 60));
  const minuteOfDay = totalMinutes % (24 * 60);

  const publicAttention = clamp(
    base.publicAttention +
      (actionClass.violent ? 9 : 0) +
      (actionClass.public ? 7 : 0) -
      (actionClass.secretive ? 2 : 0) +
      Math.max(0, (engine?.violence || 0) - 12) * 0.08
  );
  const occultNoise = clamp(
    base.occultNoise +
      (actionClass.occult ? 8 : 0) +
      Math.max(0, (engine?.occultExposure || 0) - base.occultNoise * 0.35) * 0.16
  );
  const cityPressure = clamp(
    base.cityPressure +
      (actionClass.violent ? 5 : 0) +
      (actionClass.deceptive ? 1 : 0) +
      Math.max(0, (engine?.pressure || 0) - base.cityPressure * 0.5) * 0.1 -
      (actionClass.secretive ? 1 : 0)
  );

  const factions: Record<FactionId, WorldFactionState> = {
    authorities: { ...base.factions.authorities },
    church: { ...base.factions.church },
    press: { ...base.factions.press },
    underworld: { ...base.factions.underworld },
    "occult-network": { ...base.factions["occult-network"] },
  };

  factions.authorities.awareness = clamp(factions.authorities.awareness + (actionClass.violent ? 7 : 0) + (actionClass.public ? 8 : 0) + (actionClass.lawful ? 2 : 0));
  factions.authorities.hostility = clamp(factions.authorities.hostility + (actionClass.violent ? 4 : 0) - (actionClass.lawful ? 2 : 0));
  factions.press.awareness = clamp(factions.press.awareness + (actionClass.public ? 6 : 0) + publicAttention * 0.025);
  factions.underworld.awareness = clamp(factions.underworld.awareness + (actionClass.secretive ? 2 : 0) + (actionClass.violent ? 4 : 0));
  factions.underworld.hostility = clamp(factions.underworld.hostility + (actionClass.violent ? 2 : 0));
  factions["occult-network"].awareness = clamp(factions["occult-network"].awareness + (actionClass.occult ? 8 : 0) + occultNoise * 0.035);
  factions["occult-network"].hostility = clamp(factions["occult-network"].hostility + Math.max(0, (engine?.evidence || 0) - 25) * 0.02);
  factions.church.awareness = clamp(factions.church.awareness + (actionClass.occult ? 3 : 0) + occultNoise * 0.018);

  const generatedCandidates: WorldEvent[] = [];
  (Object.keys(factions) as FactionId[]).forEach((id) => {
    const moved = factionMove(id, factions[id], turn, ledger.location, key);
    factions[id] = moved.faction;
    if (moved.event) generatedCandidates.push(moved.event);
  });

  // V5: o mundo pode fazer várias coisas no mesmo turno, mas o jogador não precisa
  // receber cinco "notificações" concorrentes. Movimentos continuam registrados nas facções;
  // só os ecos mais relevantes entram na superfície narrativa daquele turno.
  const eventBudget = cityPressure >= 78 || occultNoise >= 78 || publicAttention >= 80 ? 2 : 1;
  const generated = generatedCandidates
    .map((event) => ({ event, rank: seeded01(`${key}:visible-faction-event:${turn}:${event.id}`) + (event.tone === "urgent" ? 0.35 : event.tone === "ominous" ? 0.18 : 0) }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, eventBudget)
    .map(({ event }) => event);

  const schedules = (base.scheduledEvents || []).map((event) => ({ ...event }));
  const npcResult = advanceNpcAgents(
    base.npcAgents || {},
    schedules,
    ledger,
    key,
    turn,
    cityPressure,
    factions["occult-network"].hostility
  );
  const scheduleResult = processSchedules(schedules, ledger, turn);

  const normalizedExternal = externalEvents.map((event) => ({ ...event, turn: event.turn || turn, source: event.source || "story" as const }));
  const recentEvents = [...base.recentEvents, ...generated, ...npcResult.events, ...scheduleResult.events, ...normalizedExternal].slice(-12);

  return {
    version: 2,
    tick: turn,
    day: base.day + dayAdvance,
    minuteOfDay,
    weather: nextWeather(base.weather, key, turn),
    cityPressure,
    publicAttention,
    occultNoise,
    factions,
    recentEvents,
    npcAgents: npcResult.agents,
    scheduledEvents: scheduleResult.schedules,
    lastPlayerAction: action,
  };
}

export function formatWorldClock(world: WorldSimulationState | undefined): string | null {
  if (!world) return null;
  const h = Math.floor(world.minuteOfDay / 60).toString().padStart(2, "0");
  const m = (world.minuteOfDay % 60).toString().padStart(2, "0");
  return `Dia ${world.day} · ${h}:${m}`;
}

export function describeWeather(weather: WorldWeather): string {
  return {
    fog: "névoa cerrada",
    drizzle: "garoa fina",
    rain: "chuva persistente",
    storm: "tempestade",
    smog: "fumaça de carvão",
    clear: "céu incomumente limpo",
  }[weather];
}
