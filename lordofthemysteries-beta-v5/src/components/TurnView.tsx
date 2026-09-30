import React, { useEffect, useMemo } from "react";
import { Message, LedgerData } from "../types";
import { parseGMResponse } from "../utils/parser";
import { getLocationSceneKey } from "../utils/locationBackground";
import { getAmbientMood } from "../utils/ambientMood";
import { LocationBackdrop } from "./LocationBackdrop";
import {
  Compass,
  MessageSquareQuote,
  Eye,
  AlertCircle,
  Feather,
  Sparkles,
  FastForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { audioEngine } from "../utils/audioEngine";
import { useQuillTypewriter } from "../utils/useQuillTypewriter";
import { NpcAvatarSilhouette } from "./NpcAvatarSilhouette";

interface TurnViewProps {
  message: Message;
  isLatest: boolean;
  isStreaming?: boolean;
  onSelectAction?: (actionText: string) => void;
  onDraftAction?: (actionText: string) => void;
  pageNumber?: number;
  sanity?: number;
  ledger?: LedgerData;
}

// Victorian Filigree Divider Component
const VictorianDivider: React.FC = () => (
  <div className="victorian-filigree-divider py-3 select-none opacity-70">
    <div className="flex items-center gap-2 px-3 text-[#8a6d3b]">
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="rotate-180 opacity-60">
        <path d="M0 6C6 6 8 2 12 0C10 4 11 6 12 6C13 6 14 4 12 0C16 2 18 6 24 6C18 6 16 10 12 12C14 8 13 6 12 6C11 6 10 8 12 12C8 10 6 6 0 6Z" fill="#8a6d3b" />
      </svg>
      <span className="text-xs text-[#8a6d3b] font-serif">♦</span>
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="opacity-60">
        <path d="M0 6C6 6 8 2 12 0C10 4 11 6 12 6C13 6 14 4 12 0C16 2 18 6 24 6C18 6 16 10 12 12C8 10 6 6 0 6Z" fill="#8a6d3b" />
      </svg>
    </div>
  </div>
);

// Quill Nib Indicator for typewriter writing head
const QuillNib: React.FC = () => (
  <span className="quill-typewriter-nib" aria-label="escrevendo...">
    <Feather className="w-3.5 h-3.5 rotate-45 inline -mt-1 text-[#ddd0b0]" />
  </span>
);

export const TurnView: React.FC<TurnViewProps> = ({
  message,
  isLatest,
  isStreaming = false,
  onSelectAction,
  onDraftAction,
  pageNumber = 1,
  sanity = 100,
  ledger,
}) => {
  // If user turn
  if (message.role === "user") {
    return (
      <div className="py-4 my-3 px-4 sm:px-6 rounded-lg border border-[#8a6d3b]/40 bg-gradient-to-r from-[#17130e]/90 via-[#131722]/85 to-[#0a0d11]/85 shadow-lg shadow-black/60 animate-turnEnter relative">
        <div className="flex items-center justify-between border-b border-[#8a6d3b]/30 pb-1.5 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-['Cinzel'] tracking-wider text-[#8a6d3b] uppercase">
            <Feather className="w-3.5 h-3.5 text-[#8a6d3b]" />
            <span>Registro da Ação do Investigador</span>
          </div>
          <span className="text-[10px] font-mono text-[#9b8d78] tracking-widest uppercase">
            Decisão Pessoal
          </span>
        </div>
        <p className="text-base sm:text-lg font-serif italic text-[#ddd0b0] leading-relaxed whitespace-pre-line pl-1 border-l-2 border-[#8a6d3b]/60">
          {message.content}
        </p>
      </div>
    );
  }

  // If assistant (GM) turn
  const parsed = message.parsed || parseGMResponse(message.content);
  const sceneKey = getLocationSceneKey(`${parsed.worldStatus || ""} ${parsed.scene || ""}`);
  const sceneMood = getAmbientMood(parsed.worldStatus || "");

  // Split scene into paragraphs
  const sceneParagraphs = useMemo(() => {
    return parsed.scene ? parsed.scene.split(/\n\s*\n/).filter(Boolean) : [];
  }, [parsed.scene]);

  // Build composite narrative text for smooth unified typewriter progression
  const sceneText = parsed.scene || "";
  const dialogueText = parsed.dialogue || "";
  const dilemmaText = parsed.dilemma || "";

  const compositeText = useMemo(() => {
    const parts = [sceneText, dialogueText, dilemmaText].filter(Boolean);
    return parts.length > 0 ? parts.join("\n\n") : message.content;
  }, [sceneText, dialogueText, dilemmaText, message.content]);

  // Atmospheric sounds on mounting or completing
  useEffect(() => {
    if (isLatest && parsed.scene) {
      audioEngine.playPageTurnSound();
    }
  }, [isLatest, message.id]);

  // Quill typewriter hook
  const {
    typedLength,
    isComplete,
    isTyping,
    speed,
    setSpeed,
    soundEnabled,
    toggleSound,
    skip,
  } = useQuillTypewriter({
    messageId: message.id,
    totalText: compositeText,
    isLatest,
    isStreaming,
    onComplete: () => {
      audioEngine.playTurnTransitionSound();
      if (parsed.dilemma) {
        setTimeout(() => {
          audioEngine.playDilemmaTensionCue();
        }, 280);
      }
    },
  });

  const isLowSanity = sanity < 50;
  const isCriticalSanity = sanity < 25;

  // Offsets for sequential narrative unfolding
  const sceneLength = sceneText.length;
  const dialogueOffset = sceneLength > 0 ? sceneLength + 2 : 0;
  const dialogueLength = dialogueText.length;
  const dilemmaOffset = dialogueLength > 0 ? dialogueOffset + dialogueLength + 2 : dialogueOffset;

  return (
    <article
      onClick={() => {
        if (isTyping) skip();
      }}
      className={`page-folio-card p-5 sm:p-7 my-5 rounded-lg space-y-6 relative overflow-hidden transition-all duration-700 ${
        isTyping ? "cursor-pointer quill-writing-glow" : ""
      }`}
      title={isTyping ? "Clique a qualquer momento para concluir a escrita imediatamente" : undefined}
    >
      {/* Fundo ambientado no local atual da cena — doca, beco, quarto, etc. */}
      <LocationBackdrop sceneKey={sceneKey} mood={sceneMood} />

      {/* Dog-ear page curl corner */}
      <div className="page-corner-curl" aria-hidden="true" />

      {/* Page Folio Header Stamp */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-1 border-b border-[#2d2417]/60 text-[10px] font-['Cinzel'] tracking-widest text-[#9d8a70]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c9a875]/70" />
          <span>FOLHA #{pageNumber} • CRÔNICA DE BACKLUND</span>
        </div>

        {/* Real-time Quill Typewriter Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isTyping && (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-[10px] text-[#8a7d69] font-serif italic">
                (Clique no texto para revelar tudo)
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  skip();
                }}
                className="px-2.5 py-1 rounded bg-[#2b1f13] hover:bg-[#422e1c] text-[#fbf1dc] border border-[#a3804d] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-black/60 active:scale-95"
                title="Pular animação e exibir o texto completo imediatamente"
              >
                <FastForward className="w-3 h-3 text-[#dfb87f]" />
                <span>Pular Digitação</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSpeed(speed === "normal" ? "fast" : speed === "fast" ? "instant" : "normal");
                }}
                className="px-2 py-1 rounded bg-[#131822] hover:bg-[#1f2635] text-[#b0a290] border border-[#2d374a] text-[10px] font-mono transition-colors"
                title="Alternar cadência de escrita da pena (1x / 2x / Instantâneo)"
              >
                {speed === "normal" ? "1x" : speed === "fast" ? "2x" : "⚡"}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSound();
                }}
                className="px-1.5 py-1 rounded bg-[#131822] hover:bg-[#1f2635] text-[#b0a290] border border-[#2d374a] text-[10px] font-mono transition-colors"
                title={soundEnabled ? "Som do arranhar da pena ativado" : "Som da pena silenciado"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3 h-3 text-[#eed2a5]" />
                ) : (
                  <VolumeX className="w-3 h-3 text-[#6b6255]" />
                )}
              </button>
            </div>
          )}

          {isLowSanity && (
            <span className="text-[9px] font-mono uppercase text-[#e06c58] bg-[#291311] px-1.5 py-0.5 rounded border border-[#6b251f]">
              {isCriticalSanity ? "À Beira da Mutação" : "Mente Perturbada"}
            </span>
          )}

          {!isTyping && (
            <span className="font-mono text-[9px] text-[#786c5c] uppercase tracking-wider hidden sm:inline">
              REGISTRO CANÔNICO
            </span>
          )}
        </div>
      </div>

      {/* 1. STATUS DO MUNDO (Victorian brass plaque look) */}
      {parsed.worldStatus && (
        <div className="animate-stagger-1 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded bg-gradient-to-r from-[#141822] to-[#0e1219] border border-[#8a6d3b]/35 text-xs sm:text-sm text-[#c4b69d] font-serif shadow-sm">
          <div className="w-4 h-4 rounded-full bg-[#1b150e] border border-[#8a6d3b]/70 flex items-center justify-center flex-shrink-0">
            <Compass className="w-2.5 h-2.5 text-[#8a6d3b]" />
          </div>
          <span className="font-['Cinzel'] text-[11px] uppercase tracking-wider text-[#8a6d3b]">
            Status do Mundo:
          </span>
          <span className="text-[#ddd0b0] font-medium tracking-wide">
            {parsed.worldStatus}
          </span>
        </div>
      )}

      {/* 2. CENA (Narrativa com efeito datilografia de pena) */}
      {sceneParagraphs.length > 0 && (
        <div className="space-y-4 animate-stagger-2">
          <div className="flex items-center justify-between border-b border-[#8a6d3b]/30 pb-1.5">
            <div className="flex items-center gap-2 text-xs font-['Cinzel'] tracking-widest text-[#8a6d3b] uppercase font-semibold">
              <Eye className="w-3.5 h-3.5 text-[#8a6d3b]" />
              <span>[ CENA ]</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#8a7d69] font-mono">
              <Sparkles className="w-3 h-3 text-[#8a6d3b]" />
              <span>Narrativa Canônica</span>
            </div>
          </div>

          <div className="text-base sm:text-lg font-['Cormorant_Garamond'] text-[#ddd0b0] leading-[1.8] space-y-4.5 tracking-wide">
            {(() => {
              let cumulativeOffset = 0;
              return sceneParagraphs.map((para, idx) => {
                const pLen = para.length;
                const pStart = cumulativeOffset;
                const pEnd = cumulativeOffset + pLen;
                // Add separator spacing for next paragraph offset
                cumulativeOffset += pLen + 2;

                if (!isComplete && typedLength < pStart) {
                  return null; // Not yet written
                }

                const isCurrentlyTypingThis = !isComplete && typedLength >= pStart && typedLength < pEnd;
                const isFullyWritten = isComplete || typedLength >= pEnd;

                const visibleText = isFullyWritten ? para : para.slice(0, typedLength - pStart);

                return (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? "first-letter:font-['Cinzel'] first-letter:text-5xl first-letter:float-left first-letter:mr-3.5 first-letter:text-[#ddd0b0] first-letter:leading-none first-letter:font-bold first-letter:drop-shadow-[0_2px_10px_rgba(138,109,59,0.35)]"
                        : ""
                    }
                  >
                    <span>{visibleText}</span>
                    {isCurrentlyTypingThis && <QuillNib />}
                  </p>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Fallback if parsing didn't find specific tags */}
      {!parsed.scene && !parsed.dialogue && (
        <div className="animate-stagger-2 text-base sm:text-lg font-['Cormorant_Garamond'] text-[#ddd0b0] leading-[1.8] whitespace-pre-line">
          {isComplete ? (
            message.content
          ) : (
            <>
              <span>{message.content.slice(0, typedLength)}</span>
              <QuillNib />
            </>
          )}
        </div>
      )}

      {/* 3. DIÁLOGO (Victorian transcript styling with typewriter progression) */}
      {parsed.dialogue && (isComplete || typedLength >= dialogueOffset) && (
        <div className="space-y-3 pt-2 animate-stagger-2">
          <div className="flex items-center gap-2 text-xs font-['Cinzel'] tracking-widest text-[#8a6d3b] uppercase border-b border-[#8a6d3b]/30 pb-1">
            <MessageSquareQuote className="w-3.5 h-3.5 text-[#8a6d3b]" />
            <span>[ DIÁLOGO ]</span>
          </div>

          <div className="p-4 sm:p-5 rounded-lg bg-gradient-to-r from-[#121620] via-[#0f131a] to-[#0a0d11] border-l-4 border-[#8a6d3b] border-y border-r border-[#8a6d3b]/25 text-[#ddd0b0] font-['Cormorant_Garamond'] text-base sm:text-lg leading-relaxed space-y-3 shadow-md shadow-black/60">
            {(() => {
              const currentDialogueChars = isComplete ? dialogueText.length : Math.max(0, typedLength - dialogueOffset);
              let runningDialogueOffset = 0;
              const dialogueLines = parsed.dialogue.split(/\n+/);

              return dialogueLines.map((line, lIdx) => {
                const lineLen = line.length;
                const lineStart = runningDialogueOffset;
                const lineEnd = runningDialogueOffset + lineLen;
                runningDialogueOffset += lineLen + 1;

                if (!isComplete && currentDialogueChars < lineStart) {
                  return null;
                }

                const isLineTyping = !isComplete && currentDialogueChars >= lineStart && currentDialogueChars < lineEnd;
                const isLineFull = isComplete || currentDialogueChars >= lineEnd;
                const visibleLine = isLineFull ? line : line.slice(0, currentDialogueChars - lineStart);

                // Highlight NPC name if matches "*Name:*" or "Name:" pattern
                const npcMatch = visibleLine.match(/^\s*\*?([^*:]+)\*?:\s*(.*)$/);
                if (npcMatch) {
                  const speakerName = npcMatch[1].trim();
                  const matchedNpc = ledger?.npcs?.find(
                    (n) =>
                      n.name.toLowerCase().includes(speakerName.toLowerCase()) ||
                      speakerName.toLowerCase().includes(n.name.toLowerCase())
                  );

                  return (
                    <div key={lIdx} className="not-italic flex flex-col sm:flex-row sm:items-start gap-2.5 my-1.5 pt-1">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <NpcAvatarSilhouette
                          name={speakerName}
                          role={matchedNpc?.role}
                          attitude={matchedNpc?.attitude}
                          size="sm"
                        />
                        <span className="font-['Cinzel'] text-xs uppercase tracking-wider text-[#ddd0b0] bg-[#1a202c] px-2 py-0.5 rounded border border-[#8a6d3b]/40 w-fit">
                          {speakerName}:
                        </span>
                        {/* Consequência Visível: Indicador de Memória Absoluta */}
                        {pageNumber > 1 && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#dfb87f] bg-[#22180e] border border-[#8a6d3b]/45"
                            title={
                              matchedNpc?.conversationMemory && matchedNpc.conversationMemory.length > 0
                                ? `Memória Retida: ${matchedNpc.conversationMemory[0]}`
                                : `Indivíduo com memória contínua dos fólios anteriores.`
                            }
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#dfb87f]" />
                            <span>○ Ecoa de: Fólio #{Math.max(1, pageNumber - 1)}</span>
                          </span>
                        )}
                      </div>
                      <span className="italic text-[#ddd0b0] font-serif text-base sm:text-lg leading-relaxed pl-1 sm:pl-0">
                        “{npcMatch[2].replace(/^["“]|["”]$/g, "")}”
                        {isLineTyping && <QuillNib />}
                      </span>
                    </div>
                  );
                }

                return (
                  <p key={lIdx} className="italic text-[#ddd0b0]">
                    {visibleLine}
                    {isLineTyping && <QuillNib />}
                  </p>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* 4. DILEMA IMEDIATO / DECISÃO (Wax seal & telegram styling) */}
      {parsed.dilemma && (isComplete || typedLength >= dilemmaOffset) && (
        <div className="animate-stagger-3 mt-4 p-4 sm:p-5 rounded-lg bg-gradient-to-r from-[#1c150e]/95 via-[#131722]/90 to-[#0a0d11]/90 border-2 border-[#8a6d3b]/70 shadow-[0_8px_25px_rgba(0,0,0,0.8),-2px_0_14px_rgba(139,28,28,0.25)] relative overflow-hidden victorian-border-gold">
          {/* Subtle gaslamp warm ambient flare */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#8a6d3b]/15 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#271010] border border-[#8b1c1c] flex items-center justify-center flex-shrink-0 shadow-inner shadow-black">
              <AlertCircle className="w-4 h-4 text-[#f28e83]" />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-['Cinzel'] uppercase tracking-widest text-[#ddd0b0] font-bold ${
                    isLowSanity ? "sanity-distorted-text" : ""
                  }`}
                >
                  Dilema Imediato do Investigador
                </span>
                <span className="text-[10px] font-mono uppercase text-[#8a6d3b] px-1.5 py-0.5 rounded bg-[#20170e] border border-[#8a6d3b]/40">
                  Decisão Irreversível
                </span>
              </div>
              <div
                className={`font-serif text-base sm:text-lg text-[#ddd0b0] leading-relaxed ${
                  isLowSanity ? "sanity-distorted-text" : ""
                }`}
              >
                {(() => {
                  if (isComplete) {
                    return parsed.dilemma;
                  }
                  const dilemmaChars = Math.max(0, typedLength - dilemmaOffset);
                  const isDilemmaTyping = dilemmaChars < parsed.dilemma.length;
                  return (
                    <>
                      <span>{parsed.dilemma.slice(0, dilemmaChars)}</span>
                      {isDilemmaTyping && <QuillNib />}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streaming indicator when waiting for more stream data */}
      {isStreaming && isLatest && (
        <div className="flex items-center gap-2.5 text-xs text-[#8a6d3b] font-mono tracking-wider animate-pulse pt-2 pl-1">
          <Feather className="w-3.5 h-3.5 text-[#ddd0b0] animate-bounce" />
          <span>A pena de ferro desliza sobre o pergaminho úmido sob a lamparina a gás...</span>
        </div>
      )}

      {/* Page Folio Watermark Stamp */}
      <div className="page-footer-stamp select-none">
        <span className="flex items-center gap-1.5 text-[10px] text-[#8a7d69]">
          <Feather className="w-3 h-3 text-[#8a6d3b]" />
          {isTyping ? "A pena de ferro ainda rascunha este fólio..." : "Registro Concluído no Diário • Backlund"}
        </span>
        <span className="font-mono text-[9px] text-[#6b6051]">
          {isTyping ? "ESCREVENDO..." : `FÓLIO #${pageNumber}`}
        </span>
      </div>

      {/* Victorian Ornamental Filigree Divider */}
      <VictorianDivider />
    </article>
  );
};