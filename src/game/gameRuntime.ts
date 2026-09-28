import type { GameOrigin, LedgerData } from "../types";
import {
  OFFLINE_ENGINE_STATS,
  runOfflineTurn,
  startOfflineChronicle,
  type OfflineTurnResult,
} from "../utils/offlineEngine";
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

/**
 * V4 Runtime Boundary
 * -------------------
 * A interface React não precisa saber como o Motor Local inicializa mundo,
 * avança relógio, cruza histórias ou persiste simulação. Esta camada é o contrato
 * entre a UI e qualquer renderer futuro (React, Phaser, Pixi ou outro canvas).
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

  return {
    ...result,
    ledger: {
      ...ledgerWithStories,
      worldState,
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

  return {
    ...result,
    ledger: {
      ...ledgerWithSharedConsequences,
      worldState,
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
};
