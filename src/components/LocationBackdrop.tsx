import React from "react";
import { LocationSceneKey } from "../utils/locationBackground";
import { AmbientMood } from "../utils/ambientMood";
import { StreetLifeOverlay } from "./StreetLifeOverlay";
import { SurrealParticlesOverlay } from "./SurrealParticlesOverlay";

interface LocationBackdropProps {
  sceneKey: LocationSceneKey;
  mood: AmbientMood;
}

// Fotos reais disponíveis, por local + clima.
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
  beco: {
    "night-crimson": "/backgrounds/beco_noite.webp",
  },
  escritorio: {
    "day-industrial": "/backgrounds/escritorio_dia.webp",
  },
  comercio: {
    "day-industrial": "/backgrounds/comercio_dia.webp",
  },
  santuario: {
    "night-crimson": "/backgrounds/santuario_noite.webp",
  },
};

/**
 * Reserva fotográfica por tipo de cenário. Enquanto um local ainda não tem arte
 * própria, usamos a fotografia existente mais compatível — nunca mais os antigos
 * desenhos SVG de quadrados, caixotes, estantes ou linhas geométricas.
 */
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

function resolvePhoto(sceneKey: LocationSceneKey, mood: AmbientMood): string {
  const exact = PHOTO_MANIFEST[sceneKey]?.[mood];
  if (exact) return exact;

  // Lua Carmesim pede sempre uma composição noturna. Crepúsculo e tempestade
  // usam a reserva diurna até receberem artes próprias, mantendo a fotografia.
  const period = mood === "night-crimson" ? "night" : "day";
  return PHOTO_FALLBACKS[sceneKey][period];
}

/**
 * Camada de fundo atrás do texto da cena. Sempre resolve para uma fotografia.
 * Se a combinação exata ainda não existe, cai numa fotografia compatível em vez
 * de exibir placeholders vetoriais.
 */
export const LocationBackdrop: React.FC<LocationBackdropProps> = ({ sceneKey, mood }) => {
  const photoUrl = resolvePhoto(sceneKey, mood);

  return (
    <div className="location-backdrop absolute inset-0 rounded-lg overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="location-backdrop-image absolute inset-x-0 top-0 opacity-[0.46]"
        style={{ backgroundImage: `url(${photoUrl})` }}
      />
      <div className="location-backdrop-atmosphere absolute inset-0" />
      <SurrealParticlesOverlay intensity={sceneKey === "rua" ? 0.92 : 0.72} seed={sceneKey.length * 17 + mood.length} />
      {sceneKey === "rua" && <StreetLifeOverlay />}
      <div className="location-backdrop-vignette absolute inset-0" />
    </div>
  );
};
