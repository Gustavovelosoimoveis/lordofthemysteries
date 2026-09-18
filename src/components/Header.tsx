import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  BookOpen,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Scroll,
  Flame,
  Brain,
  Briefcase,
  User,
  ChevronDown,
  Compass,
  Moon,
  CloudFog,
  SunMedium,
} from "lucide-react";
import { audioEngine, AudioMood } from "../utils/audioEngine";

interface HeaderProps {
  onOpenLedger: () => void;
  onOpenLore: () => void;
  onOpenPathways: () => void;
  onOpenInventory?: () => void;
  onOpenInvestigatorSheet?: () => void;
  onNewGame: () => void;
  onOpenSanity?: () => void;
  ledgerCount: number;
  inventoryCount?: number;
  discoveredPathwaysCount?: number;
  currentWorldStatus: string;
  sanity?: number;
  playerName?: string;
  userMuted?: boolean;
  onToggleUserMute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLedger,
  onOpenLore,
  onOpenPathways,
  onOpenInventory,
  onOpenInvestigatorSheet,
  onNewGame,
  onOpenSanity,
  ledgerCount,
  inventoryCount = 0,
  discoveredPathwaysCount = 0,
  currentWorldStatus,
  sanity = 100,
  playerName,
  userMuted = false,
  onToggleUserMute,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(audioEngine.isPlaying());
  const [volume, setVolume] = useState(audioEngine.getVolume());
  const [mood, setMood] = useState<AudioMood>(audioEngine.getMood());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);

  const grimoireRef = useRef<HTMLDivElement>(null);

  // Sync volume with audio engine
  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  // Listen to mood transitions
  useEffect(() => {
    const unsubscribe = audioEngine.subscribeMood((newMood) => {
      setMood(newMood);
    });
    return () => unsubscribe();
  }, []);

  // Update playing status when engine state changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlayingAudio(audioEngine.isPlaying());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Close Grimoire menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (grimoireRef.current && !grimoireRef.current.contains(e.target as Node)) {
        setIsGrimoireOpen(false);
      }
    };
    if (isGrimoireOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isGrimoireOpen]);

  const handleToggleAudio = async () => {
    if (onToggleUserMute) {
      onToggleUserMute();
    } else {
      if (isPlayingAudio) {
        audioEngine.stop();
        setIsPlayingAudio(false);
      } else {
        await audioEngine.start();
        setIsPlayingAudio(true);
      }
    }
  };

  // Fallback for legacy saves without playerName
  const displayName = playerName && playerName.trim().length > 0
    ? playerName
    : "Investigador Desconhecido";

  // Mood badge meta
  const moodMeta: Record<AudioMood, { label: string; icon: React.ReactNode; badgeClass: string }> = {
    tension: {
      label: "Tensão",
      icon: <Flame className="w-3.5 h-3.5 text-[#e87061] animate-pulse" />,
      badgeClass: "bg-[#2b1814] border-[#8a382c] text-[#f29a8e] shadow-[0_0_12px_rgba(200,60,40,0.25)]",
    },
    mystery: {
      label: "Mistério",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#bfa0dc] animate-spin-slow" />,
      badgeClass: "bg-[#1e1728] border-[#6b4fa3] text-[#d6c4f0] shadow-[0_0_10px_rgba(107,79,163,0.2)]",
    },
    discovery: {
      label: "Descoberta",
      icon: <Compass className="w-3.5 h-3.5 text-[#e5b567] animate-pulse" />,
      badgeClass: "bg-[#251f11] border-[#8c6d32] text-[#f5d996] shadow-[0_0_12px_rgba(229,181,103,0.25)]",
    },
    calm: {
      label: "Calmaria",
      icon: <Volume2 className="w-3.5 h-3.5 text-[#dfb87f]" />,
      badgeClass: "bg-[#201a13] border-[#8a6d3b] text-[#dfb87f] shadow-[0_0_10px_rgba(223,184,127,0.15)]",
    },
  };

  // Determine dynamic weather icon
  const isNightOrMoon = /lua|noite|madrugada|carmesim|carmim/i.test(currentWorldStatus);
  const isFogOrSmog = /névoa|fumaça|nevoeiro|garoa|chuva|chaminé/i.test(currentWorldStatus);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#8a6d3b]/30 bg-[#0a0d11]/95 backdrop-blur-md px-3 py-2 sm:px-6 sm:py-2.5 text-[#ddd0b0]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Identity and World Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full border border-[#8a6d3b]/60 bg-[#141822] flex items-center justify-center text-[#dfb87f] shadow-inner shadow-black/80 flex-shrink-0">
            <Scroll className="w-4 h-4 text-[#8a6d3b]" />
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-['Cinzel'] font-bold text-sm sm:text-base text-[#f5ebd7] tracking-wider uppercase drop-shadow-sm flex items-center gap-1.5">
                Lord of the Mysteries
              </h1>

              {/* Prominent Investigator Badge */}
              <button
                id="btn-investigator-sheet"
                type="button"
                onClick={onOpenInvestigatorSheet}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#261c11] via-[#1f170e] to-[#161009] hover:from-[#3a2c1a] hover:to-[#241b0f] text-[#dfb87f] hover:text-[#fff4dc] border border-[#8a6d3b] hover:border-[#dfb87f] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.6)] cursor-pointer group"
                title="Abrir Ficha do Investigador (Atributos, Estabilidade Mental e Identidade)"
              >
                <User className="w-3 h-3 text-[#dfb87f] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-mono font-semibold truncate max-w-[130px] sm:max-w-[180px]">
                  {displayName}
                </span>
                <span className="text-[9px] font-['Cinzel'] tracking-wider px-1 py-0.2 rounded bg-[#0d0a06] border border-[#8a6d3b]/40 text-[#b59b73] group-hover:text-[#dfb87f]">
                  Ficha
                </span>
              </button>
            </div>

            {/* Dynamic World Status */}
            <div className="flex items-center gap-1.5 text-xs text-[#a89984] font-serif truncate mt-0.5">
              {isNightOrMoon ? (
                <Moon className="w-3 h-3 text-[#e06d53] flex-shrink-0 animate-pulse" />
              ) : isFogOrSmog ? (
                <CloudFog className="w-3 h-3 text-[#8a9aa8] flex-shrink-0" />
              ) : (
                <SunMedium className="w-3 h-3 text-[#dfb87f] flex-shrink-0" />
              )}
              <span className="truncate max-w-xs sm:max-w-md lg:max-w-xl text-[#c7b9a3]">
                {currentWorldStatus || "Backlund, Distrito de Cherwood | Madrugada sob o Luar Carmesim"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: 2 Priority Statuses (Sanity & Audio) + Unified Grimoire Menu + New Game */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Priority 1: Sanity / Mental Stability Bar & Badge */}
          <button
            id="btn-sanity-indicator"
            type="button"
            onClick={onOpenSanity || onOpenLedger}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-serif flex items-center gap-2 transition-all cursor-pointer ${
              sanity >= 75
                ? "bg-[#101914] border-[#294532] text-[#7ec79c] hover:border-[#3b674b] shadow-[0_0_8px_rgba(41,69,50,0.2)]"
                : sanity >= 45
                ? "bg-[#211a11] border-[#664e28] text-[#e0ab5b] hover:border-[#8a6d3b] shadow-[0_0_10px_rgba(138,109,59,0.2)]"
                : sanity >= 20
                ? "bg-[#271111] border-[#8b1c1c] text-[#f28e83] shadow-[0_0_12px_rgba(139,28,28,0.4)] animate-pulse"
                : "bg-[#330c14] border-[#a61c32] text-[#fca5b5] shadow-[0_0_18px_rgba(166,28,50,0.55)] animate-bounce"
            }`}
            title={`Estabilidade Mental: ${sanity}% (${
              sanity >= 75 ? "Lúcido" : sanity >= 45 ? "Alerta" : sanity >= 20 ? "Perturbado" : "À Beira da Mutação"
            }) - Clique para detalhes`}
          >
            <Brain className="w-3.5 h-3.5 flex-shrink-0" />
            <div className="flex flex-col items-start leading-tight">
              <span className="font-mono text-[11px] font-bold">{sanity}%</span>
              <span className="text-[9px] uppercase font-['Cinzel'] tracking-wider opacity-85 hidden sm:inline">
                {sanity >= 75 ? "Lúcido" : sanity >= 45 ? "Alerta" : sanity >= 20 ? "Perturbado" : "Mutação"}
              </span>
            </div>
          </button>

          {/* Priority 2: Audio Engine Synthesizer Control */}
          <div className="relative flex items-center">
            <button
              id="btn-toggle-audio"
              type="button"
              onClick={handleToggleAudio}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                isPlayingAudio
                  ? moodMeta[mood].badgeClass
                  : "bg-[#141820] border-[#292e38] text-[#868d9d] hover:text-[#c4b9a8] hover:border-[#404654]"
              }`}
              title={
                isPlayingAudio
                  ? `Tema Dark Academia Ativo: ${moodMeta[mood].label} (Clique para silenciar)`
                  : "Ativar tema ambiente orquestral e chuva"
              }
            >
              {isPlayingAudio ? (
                moodMeta[mood].icon
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}

              {isPlayingAudio && (
                <span className="flex items-end gap-0.5 h-3 px-0.5">
                  <span className="w-0.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s] h-2" />
                  <span className="w-0.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s] h-3" />
                  <span className="w-0.5 bg-current rounded-full animate-bounce h-1.5" />
                </span>
              )}

              <span className="hidden md:inline font-serif text-[11px]">
                {isPlayingAudio ? moodMeta[mood].label : "Áudio Mudo"}
              </span>
            </button>

            {/* Volume popover slider */}
            {showVolumeSlider && (
              <div
                onMouseLeave={() => setShowVolumeSlider(false)}
                className="absolute right-0 top-full mt-1.5 p-2.5 bg-[#12161f] border border-[#8a6d3b]/50 rounded-lg shadow-2xl shadow-black flex flex-col gap-2 z-40 min-w-40"
              >
                <div className="flex items-center justify-between text-[10px] text-[#a89984] font-mono">
                  <span>Volume: {Math.round(volume * 100)}%</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-[#1e2430] text-[#c9a875]">
                    {moodMeta[mood].label}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.02"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 accent-[#c9a875] bg-[#242b38] rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Unified Navigation: Compact 'Grimório' Menu */}
          <div className="relative" ref={grimoireRef}>
            <button
              id="btn-grimoire-menu"
              type="button"
              onClick={() => setIsGrimoireOpen((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-serif flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                isGrimoireOpen
                  ? "bg-[#251d13] border-[#dfb87f] text-[#fff4dc]"
                  : "bg-[#161a24] border-[#8a6d3b]/60 text-[#ddd0b0] hover:border-[#dfb87f] hover:bg-[#1f2433]"
              }`}
              title="Abrir Grimório (Diário, Sequências, Inventário e Lore)"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#dfb87f]" />
              <span className="font-['Cinzel'] tracking-wide">Grimório</span>
              {(ledgerCount > 0 || inventoryCount > 0) && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-[#2a2115] text-[#dfb87f] border border-[#8a6d3b]/50">
                  {ledgerCount + inventoryCount}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 text-[#8a6d3b] transition-transform ${isGrimoireOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Grimoire Dropdown Panel */}
            {isGrimoireOpen && (
              <div
                id="grimoire-dropdown-menu"
                className="absolute right-0 top-full mt-2 w-64 bg-[#0e121a] border-2 border-[#8a6d3b]/70 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)] p-2 z-50 animate-fadeIn text-[#ddd0b0]"
              >
                <div className="px-2 py-1.5 border-b border-[#8a6d3b]/30 mb-1">
                  <span className="font-['Cinzel'] text-[10px] uppercase font-bold tracking-widest text-[#8a6d3b]">
                    Compêndio do Investigador
                  </span>
                </div>

                <div className="space-y-1">
                  {/* 1. Diário de Memória */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGrimoireOpen(false);
                      onOpenLedger();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1a212e] text-xs flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-[#dfb87f] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-serif font-medium text-[#f5ebd7] group-hover:text-[#dfb87f]">
                          Diário de Memória
                        </div>
                        <div className="text-[10px] text-[#9c917f]">
                          NPCs, pistas e promessas registradas
                        </div>
                      </div>
                    </div>
                    {ledgerCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#20180e] border border-[#8a6d3b]/50 text-[#dfb87f]">
                        {ledgerCount}
                      </span>
                    )}
                  </button>

                  {/* 2. Caminhos & Sequências Descobertas */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGrimoireOpen(false);
                      onOpenPathways();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1a212e] text-xs flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#dfb87f] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-serif font-medium text-[#f5ebd7] group-hover:text-[#dfb87f]">
                          Caminhos Beyonder
                        </div>
                        <div className="text-[10px] text-[#9c917f]">
                          {discoveredPathwaysCount > 0
                            ? `${discoveredPathwaysCount} caminho(s) revelado(s)`
                            : "As 22 Leis das Essências"}
                        </div>
                      </div>
                    </div>
                    {discoveredPathwaysCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#20180e] border border-[#8a6d3b]/50 text-[#dfb87f]">
                        {discoveredPathwaysCount}
                      </span>
                    )}
                  </button>

                  {/* 3. Gabinete & Inventário */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGrimoireOpen(false);
                      if (onOpenInventory) onOpenInventory();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1a212e] text-xs flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-[#dfb87f] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-serif font-medium text-[#f5ebd7] group-hover:text-[#dfb87f]">
                          Inventário de Itens
                        </div>
                        <div className="text-[10px] text-[#9c917f]">
                          Documentos, armas e relíquias
                        </div>
                      </div>
                    </div>
                    {inventoryCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#20180e] border border-[#8a6d3b]/50 text-[#dfb87f]">
                        {inventoryCount}
                      </span>
                    )}
                  </button>

                  {/* 4. Lore Inquebrável */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGrimoireOpen(false);
                      onOpenLore();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1a212e] text-xs flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-[#8a6d3b] group-hover:text-[#dfb87f] transition-colors" />
                      <div>
                        <div className="font-serif font-medium text-[#f5ebd7] group-hover:text-[#dfb87f]">
                          Diretrizes do Mundo
                        </div>
                        <div className="text-[10px] text-[#9c917f]">
                          Cânone de Lord of the Mysteries
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Separated New Game Button on the far right */}
          <div className="pl-1.5 border-l border-[#8a6d3b]/30">
            <button
              id="btn-new-game"
              type="button"
              onClick={onNewGame}
              className="p-2 rounded-lg border border-[#3b2323] bg-[#1a1214] text-[#a88a8a] hover:text-[#f29a8e] hover:border-[#8a382c] hover:bg-[#261517] transition-all cursor-pointer shadow-sm"
              title="Iniciar Nova Crônica / Despertar Imprevisível (Reiniciar História)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
