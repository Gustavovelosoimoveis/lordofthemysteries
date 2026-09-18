import React, { useEffect, useRef, useState } from "react";
import { GameOrigin } from "../types";
import {
  X,
  Scroll,
  Activity,
  Shield,
  Brain,
  Eye,
  MessageSquare,
  Sparkles,
  Info,
  User,
  HeartPulse,
  Edit2,
  Check,
} from "lucide-react";

interface InvestigatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  origin: GameOrigin | null;
  sanity?: number;
  onUpdatePlayerName?: (newName: string) => void;
}

interface AttributeMeta {
  key: keyof NonNullable<GameOrigin["attributes"]>;
  label: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  description: string;
  canonUsage: string;
}

const ATTRIBUTES_CONFIG: AttributeMeta[] = [
  {
    key: "vigor",
    label: "Vigor",
    icon: <Activity className="w-3.5 h-3.5" />,
    color: "#e06d53",
    glowColor: "rgba(224,109,83,0.3)",
    description: "Saúde, resistência a dores físicas, ferimentos e fadiga.",
    canonUsage: "Determina quanto dano o corpo suporta e a resistência a toxinas.",
  },
  {
    key: "destreza",
    label: "Destreza",
    icon: <Shield className="w-3.5 h-3.5" />,
    color: "#5c9ce6",
    glowColor: "rgba(92,156,230,0.3)",
    description: "Reflexos ágeis, coordenação motora, furtividade e esquiva.",
    canonUsage: "Essencial para fugas em vielas escuras e manejo de lâminas/armas.",
  },
  {
    key: "intelecto",
    label: "Intelecto",
    icon: <Brain className="w-3.5 h-3.5" />,
    color: "#a78bfa",
    glowColor: "rgba(167,139,250,0.3)",
    description: "Raciocínio dedutivo, idiomas antigos e lógica sob pressão.",
    canonUsage: "Permite decifrar códigos, notar contradições e estudar rituais.",
  },
  {
    key: "percepcao",
    label: "Percepção",
    icon: <Eye className="w-3.5 h-3.5" />,
    color: "#dfb87f",
    glowColor: "rgba(223,184,127,0.35)",
    description: "Atenção a detalhes mínimos, leitura de auras e intuição.",
    canonUsage: "Fundamental para prever emboscadas e notar pistas imperceptíveis.",
  },
  {
    key: "carisma",
    label: "Carisma",
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: "#e5b567",
    glowColor: "rgba(229,181,103,0.3)",
    description: "Persuasão, compostura em interrogatórios, lábia e blefe.",
    canonUsage: "Usado para extrair depoimentos, sustentar mentiras e intimidar.",
  },
];

export const InvestigatorSheet: React.FC<InvestigatorSheetProps> = ({
  isOpen,
  onClose,
  origin,
  sanity = 100,
  onUpdatePlayerName,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (origin?.playerName) {
      setTempName(origin.playerName);
    } else {
      setTempName("Investigador Desconhecido");
    }
  }, [origin?.playerName]);

  // Close on Escape or outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Only close if click is not on the header button that toggled it
        const target = e.target as HTMLElement;
        if (!target.closest("#btn-investigator-sheet")) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const playerName = origin?.playerName || "Investigador Desconhecido";
  const gender = origin?.gender || "Não especificado";
  const originType = origin?.originType || "Pessoa Normal de Loen";

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed && onUpdatePlayerName) {
      onUpdatePlayerName(trimmed);
    }
    setIsEditingName(false);
  };
  const attributes = origin?.attributes || {
    vigor: 3,
    destreza: 3,
    intelecto: 3,
    percepcao: 3,
    carisma: 3,
  };

  // Human scale in LoM: 1 to 10 (10 is mortal human pinnacle)
  const MAX_ATTRIBUTE = 10;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none sm:p-4">
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto sm:hidden animate-fadeIn"
        onClick={onClose}
      />

      {/* Floating Card anchored to Top-Right */}
      <div
        ref={panelRef}
        id="investigator-sheet-panel"
        className="pointer-events-auto absolute top-14 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-96 max-h-[88vh] bg-[#0c0f16] border-2 border-[#8a6d3b]/70 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-fadeIn text-[#ddd0b0]"
      >
        {/* Subtle vintage brass radial glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,_rgba(223,184,127,0.12)_0%,_transparent_70%)] pointer-events-none" />

        {/* Header with Victorian Brass Styling */}
        <div className="p-4 border-b-2 border-[#8a6d3b]/40 bg-gradient-to-r from-[#1b150d] via-[#16120b] to-[#100c07] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-[#8a6d3b] bg-gradient-to-b from-[#2b2013] to-[#140f09] flex items-center justify-center text-[#dfb87f] shadow-inner">
              <Scroll className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[#f5ebd7] tracking-wider uppercase drop-shadow">
                Ficha do Investigador
              </h3>
              <p className="text-[11px] font-serif text-[#9e8f7a]">
                Registro de Atributos & Identidade
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#9e8f7a] hover:text-[#fff4dc] hover:bg-[#20180e] border border-transparent hover:border-[#8a6d3b]/40 transition-colors"
            title="Fechar Ficha"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Investigator Identity Card */}
        <div className="p-3.5 bg-[#121620]/80 border-b border-[#8a6d3b]/25 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full border border-[#8a6d3b]/60 bg-[#1a2230] flex items-center justify-center text-[#dfb87f] shadow-md flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setIsEditingName(false);
                    }}
                    placeholder="Nome do Investigador..."
                    className="bg-[#0b0e14] border border-[#8a6d3b] rounded px-2 py-0.5 text-xs text-[#f5ebd7] font-mono focus:outline-none focus:ring-1 focus:ring-[#dfb87f] w-full max-w-[180px]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-1 rounded bg-[#2a1e12] border border-[#8a6d3b] text-[#dfb87f] hover:text-[#fff] hover:bg-[#3b2a1a]"
                    title="Salvar Nome"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="font-['Cinzel'] font-bold text-sm text-[#f5ebd7] flex items-center gap-2">
                  <span className="truncate max-w-[170px]">{playerName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(playerName === "Investigador Desconhecido" ? "" : playerName);
                      setIsEditingName(true);
                    }}
                    className="p-0.5 text-[#8a7d69] hover:text-[#dfb87f] transition-colors"
                    title="Editar Nome do Personagem"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 rounded border border-[#8a6d3b]/50 bg-[#1b140b] text-[#dfb87f] flex-shrink-0">
                    {gender}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-[#9e8f7a] font-serif truncate">
                {originType}
              </p>
            </div>
          </div>

          {/* Sanity reflection badge */}
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase text-[#8a7d69] block">
              Estabilidade Mental
            </span>
            <div className="flex items-center justify-end gap-1 font-mono text-xs font-bold text-[#dfb87f]">
              <HeartPulse className="w-3 h-3 text-[#e06d53]" />
              <span>{sanity}%</span>
            </div>
          </div>
        </div>

        {/* Attributes List with Golden Progress Bars */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-['Cinzel'] tracking-wider uppercase text-[#dfb87f] font-bold">
              Atributos Mundanos (Escala 1–10)
            </span>
            <span className="text-[10px] font-mono text-[#8a7d69]">
              Humano Civil
            </span>
          </div>

          <div className="space-y-3.5">
            {ATTRIBUTES_CONFIG.map((attr) => {
              const value = attributes[attr.key] || 1;
              const percentage = Math.min(100, Math.round((value / MAX_ATTRIBUTE) * 100));

              return (
                <div
                  key={attr.key}
                  className="p-3 rounded-lg border border-[#8a6d3b]/35 bg-gradient-to-b from-[#141822] to-[#0c0f16] shadow-sm space-y-2 hover:border-[#8a6d3b]/60 transition-colors"
                >
                  {/* Top line: Label, Icon and Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-['Cinzel'] font-bold text-[#f0e6d6]">
                      <span
                        className="p-1 rounded bg-[#1b2230] border border-[#2d3748]"
                        style={{ color: attr.color }}
                      >
                        {attr.icon}
                      </span>
                      <span>{attr.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#f5ebd7]">
                        {value}
                      </span>
                      <span className="text-[10px] font-mono text-[#8a7d69]">
                        / {MAX_ATTRIBUTE}
                      </span>
                    </div>
                  </div>

                  {/* Golden Progress Bar */}
                  <div className="relative w-full h-2 rounded-full bg-[#10131c] border border-[#8a6d3b]/40 overflow-hidden shadow-inner">
                    {/* Golden Fill Gradient */}
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7a5b28] via-[#c9a875] to-[#fff4d4] transition-all duration-500 relative"
                      style={{
                        width: `${percentage}%`,
                        boxShadow: "0 0 8px rgba(223, 184, 127, 0.4)",
                      }}
                    >
                      {/* Subtle shimmer sheen */}
                      <span className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                    </div>

                    {/* Scale tick marks (at 20%, 40%, 60%, 80%) */}
                    <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
                      <span className="w-px h-full bg-black/40" />
                      <span className="w-px h-full bg-black/40" />
                      <span className="w-px h-full bg-black/40" />
                      <span className="w-px h-full bg-black/40" />
                    </div>
                  </div>

                  {/* Lore Description */}
                  <p className="text-[11px] font-serif text-[#9e8f7a] leading-tight">
                    {attr.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Lore Canon Box */}
          <div className="p-3 rounded-lg border border-[#8a6d3b]/30 bg-[#120f0a]/90 space-y-1 text-[11px] font-serif text-[#a89882] leading-relaxed">
            <div className="flex items-center gap-1.5 text-[#dfb87f] font-['Cinzel'] font-bold text-[10px] uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Evolução Canônica dos Atributos</span>
            </div>
            <p>
              Em <em>Lord of the Mysteries</em>, humanos não sobem de nível por matar monstros. Seus atributos aumentam unicamente através de treino árduo e estudo durante a crônica, ou pela ingestão e digestão bem-sucedida de poções da <strong>Sequência 9</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#8a6d3b]/30 bg-[#0e111a] flex items-center justify-between text-[10px] font-mono text-[#8a7d69]">
          <span>Reino de Loen • Época Vitoriana</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded border border-[#8a6d3b]/50 bg-[#1e170e] text-[#dfb87f] hover:text-[#fff4dc] hover:border-[#dfb87f] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
