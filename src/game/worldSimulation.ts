import type { GameOrigin, LedgerData } from "../types";

export type WorldWeather = "fog" | "drizzle" | "rain" | "storm" | "smog" | "clear";
export type FactionId = "authorities" | "church" | "press" | "underworld" | "occult-network";

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
}

export interface WorldSimulationState {
  version: 1;
  tick: number;
  day: number;
  minuteOfDay: number;
  weather: WorldWeather;
  cityPressure: number;
  publicAttention: number;
  occultNoise: number;
  factions: Record<FactionId, WorldFactionState>;
  recentEvents: WorldEvent[];
  lastPlayerAction?: string;
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

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
  return ledger.offlineState?.campaignSeed || origin.campaignSeed || origin.id || "LOEN";
}

export function initializeWorldSimulation(origin: GameOrigin, ledger: LedgerData): WorldSimulationState {
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
    version: 1,
    tick: 0,
    day: 1,
    minuteOfDay: initialMinute,
    weather,
    cityPressure: clamp(pressure * 0.75),
    publicAttention: clamp((ledger.offlineState?.violence || 0) * 1.2),
    occultNoise: clamp(occult * 1.35),
    factions,
    recentEvents: [],
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

export function advanceWorldSimulation(
  previous: WorldSimulationState | undefined,
  origin: GameOrigin,
  ledger: LedgerData,
  action: string
): WorldSimulationState {
  const base = previous || initializeWorldSimulation(origin, ledger);
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

  const generated: WorldEvent[] = [];
  (Object.keys(factions) as FactionId[]).forEach((id) => {
    const moved = factionMove(id, factions[id], turn, ledger.location, key);
    factions[id] = moved.faction;
    if (moved.event) generated.push(moved.event);
  });

  const recentEvents = [...base.recentEvents, ...generated].slice(-8);

  return {
    version: 1,
    tick: turn,
    day: base.day + dayAdvance,
    minuteOfDay,
    weather: nextWeather(base.weather, key, turn),
    cityPressure,
    publicAttention,
    occultNoise,
    factions,
    recentEvents,
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
