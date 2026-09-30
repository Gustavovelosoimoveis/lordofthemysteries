import React, { useState, useRef, useEffect } from "react";
import { Send, Eye, MessageSquare, Search, Lightbulb, Shield, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { audioEngine } from "../utils/audioEngine";
import { GameMode } from "../types";

interface ActionBarProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  draftText?: string;
  onClearDraftText?: () => void;
  gameMode?: GameMode;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onSend,
  isLoading,
  disabled,
  draftText,
  onClearDraftText,
  gameMode = "ai",
}) => {
  const [input, setInput] = useState("");
  const [showTips, setShowTips] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  // Handle external draft action insertion
  useEffect(() => {
    if (draftText) {
      setInput(draftText);
      if (textareaRef.current) {
        textareaRef.current.focus();
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
          }
        }, 40);
      }
      onClearDraftText?.();
    }
  }, [draftText, onClearDraftText]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    
    // Play subtle mechanical / quill tap sound
    audioEngine.playActionSentCue();

    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickAction = (prefix: string) => {
    setInput((prev) => {
      if (!prev.trim()) return prefix;
      return `${prev} ${prefix}`;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="sticky bottom-0 z-20 w-full border-t border-[#8a6d3b]/25 bg-[#0a0d11]/95 backdrop-blur-md p-3 sm:p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.8)]">
      <div className="max-w-4xl mx-auto space-y-1.5">
        {/* Discrete trigger to reveal fixed investigation starters (collapsed by default) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <button
              id="btn-toggle-action-tips"
              type="button"
              onClick={() => setShowTips((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-serif text-[#8a6d3b] hover:text-[#ddd0b0] hover:bg-[#131822] transition-colors border border-transparent hover:border-[#8a6d3b]/30 select-none"
              title={showTips ? "Ocultar dicas de investigação" : "Exibir dicas de investigação rápida"}
            >
              <Sparkles className="w-3 h-3 text-[#8a6d3b]" />
              <span>Dicas de Investigação</span>
              <ChevronDown className={`w-3 h-3 text-[#8a6d3b] transition-transform duration-200 ${showTips ? "rotate-180" : ""}`} />
            </button>
            {showTips && (
              <span className="text-[10px] text-[#7d715d] font-mono hidden sm:inline">
                Clique para rascunhar no campo sem enviar
              </span>
            )}
          </div>

          {/* Collapsible row of 5 prompt starters */}
          {showTips && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-[#9e907d] no-scrollbar animate-fadeIn">
              <button
                type="button"
                onClick={() => handleQuickAction("Observo atentamente suas microexpressões e postura corporal enquanto...")}
                className="px-2.5 py-1 rounded bg-[#131822] hover:bg-[#1a2230] border border-[#8a6d3b]/30 text-[#ddd0b0] hover:text-[#fff8eb] whitespace-nowrap transition-colors flex items-center gap-1 text-xs font-serif"
              >
                <Eye className="w-3 h-3 text-[#8a6d3b]" />
                <span>Observar Reações</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction("Com tom calmo e socrático, pergunto:")}
                className="px-2.5 py-1 rounded bg-[#131822] hover:bg-[#1a2230] border border-[#8a6d3b]/30 text-[#ddd0b0] hover:text-[#fff8eb] whitespace-nowrap transition-colors flex items-center gap-1 text-xs font-serif"
              >
                <MessageSquare className="w-3 h-3 text-[#8a6d3b]" />
                <span>Interrogar</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction("Aproximo-me do objeto e o examino à meia-luz, verificando texturas, odores e inscrições ocultas...")}
                className="px-2.5 py-1 rounded bg-[#131822] hover:bg-[#1a2230] border border-[#8a6d3b]/30 text-[#ddd0b0] hover:text-[#fff8eb] whitespace-nowrap transition-colors flex items-center gap-1 text-xs font-serif"
              >
                <Search className="w-3 h-3 text-[#8a6d3b]" />
                <span>Inspecionar Objeto</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction("Conecto mentalmente as contradições dos fatos e confronto a discrepância:")}
                className="px-2.5 py-1 rounded bg-[#131822] hover:bg-[#1a2230] border border-[#8a6d3b]/30 text-[#ddd0b0] hover:text-[#fff8eb] whitespace-nowrap transition-colors flex items-center gap-1 text-xs font-serif"
              >
                <Lightbulb className="w-3 h-3 text-[#8a6d3b]" />
                <span>Confrontar Lógica</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction("Mantenho uma expressão neutra e digo uma mentira calculada para testar sua reação:")}
                className="px-2.5 py-1 rounded bg-[#131822] hover:bg-[#1a2230] border border-[#8a6d3b]/30 text-[#ddd0b0] hover:text-[#fff8eb] whitespace-nowrap transition-colors flex items-center gap-1 text-xs font-serif"
              >
                <Shield className="w-3 h-3 text-[#8a6d3b]" />
                <span>Mentir / Dissimular</span>
              </button>
            </div>
          )}
        </div>

        {/* Form input */}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="relative flex-1 rounded-lg border border-[#8a6d3b]/35 bg-[#121620] focus-within:border-[#8a6d3b] focus-within:ring-1 focus-within:ring-[#8a6d3b]/50 transition-all shadow-inner">
            <textarea
              id="player-action-input"
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={isLoading || disabled}
              placeholder={
                gameMode === "offline"
                  ? "Escreva livremente — o Motor Local entende ações compostas (ex: 'Finjo ir embora, espero ele relaxar e sigo à distância...')"
                  : "Descreva sua ação em 1ª pessoa (ex: 'Recuo um passo, noto o anel de bronze em seu dedo e pergunto calmamente...')"
              }
              className="w-full resize-none bg-transparent px-3.5 py-2.5 text-sm sm:text-base font-serif text-[#ddd0b0] placeholder-[#7d715d] focus:outline-none max-h-44 disabled:opacity-50"
            />
          </div>

          <button
            id="btn-send-action"
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            className="px-4 py-2.5 rounded-lg border border-[#8a6d3b] bg-gradient-to-b from-[#332516] to-[#1c150c] text-[#ddd0b0] hover:from-[#45321d] hover:to-[#261d11] hover:border-[#b08e51] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-black/60 flex-shrink-0"
            title="Enviar decisão (Enter)"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#8a6d3b]" />
            ) : (
              <>
                <Send className="w-4 h-4 text-[#8a6d3b]" />
                <span className="text-xs font-['Cinzel'] tracking-wider hidden sm:inline text-[#ddd0b0]">Decidir</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-[#8a7e6b] px-1 font-mono">
          <span>{gameMode === "offline" ? "Motor Local • Sem IA/API • Ações livres e persistentes" : "Humano Comum • Sem Poção • As escolhas são permanentes"}</span>
          <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
        </div>
      </div>
    </div>
  );
};