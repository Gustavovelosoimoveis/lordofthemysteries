import type { GameOrigin, LedgerData } from "../types";
import {
  OFFLINE_ENGINE_STATS,
  runOfflineTurn,
  startOfflineChronicle,
  type OfflineTurnResult,
} from "../utils/offlineEngine";
import { advanceWorldSimulation, initializeWorldSimulation } from "./worldSimulation";

export interface LocalRuntimeResult extends Omit<OfflineTurnResult, "ledger"> {
  ledger: LedgerData;
}

/**
 * V4 Runtime Boundary
 * -------------------
 * A interface React não precisa mais saber como o Motor Local inicializa mundo,
 * avança relógio ou persiste simulação. Esta camada vira o contrato entre a UI
 * e qualquer renderer futuro (React, Phaser, Pixi ou outro canvas).
 */
export function startLocalRuntime(origin: GameOrigin, initialLedger: LedgerData): LocalRuntimeResult {
  const result = startOfflineChronicle(origin, initialLedger);
  const effectiveOrigin = { ...origin, location: result.ledger.location };
  const worldState = initializeWorldSimulation(effectiveOrigin, result.ledger);

  return {
    ...result,
    ledger: {
      ...result.ledger,
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
  const worldState = advanceWorldSimulation(
    currentLedger.worldState,
    origin,
    result.ledger,
    action
  );

  return {
    ...result,
    ledger: {
      ...result.ledger,
      worldState,
    },
  };
}

export const LOCAL_RUNTIME_STATS = OFFLINE_ENGINE_STATS;
