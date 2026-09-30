import React, { useMemo } from "react";

interface SurrealParticlesOverlayProps {
  intensity?: number;
  seed?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  delay: number;
  duration: number;
  orbit: number;
  color: string;
}

const COLORS = ["#f2d39b", "#9ed2cf", "#d98d87", "#bfa5e8", "#f0eee0"];

function seeded(seed: number, index: number, salt: number): number {
  const value = Math.sin(seed * 31.17 + index * 17.43 + salt * 11.91) * 43758.5453;
  return value - Math.floor(value);
}

function buildParticles(seed: number): Particle[] {
  return Array.from({ length: 34 }, (_, index) => ({
    id: index,
    x: 80 + seeded(seed, index, 1) * 840,
    y: 35 + seeded(seed, index, 2) * 250,
    radius: 0.8 + seeded(seed, index, 3) * 2.8,
    opacity: 0.28 + seeded(seed, index, 4) * 0.58,
    delay: -(seeded(seed, index, 5) * 12),
    duration: 5 + seeded(seed, index, 6) * 9,
    orbit: 8 + seeded(seed, index, 7) * 24,
    color: COLORS[index % COLORS.length],
  }));
}

/**
 * Anomalia atmosférica discreta: partículas que orbitam, brilham e se ligam
 * em padrões impossíveis. É SVG/CSS, portanto não exige imagens ou vídeo.
 */
export const SurrealParticlesOverlay: React.FC<SurrealParticlesOverlayProps> = ({
  intensity = 0.8,
  seed = 23,
}) => {
  const particles = useMemo(() => buildParticles(seed), [seed]);
  const safeIntensity = Math.max(0, Math.min(1, intensity));

  return (
    <div className="surreal-particles-overlay" style={{ opacity: safeIntensity }} aria-hidden="true">
      <svg className="surreal-particles-svg" viewBox="0 0 1000 360" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <radialGradient id="surreal-core-glow">
            <stop offset="0" stopColor="#f4d79c" stopOpacity="0.34" />
            <stop offset="0.38" stopColor="#a6d4cc" stopOpacity="0.11" />
            <stop offset="1" stopColor="#0a0d11" stopOpacity="0" />
          </radialGradient>
          <filter id="surreal-particle-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="505" cy="155" rx="250" ry="135" fill="url(#surreal-core-glow)" />
        <g className="surreal-orbit surreal-orbit-one">
          <ellipse cx="505" cy="155" rx="190" ry="72" fill="none" stroke="#d9bc83" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 12" />
          <ellipse cx="505" cy="155" rx="285" ry="118" fill="none" stroke="#9bc8c2" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="1 18" />
        </g>
        <g className="surreal-orbit surreal-orbit-two">
          <ellipse cx="505" cy="155" rx="120" ry="205" fill="none" stroke="#d98d87" strokeOpacity="0.11" strokeWidth="1" strokeDasharray="3 16" />
        </g>

        <path className="surreal-constellation" d="M125 94 L245 145 L360 68 L505 155 L665 92 L820 188 L905 112" />
        <path className="surreal-constellation surreal-constellation-alt" d="M210 258 L345 196 L505 155 L610 245 L780 218" />

        {particles.map((particle) => (
          <g key={particle.id} className="surreal-particle" style={{ animationDelay: `${particle.delay}s`, animationDuration: `${particle.duration}s` }}>
            <circle cx={particle.x} cy={particle.y} r={particle.radius * 4.5} fill={particle.color} opacity={particle.opacity * 0.16} />
            <circle cx={particle.x} cy={particle.y} r={particle.radius} fill={particle.color} opacity={particle.opacity} filter="url(#surreal-particle-glow)" />
            <circle cx={particle.x} cy={particle.y} r={particle.radius * 0.35} fill="#fff8df" opacity="0.9" />
          </g>
        ))}

        <g className="surreal-glyph surreal-glyph-one" transform="translate(505 155)">
          <circle r="22" fill="none" stroke="#f0d39a" strokeOpacity="0.36" strokeWidth="1" strokeDasharray="1 6" />
          <path d="M0 -16 L5 -3 L17 0 L5 4 L0 17 L-5 4 L-17 0 L-5 -3 Z" fill="none" stroke="#f0d39a" strokeOpacity="0.6" strokeWidth="1" />
        </g>
        <g className="surreal-glyph surreal-glyph-two" transform="translate(790 92)">
          <path d="M0 -13 L9 9 L-9 9 Z M-12 -3 L12 -3" fill="none" stroke="#a9d6cf" strokeOpacity="0.46" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};

export default SurrealParticlesOverlay;
