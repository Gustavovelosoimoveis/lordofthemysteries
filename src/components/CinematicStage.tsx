import React, { useMemo, useRef, useState } from "react";
import { Eye, MapPin, Moon, ShieldAlert, Sparkles, Wind } from "lucide-react";
import type { SceneVisualState } from "../game/sceneDirector";
import { describeWeather, formatWorldClock, type WorldSimulationState } from "../game/worldSimulation";

interface CinematicStageProps {
  scene: SceneVisualState;
  world?: WorldSimulationState;
  sanity: number;
}

const meterTone = (value: number) => {
  if (value >= 72) return "critical";
  if (value >= 42) return "warning";
  return "calm";
};

export const CinematicStage: React.FC<CinematicStageProps> = ({ scene, world, sanity }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const latestWorldEvent = useMemo(() => world?.recentEvents?.[world.recentEvents.length - 1], [world?.recentEvents]);
  const worldClock = formatWorldClock(world);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointer({ x, y });
  };

  return (
    <section
      key={scene.signature}
      ref={stageRef}
      className={`beta-cinematic-stage mood-${scene.mood} motion-${scene.motion}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
      aria-label={`Cena atual: ${scene.locationLabel}`}
    >
      <div
        className="beta-stage-photo"
        style={{
          backgroundImage: `url(${scene.photoUrl})`,
          transform: `scale(1.075) translate3d(${pointer.x * -7}px, ${pointer.y * -4}px, 0)`,
        }}
      />
      <div
        className="beta-stage-depth beta-stage-depth-far"
        style={{ transform: `translate3d(${pointer.x * -3}px, ${pointer.y * -2}px, 0)` }}
      />
      <div
        className="beta-stage-depth beta-stage-depth-near"
        style={{ transform: `translate3d(${pointer.x * 8}px, ${pointer.y * 4}px, 0)` }}
      />

      {scene.crimsonMoon && <div className="beta-crimson-moon" aria-hidden="true" />}
      <div className="beta-gaslight-bloom" aria-hidden="true" />

      {scene.rainIntensity > 0 && (
        <div className="beta-rain" style={{ opacity: Math.min(0.82, 0.18 + scene.rainIntensity * 0.62) }} aria-hidden="true" />
      )}
      <div className="beta-stage-fog" style={{ opacity: scene.fogIntensity }} aria-hidden="true">
        <div className="beta-stage-fog-a" />
        <div className="beta-stage-fog-b" />
      </div>
      {scene.occultIntensity >= 38 && (
        <div className="beta-occult-shimmer" style={{ opacity: Math.min(0.4, scene.occultIntensity / 250) }} aria-hidden="true" />
      )}
      <div className="beta-stage-vignette" aria-hidden="true" />
      <div className="beta-stage-grain" aria-hidden="true" />

      <div className="beta-stage-topline">
        <div className="beta-stage-location">
          <MapPin className="w-3.5 h-3.5" />
          <span>{scene.locationLabel}</span>
        </div>
        <div className="beta-stage-chapter">
          <span>{scene.phaseLabel}</span>
          <i />
          <span>{worldClock || "Crônica em andamento"}</span>
        </div>
      </div>

      <div className="beta-stage-bottom">
        <div className="beta-stage-titleblock">
          <div className="beta-stage-kicker">
            {scene.crimsonMoon ? <Moon className="w-3.5 h-3.5" /> : <Wind className="w-3.5 h-3.5" />}
            <span>{describeWeather(scene.weather)}</span>
          </div>
          <h2>{scene.statusLabel}</h2>
          {latestWorldEvent && (
            <div className={`beta-world-echo tone-${latestWorldEvent.tone}`}>
              <Eye className="w-3.5 h-3.5" />
              <span><strong>{latestWorldEvent.title}.</strong> {latestWorldEvent.detail}</span>
            </div>
          )}
        </div>

        <div className="beta-stage-instruments" aria-label="Instrumentos do mundo">
          <div className={`beta-instrument tone-${meterTone(scene.dangerLevel)}`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Perigo</span>
            <div><i style={{ width: `${scene.dangerLevel}%` }} /></div>
          </div>
          <div className={`beta-instrument tone-${meterTone(scene.occultIntensity)}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ruído oculto</span>
            <div><i style={{ width: `${scene.occultIntensity}%` }} /></div>
          </div>
          <div className={`beta-instrument tone-${meterTone(100 - sanity)}`}>
            <Eye className="w-3.5 h-3.5" />
            <span>Mente</span>
            <div><i style={{ width: `${Math.max(0, Math.min(100, sanity))}%` }} /></div>
          </div>
        </div>
      </div>
    </section>
  );
};
