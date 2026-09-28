import type { LedgerData, Message } from "../types";
import { parseGMResponse } from "../utils/parser";
import { getAmbientMood, type AmbientMood } from "../utils/ambientMood";
import { getLocationSceneKey, type LocationSceneKey } from "../utils/locationBackground";
import type { WorldSimulationState, WorldWeather } from "./worldSimulation";

export type SceneMotionPreset = "still" | "street" | "interior" | "waterfront" | "occult";

export interface SceneVisualState {
  signature: string;
  sceneKey: LocationSceneKey;
  mood: AmbientMood;
  photoUrl: string;
  locationLabel: string;
  statusLabel: string;
  weather: WorldWeather;
  dangerLevel: number;
  occultIntensity: number;
  pressure: number;
  motion: SceneMotionPreset;
  crimsonMoon: boolean;
  rainIntensity: number;
  fogIntensity: number;
  focalNpc?: string;
  phaseLabel: string;
}

const PHOTO_MANIFEST: Partial<Record<LocationSceneKey, Partial<Record<AmbientMood, string>>>> = {
  quarto: {
    "day-industrial": "/backgrounds/quarto_dia.webp",
    "night-crimson": "/backgrounds/quarto_noite.webp",
  },
  rua: {
    "day-industrial": "/backgrounds/rua_dia.webp",
    "night-crimson": "/backgrounds/rua_noite.webp",
  },
  praca: {
    "day-industrial": "/backgrounds/praca_dia.webp",
    "night-crimson": "/backgrounds/praca_noite.webp",
  },
  beco: { "night-crimson": "/backgrounds/beco_noite.webp" },
  escritorio: { "day-industrial": "/backgrounds/escritorio_dia.webp" },
  comercio: { "day-industrial": "/backgrounds/comercio_dia.webp" },
  santuario: { "night-crimson": "/backgrounds/santuario_noite.webp" },
};

const PHOTO_FALLBACKS: Record<LocationSceneKey, { day: string; night: string }> = {
  docas: { day: "/backgrounds/rua_dia.webp", night: "/backgrounds/rua_noite.webp" },
  beco: { day: "/backgrounds/rua_dia.webp", night: "/backgrounds/beco_noite.webp" },
  quarto: { day: "/backgrounds/quarto_dia.webp", night: "/backgrounds/quarto_noite.webp" },
  biblioteca: { day: "/backgrounds/escritorio_dia.webp", night: "/backgrounds/quarto_noite.webp" },
  taverna: { day: "/backgrounds/comercio_dia.webp", night: "/backgrounds/quarto_noite.webp" },
  rua: { day: "/backgrounds/rua_dia.webp", night: "/backgrounds/rua_noite.webp" },
  escritorio: { day: "/backgrounds/escritorio_dia.webp", night: "/backgrounds/quarto_noite.webp" },
  praca: { day: "/backgrounds/praca_dia.webp", night: "/backgrounds/praca_noite.webp" },
  comercio: { day: "/backgrounds/comercio_dia.webp", night: "/backgrounds/rua_noite.webp" },
  santuario: { day: "/backgrounds/praca_dia.webp", night: "/backgrounds/santuario_noite.webp" },
  generico: { day: "/backgrounds/rua_dia.webp", night: "/backgrounds/rua_noite.webp" },
};

export function resolveScenePhoto(sceneKey: LocationSceneKey, mood: AmbientMood): string {
  const exact = PHOTO_MANIFEST[sceneKey]?.[mood];
  if (exact) return exact;
  const period = mood === "night-crimson" ? "night" : "day";
  return PHOTO_FALLBACKS[sceneKey][period];
}

function motionFor(sceneKey: LocationSceneKey, occultIntensity: number): SceneMotionPreset {
  if (occultIntensity >= 65 || sceneKey === "santuario") return "occult";
  if (sceneKey === "docas") return "waterfront";
  if (["quarto", "biblioteca", "escritorio", "taverna", "comercio"].includes(sceneKey)) return "interior";
  if (["rua", "beco", "praca"].includes(sceneKey)) return "street";
  return "still";
}

function inferWeatherFromStatus(status: string): WorldWeather {
  const t = status.toLowerCase();
  if (/tempestade|tormenta|trov[aã]o/.test(t)) return "storm";
  if (/chuva forte|chuva intensa/.test(t)) return "rain";
  if (/garoa|chuvisco/.test(t)) return "drizzle";
  if (/fuma[cç]a|smog|carv[aã]o|n[eé]voa [aá]cida/.test(t)) return "smog";
  if (/limpo|c[eé]u aberto/.test(t)) return "clear";
  return "fog";
}

function inferFocalNpc(ledger: LedgerData): string | undefined {
  const focused = ledger.offlineState?.focusNpc;
  if (focused) return focused;
  const npcs = ledger.npcs || [];
  return npcs.length ? npcs[npcs.length - 1].name : undefined;
}

export function deriveSceneVisualState(
  latestAssistant: Message | undefined,
  ledger: LedgerData,
  world?: WorldSimulationState
): SceneVisualState {
  const parsed = latestAssistant
    ? latestAssistant.parsed || parseGMResponse(latestAssistant.content)
    : { scene: "", dialogue: "", worldStatus: ledger.timeAndWeather || "", dilemma: "" };

  const sourceText = `${ledger.location || ""} ${parsed.worldStatus || ""} ${parsed.scene || ""}`;
  const sceneKey = getLocationSceneKey(sourceText);
  const mood = getAmbientMood(parsed.worldStatus || ledger.timeAndWeather || "");
  const dangerLevel = Math.max(0, Math.min(100, Math.round((ledger.offlineState?.danger || 0) * 1.25 + (ledger.offlineState?.wounds || 0) * 12)));
  const occultIntensity = Math.max(0, Math.min(100, Math.round(world?.occultNoise ?? (ledger.offlineState?.occultExposure || 0) * 1.3)));
  const pressure = Math.max(0, Math.min(100, Math.round(world?.cityPressure ?? ledger.offlineState?.pressure ?? 0)));
  const weather = world?.weather || inferWeatherFromStatus(parsed.worldStatus || ledger.timeAndWeather || "");

  const rainIntensity = weather === "storm" ? 1 : weather === "rain" ? 0.75 : weather === "drizzle" ? 0.36 : 0;
  const fogIntensity = weather === "fog" ? 0.88 : weather === "smog" ? 0.76 : weather === "storm" ? 0.42 : 0.28;
  const phase = ledger.offlineState?.phase || 1;

  return {
    signature: `${sceneKey}:${mood}:${ledger.location}:${weather}:p${phase}`,
    sceneKey,
    mood,
    photoUrl: resolveScenePhoto(sceneKey, mood),
    locationLabel: ledger.location || "Loen",
    statusLabel: parsed.worldStatus || ledger.timeAndWeather || "O tempo parece suspenso.",
    weather,
    dangerLevel,
    occultIntensity,
    pressure,
    motion: motionFor(sceneKey, occultIntensity),
    crimsonMoon: mood === "night-crimson",
    rainIntensity,
    fogIntensity,
    focalNpc: inferFocalNpc(ledger),
    phaseLabel: phase <= 1 ? "Prólogo" : phase === 2 ? "Investigação" : phase === 3 ? "Convergência" : "Ato Final",
  };
}
