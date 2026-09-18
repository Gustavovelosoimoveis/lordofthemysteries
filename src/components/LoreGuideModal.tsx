import React from "react";
import { X, ShieldAlert, BookOpen, Skull, Scale, BrainCircuit, History } from "lucide-react";

interface LoreGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoreGuideModal: React.FC<LoreGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-xl max-h-[85vh] bg-[#0d1118] border border-[#3d3222] rounded-xl flex flex-col shadow-2xl shadow-black overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#292217] bg-[#121622] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#dfb87f]" />
            <div>
              <h2 className="font-['Cinzel'] text-sm sm:text-base text-[#f0e6d6] font-bold uppercase tracking-wider">
                Diretrizes Fundamentais do Mundo
              </h2>
              <p className="text-xs text-[#8f8371] font-serif">
                Lore Inquebrável de Lord of the Mysteries (LoM)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#8b8273] hover:text-[#e5dac6] hover:bg-[#1c222f]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm font-serif text-[#d8cdbd] leading-relaxed">
          <div className="p-3.5 rounded-lg bg-[#141822] border border-[#2b3344] space-y-1">
            <div className="flex items-center gap-2 text-[#c9a875] font-['Cinzel'] font-bold text-xs uppercase">
              <History className="w-4 h-4" />
              <span>1. Linha do Tempo Estrita</span>
            </div>
            <p className="text-[#baa994]">
              A crônica se passa estritamente no período entre a queda do Imperador Roselle Gustav (c. 1198) e o despertar de Klein Moretti (1349).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#141822] border border-[#2b3344] space-y-1">
            <div className="flex items-center gap-2 text-[#c9a875] font-['Cinzel'] font-bold text-xs uppercase">
              <BookOpen className="w-4 h-4" />
              <span>2. Restrições Rígidas de Cânone</span>
            </div>
            <p className="text-[#baa994]">
              O Clube do Tarô <strong>NÃO</strong> existe. Klein Moretti <strong>NÃO</strong> despertou. Nenhum Pathway, deus, facção ou lei mística fora da obra canônica de Cuttlefish that Loves Diving pode ser inventado. Apenas os 22 Caminhos canônicos e facções legítimas operam.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#141822] border border-[#2b3344] space-y-1">
            <div className="flex items-center gap-2 text-[#c9a875] font-['Cinzel'] font-bold text-xs uppercase">
              <Scale className="w-4 h-4" />
              <span>3. Ocultismo Realista e Conhecimento Perigoso</span>
            </div>
            <p className="text-[#baa994]">
              A magia obedece à <em>Lei da Troca Equivalente</em>, à Lei de Convergência das Características Beyonder e à Lei de Conservação. O conhecimento mata: contemplar símbolos míticos ou entidades cósmicas sem a devida Sequência causa loucura imediata, mutação ou morte.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#141822] border border-[#2b3344] space-y-1">
            <div className="flex items-center gap-2 text-[#c9a875] font-['Cinzel'] font-bold text-xs uppercase">
              <Skull className="w-4 h-4" />
              <span>4. Humano Comum & Descoberta Orgânica</span>
            </div>
            <p className="text-[#baa994]">
              Você inicia como um humano comum (sem poção da Sequência 9). Não há escolha prévia de Pathway. Qualquer avanço místico dependerá de transações obscuras, manuscritos, ingredientes e sobrevivência a encontros arcanos.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#141822] border border-[#2b3344] space-y-1">
            <div className="flex items-center gap-2 text-[#c9a875] font-['Cinzel'] font-bold text-xs uppercase">
              <BrainCircuit className="w-4 h-4" />
              <span>5. Investigação Socrática & Memória Absoluta</span>
            </div>
            <p className="text-[#baa994]">
              A força bruta é inútil ou fatal para um humano mundano. A sobrevivência depende de perguntas afiadas, observação meticulosa e raciocínio lógico. O Motor Narrativo jamais esquece escolhas passadas, promessas ou mentiras.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#292217] bg-[#121622] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-[#6b5435] bg-[#292015] hover:bg-[#382b1c] text-[#dfb87f] font-serif text-xs font-semibold"
          >
            Compreendi as Leis do Mundo
          </button>
        </div>
      </div>
    </div>
  );
};
