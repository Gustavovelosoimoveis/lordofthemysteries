import React, { useMemo } from "react";

interface Pedestrian {
  id: number;
  startX: number;
  endX: number;
  baseY: number;
  scale: number;
  duration: number;
  delay: number;
  opacity: number;
  tone: string;
  accent: string;
  direction: 1 | -1;
}

interface StreetLifeOverlayProps {
  /** Número máximo de figuras simultâneas no cenário. */
  count?: number;
  /** Valor estável para variar a composição sem usar aleatoriedade a cada render. */
  seed?: number;
}

const TONES = ["#111821", "#17151a", "#211b19", "#0c1419", "#28201b"];
const ACCENTS = ["#8a6d3b", "#6f5540", "#9c7650", "#4d5960", "#765b48"];

function seededValue(seed: number, index: number, salt: number): number {
  const value = Math.sin(seed * 97.13 + index * 41.71 + salt * 13.37) * 43758.5453;
  return value - Math.floor(value);
}

function createPedestrians(count: number, seed: number): Pedestrian[] {
  return Array.from({ length: count }, (_, index) => {
    const direction: 1 | -1 = seededValue(seed, index, 1) > 0.5 ? 1 : -1;
    const startX = direction === 1 ? -95 : 1095;
    const endX = direction === 1 ? 1095 : -95;

    return {
      id: index,
      startX,
      endX,
      baseY: 204 + seededValue(seed, index, 2) * 94,
      scale: 0.58 + seededValue(seed, index, 3) * 0.5,
      duration: 20 + seededValue(seed, index, 4) * 18,
      delay: -(seededValue(seed, index, 5) * 32),
      opacity: 0.22 + seededValue(seed, index, 6) * 0.28,
      tone: TONES[index % TONES.length],
      accent: ACCENTS[index % ACCENTS.length],
      direction,
    };
  });
}

/**
 * Camada de vida urbana para a rua.
 *
 * As figuras são silhuetas SVG discretas, sem imagens externas ou canvas.
 * Cada uma atravessa o cenário em uma velocidade, escala e profundidade
 * diferentes, criando movimento sem interferir na narrativa.
 */
export const StreetLifeOverlay: React.FC<StreetLifeOverlayProps> = ({ count = 7, seed = 11 }) => {
  const pedestrians = useMemo(() => createPedestrians(Math.max(0, count), seed), [count, seed]);

  return (
    <div className="street-life-overlay" aria-hidden="true">
      <svg
        className="street-life-svg"
        viewBox="0 0 1000 360"
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="street-life-ground" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#080b0f" stopOpacity="0" />
            <stop offset="1" stopColor="#080b0f" stopOpacity="0.58" />
          </linearGradient>
          <filter id="street-life-softness" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.65" />
          </filter>
        </defs>

        <rect x="0" y="250" width="1000" height="110" fill="url(#street-life-ground)" />
        <path d="M0 303 C190 292 330 312 500 300 S820 294 1000 306" fill="none" stroke="#90734f" strokeOpacity="0.16" strokeWidth="2" />

        {pedestrians.map((person) => (
          <g
            key={person.id}
            opacity={person.opacity}
            filter="url(#street-life-softness)"
            style={{
              // A animação é declarada no SVG para não depender de largura de viewport.
              transformOrigin: `${person.startX}px ${person.baseY}px`,
            }}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              from={`${person.startX} ${person.baseY}`}
              to={`${person.endX} ${person.baseY}`}
              dur={`${person.duration}s`}
              begin={`${person.delay}s`}
              repeatCount="indefinite"
              calcMode="linear"
            />
            <g transform={`scale(${person.scale * person.direction} ${person.scale})`}>
              <circle cx="0" cy="-44" r="8" fill={person.tone} />
              <path d="M-8 -34 Q0 -39 8 -34 L12 0 L-12 0 Z" fill={person.tone} />
              <path d="M-7 0 L-13 47 M7 0 L13 47" fill="none" stroke={person.tone} strokeWidth="5" strokeLinecap="round" />
              <path d="M-7 -27 L-25 2 M7 -27 L24 -1" fill="none" stroke={person.tone} strokeWidth="4" strokeLinecap="round" />
              <path d="M-10 -22 Q0 -29 10 -22" fill="none" stroke={person.accent} strokeOpacity="0.65" strokeWidth="2" />
              <circle cx={person.direction * 8} cy="-46" r="1.5" fill={person.accent} opacity="0.7" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default StreetLifeOverlay;
