import React from "react";
import { LocationSceneKey } from "../utils/locationBackground";
import { AmbientMood } from "../utils/ambientMood";
import { resolveScenePhoto } from "../game/sceneDirector";
import { StreetLifeOverlay } from "./StreetLifeOverlay";
import { SurrealParticlesOverlay } from "./SurrealParticlesOverlay";

interface LocationBackdropProps {
  sceneKey: LocationSceneKey;
  mood: AmbientMood;
}

/**
 * Fundo das páginas da crônica. A V4 centraliza a seleção de arte no Scene Director
 * para que a página e a cena cinematográfica nunca discordem sobre o ambiente atual.
 */
export const LocationBackdrop: React.FC<LocationBackdropProps> = ({ sceneKey, mood }) => {
  const photoUrl = resolveScenePhoto(sceneKey, mood);

  return (
    <div className="location-backdrop absolute inset-0 rounded-lg overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="location-backdrop-image absolute inset-x-0 top-0 opacity-[0.42]"
        style={{ backgroundImage: `url(${photoUrl})` }}
      />
      <div className="location-backdrop-atmosphere absolute inset-0" />
      <SurrealParticlesOverlay intensity={sceneKey === "rua" ? 0.82 : 0.6} seed={sceneKey.length * 17 + mood.length} />
      {sceneKey === "rua" && <StreetLifeOverlay />}
      <div className="location-backdrop-vignette absolute inset-0" />
    </div>
  );
};
