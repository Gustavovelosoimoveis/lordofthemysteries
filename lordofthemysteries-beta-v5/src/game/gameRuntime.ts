import type { GameOrigin, LedgerData } from "../types";
import {
  OFFLINE_ENGINE_STATS,
  runOfflineTurn,
  startOfflineChronicle,
  type OfflineTurnResult,
} from "../utils/offlineEngine";
import {
  DRAMATIC_DIRECTOR_STATS,
  advanceDramaticDirector,
  initializeDramaticDirector,
  type DramaticPulse,
} from "./dramaticDirector";
import {
  advanceSharedStoryWorld,
  getSharedStoryStats,
  initializeSharedStoryWorld,
  mergeExternalStorySignals,
  type SharedStorySignal,
} from "./sharedStoryWorld";
import {
  advanceWorldSimulation,
  initializeWorldSimulation,
  type WorldEvent,
} from "./worldSimulation";

export interface LocalRuntimeResult extends Omit<OfflineTurnResult, "ledger"> {
  ledger: LedgerData;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function storyEchoesAsWorldEvents(
  echoes: ReturnType<typeof advanceSharedStoryWorld>["echoes"],
  turn: number
): WorldEvent[] {
  return echoes.map((echo) => ({
    id: echo.id,
    turn,
    title: echo.title,
    detail: echo.detail,
    location: echo.location,
    tone: echo.tone,
    source: "story",
    sourceId: echo.sourceId,
  }));
}

function injectDramaticPulse(text: string, pulse?: DramaticPulse): string {
  if (!pulse) return text;
  const marker = "\n\n[DIÁLOGO]";
  const index = text.indexOf(marker);
  if (index < 0) return `${text}\n\n${pulse.text}`;
  return `${text.slice(0, index)}\n\n${pulse.text}${text.slice(index)}`;
}

/**
 * V5 Runtime Boundary
 * -------------------
 * React não conduz regras. O runtime coordena motor narrativo, mundo vivo,
 * cruzamentos de histórias e o diretor dramático. Isso mantém o projeto pronto
 * para outro renderer (Phaser/Pixi) ou backend online sem reescrever a lógica.
 */
export function startLocalRuntime(origin: GameOrigin, initialLedger: LedgerData): LocalRuntimeResult {
  const result = startOfflineChronicle(origin, initialLedger);
  const effectiveOrigin = { ...origin, location: result.ledger.location };
  const activeThreadId = result.ledger.offlineState?.startId || "iron-cross-room";
  const sharedStoryState = initializeSharedStoryWorld(effectiveOrigin, activeThreadId);
  const ledgerWithStories: LedgerData = {
    ...result.ledger,
    sharedStoryState,
  };
  const worldState = initializeWorldSimulation(effectiveOrigin, ledgerWithStories);
  const ledgerWithWorld: LedgerData = {
    ...ledgerWithStories,
    worldState,
  };
  const dramaticDirectorState = initializeDramaticDirector(ledgerWithWorld);

  return {
    ...result,
    ledger: {
      ...ledgerWithWorld,
      dramaticDirectorState,
    },
  };
}

export function runLocalRuntimeTurn(
  action: string,
  origin: GameOrigin,
  currentLedger: LedgerData
): LocalRuntimeResult {
  const result = runOfflineTurn(action, origin, currentLedger);
  const provisionalTurn = Math.max(
    (currentLedger.worldState?.tick || 0) + 1,
    result.ledger.offlineState?.turn || 1
  );

  const shared = advanceSharedStoryWorld(
    currentLedger.sharedStoryState,
    origin,
    result.ledger,
    action,
    provisionalTurn
  );

  const ledgerWithSharedConsequences: LedgerData = {
    ...result.ledger,
    clues: uniqueStrings([...(result.ledger.clues || []), ...shared.clues]),
    sharedStoryState: shared.state,
  };

  const worldState = advanceWorldSimulation(
    currentLedger.worldState,
    origin,
    ledgerWithSharedConsequences,
    action,
    storyEchoesAsWorldEvents(shared.echoes, provisionalTurn)
  );

  const ledgerBeforeDirector: LedgerData = {
    ...ledgerWithSharedConsequences,
    worldState,
  };

  const director = advanceDramaticDirector(
    currentLedger.dramaticDirectorState,
    currentLedger,
    ledgerBeforeDirector,
    action
  );

  return {
    ...result,
    text: injectDramaticPulse(result.text, director.pulse),
    ledger: {
      ...ledgerBeforeDirector,
      dramaticDirectorState: director.state,
    },
  };
}

/**
 * Gancho de sincronização futura: um backend online pode entregar sinais produzidos
 * por outros jogadores que compartilham o mesmo worldSeed. O runtime só faz merge;
 * não conhece HTTP, WebSocket, Render ou autenticação.
 */
export function ingestExternalStorySignals(
  ledger: LedgerData,
  signals: SharedStorySignal[]
): LedgerData {
  if (!ledger.sharedStoryState) return ledger;
  return {
    ...ledger,
    sharedStoryState: mergeExternalStorySignals(ledger.sharedStoryState, signals),
  };
}

export const LOCAL_RUNTIME_STATS = {
  ...OFFLINE_ENGINE_STATS,
  sharedWorld: getSharedStoryStats(),
  dramaticDirector: DRAMATIC_DIRECTOR_STATS,
};
