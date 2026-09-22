import React from "react";
import { LocationSceneKey } from "../utils/locationBackground";
import { AmbientMood } from "../utils/ambientMood";

interface LocationBackdropProps {
  sceneKey: LocationSceneKey;
  mood: AmbientMood;
}

// Fotos reais disponíveis, por local + clima (dia/noite). Quando não existe um par,
// cai automaticamente no desenho vetorial (SVG) mais abaixo — nunca quebra, nunca some.
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
 * Camada de fundo atrás do texto da cena. Usa uma fotografia real quando existe
 * uma que combine com o local + clima atuais; caso contrário, usa um desenho
 * vetorial leve (SVG) como reserva — nunca deixa a cena sem ambientação.
 */
export const LocationBackdrop: React.FC<LocationBackdropProps> = ({ sceneKey, mood }) => {
  const photoUrl = PHOTO_MANIFEST[sceneKey]?.[mood];

  if (photoUrl) {
    return (
      <div className="location-backdrop absolute inset-0 rounded-lg overflow-hidden pointer-events-none" aria-hidden="true">
        {/* O palco visual tem altura própria; o crescimento do texto não altera o enquadramento. */}
        <div
          className="location-backdrop-image absolute inset-x-0 top-0 opacity-[0.28]"
          style={{ backgroundImage: `url(${photoUrl})` }}
        />
        {/* Profundidade cinematográfica: luz no alto, leitura no centro e fade no rodapé. */}
        <div className="location-backdrop-atmosphere absolute inset-0" />
        <div className="location-backdrop-vignette absolute inset-0" />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none opacity-[0.08] text-[#c9a875]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMax slice"
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        {sceneKey === "docas" && (
          <g>
            {/* Mastros e cordoalha */}
            <line x1="90" y1="60" x2="90" y2="340" />
            <line x1="90" y1="90" x2="180" y2="140" />
            <line x1="90" y1="130" x2="10" y2="170" />
            <line x1="260" y1="40" x2="260" y2="340" />
            <line x1="260" y1="75" x2="360" y2="120" />
            {/* Caixotes empilhados no cais */}
            <rect x="420" y="270" width="60" height="60" />
            <rect x="485" y="290" width="50" height="40" />
            <rect x="440" y="230" width="55" height="42" />
            {/* Linha d'água */}
            <line x1="0" y1="345" x2="800" y2="345" strokeDasharray="4 8" opacity="0.6" />
          </g>
        )}

        {sceneKey === "beco" && (
          <g>
            {/* Paredes convergindo em perspectiva */}
            <polyline points="0,30 260,110 260,400" />
            <polyline points="800,30 540,110 540,400" />
            {/* Janelas espaçadas */}
            <rect x="60" y="140" width="26" height="34" />
            <rect x="130" y="170" width="24" height="30" />
            <rect x="640" y="150" width="26" height="34" />
            <rect x="700" y="190" width="22" height="28" />
            {/* Fio de varal cruzando o beco */}
            <path d="M120,120 Q400,60 680,130" strokeDasharray="2 6" opacity="0.7" />
          </g>
        )}

        {sceneKey === "quarto" && (
          <g>
            {/* Moldura de janela */}
            <rect x="560" y="60" width="160" height="200" />
            <line x1="640" y1="60" x2="640" y2="260" />
            <line x1="560" y1="160" x2="720" y2="160" />
            {/* Cama simples */}
            <rect x="60" y="260" width="200" height="70" />
            <line x1="60" y1="260" x2="60" y2="220" />
            {/* Mesa e vela */}
            <rect x="330" y="300" width="90" height="8" />
            <line x1="350" y1="308" x2="350" y2="360" />
            <line x1="400" y1="308" x2="400" y2="360" />
            <circle cx="375" cy="285" r="4" />
          </g>
        )}

        {sceneKey === "biblioteca" && (
          <g>
            {/* Estantes com livros */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={40 + i * 130} y="40" width="90" height="320" />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) =>
              [0, 1, 2, 3].map((j) => (
                <line
                  key={`${i}-${j}`}
                  x1={50 + i * 130}
                  y1={80 + j * 60}
                  x2={120 + i * 130}
                  y2={80 + j * 60}
                  opacity="0.5"
                />
              ))
            )}
          </g>
        )}

        {sceneKey === "taverna" && (
          <g>
            {/* Barris */}
            <ellipse cx="90" cy="300" rx="40" ry="18" />
            <rect x="50" y="240" width="80" height="60" />
            <ellipse cx="90" cy="240" rx="40" ry="18" />
            {/* Mesa longa e bancos */}
            <rect x="220" y="290" width="360" height="10" />
            <line x1="250" y1="300" x2="250" y2="340" />
            <line x1="550" y1="300" x2="550" y2="340" />
            {/* Lampião pendurado */}
            <line x1="650" y1="40" x2="650" y2="110" />
            <circle cx="650" cy="130" r="16" />
          </g>
        )}

        {sceneKey === "rua" && (
          <g>
            {/* Fileira de prédios */}
            <polyline points="0,180 0,400" />
            <polyline points="150,120 150,400" />
            <polyline points="150,120 0,180" />
            <polyline points="380,150 380,400" />
            <polyline points="380,150 150,120" />
            <polyline points="600,100 600,400" />
            <polyline points="600,100 380,150" />
            <polyline points="800,140 800,400" />
            <polyline points="800,140 600,100" />
            {/* Poste de gás */}
            <line x1="480" y1="220" x2="480" y2="380" />
            <circle cx="480" cy="205" r="12" />
          </g>
        )}

        {sceneKey === "generico" && (
          <g opacity="0.8">
            {/* Névoa abstrata em camadas — fallback neutro */}
            <path d="M0,300 Q200,260 400,300 T800,300" />
            <path d="M0,340 Q200,310 400,340 T800,340" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
};
