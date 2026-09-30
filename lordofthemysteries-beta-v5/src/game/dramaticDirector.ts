import type { LedgerData } from "../types";

export type DramaticBeatKind =
  | "hook"
  | "discovery"
  | "payoff"
  | "pressure"
  | "reversal"
  | "relationship"
  | "crossroads"
  | "quiet"
  | "pursuit";

export type NarrativePromiseStatus = "open" | "paid" | "missed";

export interface NarrativePromise {
  id: string;
  label: string;
  kind: "clue" | "person" | "object" | "question" | "crossover";
  introducedTurn: number;
  dueTurn: number;
  status: NarrativePromiseStatus;
  resolvedTurn?: number;
}

interface DirectorSnapshot {
  evidence: number;
  clues: number;
  secrets: number;
  branches: number;
  intersections: number;
  pressure: number;
  danger: number;
  wounds: number;
  phase: number;
  location: string;
  npcStates: string;
}

export interface DramaticDirectorState {
  version: 1;
  turn: number;
  tension: number;
  momentum: number;
  stagnation: number;
  beat: DramaticBeatKind;
  beatHistory: DramaticBeatKind[];
  currentGoal: string;
  currentLead: string;
  stakes: string;
  urgency: "baixa" | "crescente" | "alta" | "crítica";
  promises: NarrativePromise[];
  lastChangeSummary: string[];
  lastInterventionTurn: number;
  lastSnapshot: DirectorSnapshot;
}

export interface DramaticPulse {
  kind: DramaticBeatKind;
  title: string;
  text: string;
  tone: "quiet" | "mystery" | "urgent" | "danger";
}

export interface DramaticDirectorAdvanceResult {
  state: DramaticDirectorState;
  pulse?: DramaticPulse;
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

function compact(text: string | undefined, max = 132): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

function snapshot(ledger: LedgerData): DirectorSnapshot {
  const offline = ledger.offlineState;
  const npcStates = Object.values(ledger.worldState?.npcAgents || {})
    .map((npc) => `${npc.id}:${npc.status}:${npc.location}`)
    .sort()
    .join("|");

  return {
    evidence: offline?.evidence || 0,
    clues: ledger.clues?.length || 0,
    secrets: ledger.secretsDiscovered?.length || 0,
    branches: offline?.branchHistory?.length || 0,
    intersections: ledger.sharedStoryState?.intersections || 0,
    pressure: offline?.pressure || 0,
    danger: offline?.danger || 0,
    wounds: offline?.wounds || 0,
    phase: offline?.phase || 0,
    location: ledger.location || "Loen",
    npcStates,
  };
}

function phaseGoal(ledger: LedgerData): string {
  const state = ledger.offlineState;
  const phase = state?.phase || 0;
  const mysteries = ledger.mysteries || [];
  const latestMystery = compact(mysteries[mysteries.length - 1] || mysteries[0], 118);
  const lead = compact((ledger.clues || []).slice(-1)[0], 100);
  const focusNpc = state?.focusNpc;

  if (phase <= 0) {
    return latestMystery ? `Entender o incidente sem aceitar a primeira explicação: ${latestMystery}` : "Entender o que acabou de acontecer e sair da primeira cena com algo verificável.";
  }
  if (phase === 1) {
    if (focusNpc) return `Descobrir o que ${focusNpc} sabe — e por que ainda não contou tudo.`;
    return lead ? `Testar se a pista “${lead}” realmente pertence ao centro do caso.` : "Separar coincidência de padrão e identificar quem está conduzindo o caso por trás das cortinas.";
  }
  if (phase === 2) {
    return latestMystery ? `Ligar pessoas, provas e interesses antes que alguém feche a investigação: ${latestMystery}` : "Descobrir quem se beneficia do padrão e qual peça ainda está faltando.";
  }
  return "Escolher como encerrar o caso sabendo que toda saída preserva alguma coisa e sacrifica outra.";
}

function currentLead(ledger: LedgerData): string {
  const clues = ledger.clues || [];
  const secrets = ledger.secretsDiscovered || [];
  const events = ledger.worldState?.recentEvents || [];
  const latestEvent = events[events.length - 1];
  if (secrets.length) return compact(secrets[secrets.length - 1], 112);
  if (clues.length) return compact(clues[clues.length - 1], 112);
  if (latestEvent?.detail) return compact(latestEvent.detail, 112);
  const item = ledger.items?.[0]?.name;
  return item ? `O objeto “${item}” ainda não tem uma explicação segura.` : "Ainda falta uma pista concreta que sobreviva a uma segunda leitura.";
}

function stakesFor(ledger: LedgerData): string {
  const state = ledger.offlineState;
  const world = ledger.worldState;
  const wounds = state?.wounds || 0;
  const pressure = state?.pressure || 0;
  const danger = state?.danger || 0;
  const occult = state?.occultExposure || 0;
  const missing = Object.values(world?.npcAgents || {}).find((npc) => ["missing", "injured", "hidden"].includes(npc.status));
  const criticalSchedule = (world?.scheduledEvents || []).find((event) => event.status === "pending" && event.expiresTick <= (world.tick || 0) + 1);

  if (wounds >= 2) return "Seu corpo não aguenta outra decisão ruim do mesmo tamanho.";
  if (criticalSchedule) return `A janela para “${criticalSchedule.title}” está quase fechando.`;
  if (missing) return `${missing.name} já está fora da rotina normal; esperar pode transformar ausência em perda.`;
  if (pressure >= 82 || danger >= 82) return "A oposição já sabe o bastante sobre você para preparar o próximo encontro.";
  if (occult >= 8) return "Você já viu coisas demais para continuar tratando o oculto como superstição inofensiva.";
  if (pressure >= 55) return "O caso deixou de ser privado; outras pessoas começaram a reagir ao que você está fazendo.";
  return "Ainda há margem para errar — mas cada pista ignorada dá tempo para outra pessoa agir primeiro.";
}

function urgencyFor(tension: number, stakes: string): DramaticDirectorState["urgency"] {
  if (/quase fechando|não aguenta|já sabe o bastante/.test(stakes) || tension >= 82) return "crítica";
  if (tension >= 64) return "alta";
  if (tension >= 38) return "crescente";
  return "baixa";
}

function promiseId(label: string, turn: number): string {
  return `promise-${hashString(`${label}:${turn}`).toString(36)}`;
}

function seedPromises(ledger: LedgerData, turn: number): NarrativePromise[] {
  const values: Array<{ label: string; kind: NarrativePromise["kind"] }> = [];
  const clue = compact(ledger.clues?.[0], 100);
  const npc = ledger.npcs?.[0]?.name;
  const item = ledger.items?.[0]?.name;
  const mystery = compact(ledger.mysteries?.[0], 100);
  if (clue) values.push({ label: clue, kind: "clue" });
  if (npc) values.push({ label: npc, kind: "person" });
  if (item) values.push({ label: item, kind: "object" });
  if (mystery) values.push({ label: mystery, kind: "question" });

  return values.slice(0, 3).map((entry, index) => ({
    id: promiseId(entry.label, turn + index),
    label: entry.label,
    kind: entry.kind,
    introducedTurn: turn,
    dueTurn: turn + 3 + index * 2,
    status: "open",
  }));
}

function addPromise(promises: NarrativePromise[], label: string, kind: NarrativePromise["kind"], turn: number, seed: string): NarrativePromise[] {
  const clean = compact(label, 105);
  if (!clean) return promises;
  const normalized = clean.toLowerCase();
  if (promises.some((promise) => promise.label.toLowerCase() === normalized && promise.status === "open")) return promises;
  const offset = 3 + Math.floor(seeded01(`${seed}:${clean}:${turn}`) * 3);
  const nextPromise: NarrativePromise = {
    id: promiseId(clean, turn),
    label: clean,
    kind,
    introducedTurn: turn,
    dueTurn: turn + offset,
    status: "open",
  };
  return [...promises, nextPromise].slice(-8);
}

function diffSummary(previous: DirectorSnapshot, next: DirectorSnapshot, ledger: LedgerData): string[] {
  const changes: string[] = [];
  if (next.evidence > previous.evidence) changes.push(`Evidência +${next.evidence - previous.evidence}`);
  if (next.clues > previous.clues) changes.push(`${next.clues - previous.clues} nova${next.clues - previous.clues > 1 ? "s" : ""} pista${next.clues - previous.clues > 1 ? "s" : ""}`);
  if (next.secrets > previous.secrets) changes.push("Um segredo deixou de ser hipótese");
  if (next.intersections > previous.intersections) changes.push("Outra história tocou a sua");
  if (next.phase > previous.phase) changes.push("A investigação mudou de ato");
  if (next.location !== previous.location) changes.push(`Novo cenário: ${compact(next.location, 44)}`);
  if (next.wounds > previous.wounds) changes.push("Você saiu fisicamente pior");
  if (next.pressure >= previous.pressure + 8) changes.push("A oposição aumentou a pressão");
  if (next.pressure <= previous.pressure - 8) changes.push("Você recuperou margem de manobra");
  if (next.npcStates !== previous.npcStates) changes.push("Um NPC mudou de situação fora da sua vista");
  const recent = ledger.worldState?.recentEvents?.slice(-1)[0];
  if (recent && !changes.some((change) => change.includes("NPC"))) changes.push(compact(recent.title, 56));
  return changes.slice(0, 3);
}

function chooseBeat(
  previous: DirectorSnapshot,
  next: DirectorSnapshot,
  stagnation: number,
  changeSummary: string[],
  paidPromise: NarrativePromise | undefined,
  ledger: LedgerData
): DramaticBeatKind {
  if (paidPromise) return "payoff";
  if (next.phase > previous.phase) return "crossroads";
  if (next.intersections > previous.intersections || next.clues > previous.clues || next.secrets > previous.secrets) return "discovery";
  if (next.wounds > previous.wounds || next.pressure >= previous.pressure + 14) return "reversal";
  if (next.npcStates !== previous.npcStates || changeSummary.some((c) => /NPC/.test(c))) return "relationship";
  if (next.location !== previous.location && (next.danger > 45 || next.pressure > 50)) return "pursuit";
  if (stagnation >= 2) return "pressure";
  if ((ledger.offlineState?.danger || 0) >= 70 && changeSummary.length === 0) return "pressure";
  if (changeSummary.length === 0) return "quiet";
  return "hook";
}

function pulseFor(kind: DramaticBeatKind, state: DramaticDirectorState, paidPromise?: NarrativePromise): DramaticPulse | undefined {
  if (kind === "hook") return undefined;
  if (kind === "quiet" && state.stagnation < 1) return undefined;

  switch (kind) {
    case "payoff":
      return paidPromise ? {
        kind,
        title: "O detalhe volta",
        text: `Um elemento antigo deixa de ser decoração: “${paidPromise.label}”. Agora ele toca o centro do caso — e muda o peso do que veio depois.`,
        tone: "mystery",
      } : undefined;
    case "discovery":
      return {
        kind,
        title: "A investigação muda de eixo",
        text: `O caso acabou de ficar maior. ${state.currentLead}`,
        tone: "mystery",
      };
    case "reversal":
      return {
        kind,
        title: "A resposta cobra preço",
        text: `O avanço veio com custo. ${state.stakes}`,
        tone: "danger",
      };
    case "relationship":
      return {
        kind,
        title: "Alguém se moveu",
        text: "A investigação deixou de ser só sobre provas. Uma pessoa envolvida agora tem motivo próprio para ajudar, fugir, mentir ou agir antes de você.",
        tone: "mystery",
      };
    case "crossroads":
      return {
        kind,
        title: "Ponto de não retorno",
        text: "Há mais de um caminho plausível agora. Seguir um deles pode fechar outro — não por moralidade, mas porque tempo, confiança e informação são recursos finitos.",
        tone: "urgent",
      };
    case "pressure":
      return {
        kind,
        title: "O mundo não está esperando",
        text: `${state.stakes} Se você continuar sem alterar a situação, outra pessoa decidirá o próximo movimento.`,
        tone: "urgent",
      };
    case "pursuit":
      return {
        kind,
        title: "O tabuleiro se move",
        text: "Mudar de lugar não encerrou a cena anterior. Parte do perigo veio junto — ou chegou antes.",
        tone: "urgent",
      };
    case "quiet":
      return {
        kind,
        title: "Silêncio útil",
        text: "Por alguns minutos nada exige uma resposta imediata. É o tipo de intervalo em que uma contradição esquecida pode valer mais do que outra porta arrombada.",
        tone: "quiet",
      };
    default:
      return undefined;
  }
}

export function initializeDramaticDirector(ledger: LedgerData): DramaticDirectorState {
  const snap = snapshot(ledger);
  const baseTension = clamp(18 + snap.phase * 12 + snap.pressure * 0.32 + snap.danger * 0.42 + snap.wounds * 12);
  return {
    version: 1,
    turn: snap.phase === 0 ? 0 : ledger.offlineState?.turn || 0,
    tension: baseTension,
    momentum: 22,
    stagnation: 0,
    beat: "hook",
    beatHistory: ["hook"],
    currentGoal: phaseGoal(ledger),
    currentLead: currentLead(ledger),
    stakes: stakesFor(ledger),
    urgency: urgencyFor(baseTension, stakesFor(ledger)),
    promises: seedPromises(ledger, ledger.offlineState?.turn || 0),
    lastChangeSummary: ["A crônica começou"],
    lastInterventionTurn: -99,
    lastSnapshot: snap,
  };
}

export function advanceDramaticDirector(
  previousState: DramaticDirectorState | undefined,
  previousLedger: LedgerData,
  nextLedger: LedgerData,
  action: string
): DramaticDirectorAdvanceResult {
  const base = previousState || initializeDramaticDirector(previousLedger);
  const previous = base.lastSnapshot || snapshot(previousLedger);
  const next = snapshot(nextLedger);
  const turn = nextLedger.offlineState?.turn || base.turn + 1;
  const changes = diffSummary(previous, next, nextLedger);
  const significance = changes.length + Math.max(0, next.evidence - previous.evidence) + Math.max(0, next.branches - previous.branches);
  const stagnation = significance === 0 ? base.stagnation + 1 : 0;
  const momentum = clamp(base.momentum + significance * 13 - stagnation * 8 + (next.phase > previous.phase ? 15 : 0));

  let promises = base.promises.map((promise) => ({ ...promise }));
  const seed = nextLedger.offlineState?.campaignSeed || "LOEN";
  if (next.clues > previous.clues) {
    const newClue = (nextLedger.clues || []).slice(-1)[0];
    promises = addPromise(promises, newClue, "clue", turn, seed);
  }
  if (next.intersections > previous.intersections) {
    const signal = nextLedger.sharedStoryState?.signals?.filter((s) => s.status === "intersected").slice(-1)[0];
    promises = addPromise(promises, signal?.anchor || signal?.title || "um fio vindo de outra história", "crossover", turn, seed);
  }

  let paidPromise: NarrativePromise | undefined;
  const payoffTrigger = next.phase > previous.phase || next.secrets > previous.secrets || next.branches > previous.branches || next.intersections > previous.intersections;
  if (payoffTrigger) {
    const open = promises.filter((promise) => promise.status === "open" && promise.introducedTurn <= turn - 2);
    if (open.length) {
      paidPromise = open.sort((a, b) => a.introducedTurn - b.introducedTurn)[0];
      promises = promises.map((promise) => promise.id === paidPromise!.id ? { ...promise, status: "paid", resolvedTurn: turn } : promise);
    }
  }

  promises = promises.map((promise) => {
    if (promise.status === "open" && turn > promise.dueTurn + 2) {
      return { ...promise, status: "missed", resolvedTurn: turn };
    }
    return promise;
  });

  const targetTension = clamp(
    14 + next.phase * 13 + next.pressure * 0.35 + next.danger * 0.43 + next.wounds * 14 + (stagnation >= 2 ? 12 : 0)
  );
  // A curva respira: depois de um pico com avanço real, a tensão cai um pouco para o próximo pico ter peso.
  const breathing = base.tension >= 78 && significance >= 2 && next.wounds === previous.wounds ? 12 : 0;
  const tension = clamp(base.tension * 0.38 + targetTension * 0.62 - breathing);
  const stakes = stakesFor(nextLedger);
  const currentGoal = phaseGoal(nextLedger);
  const lead = currentLead(nextLedger);
  const beat = chooseBeat(previous, next, stagnation, changes, paidPromise, nextLedger);

  const state: DramaticDirectorState = {
    ...base,
    turn,
    tension,
    momentum,
    stagnation,
    beat,
    beatHistory: [...base.beatHistory, beat].slice(-12),
    currentGoal,
    currentLead: lead,
    stakes,
    urgency: urgencyFor(tension, stakes),
    promises,
    lastChangeSummary: changes.length ? changes : [compact(action, 64) ? "A situação não mudou de forma verificável" : "Nenhuma mudança verificável"],
    lastSnapshot: next,
  };

  let pulse = pulseFor(beat, state, paidPromise);
  // Evita transformar o diretor em narrador tagarela. Intervenções de pressão/silêncio têm cooldown.
  if (pulse && ["pressure", "quiet", "pursuit"].includes(beat) && turn - base.lastInterventionTurn < 2) {
    pulse = undefined;
  }
  if (pulse) state.lastInterventionTurn = turn;

  return { state, pulse };
}

export const DRAMATIC_DIRECTOR_STATS = {
  version: 1,
  beatKinds: 9,
  promiseMemory: true,
  milestonePacing: true,
};
