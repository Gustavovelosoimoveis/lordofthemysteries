import React, { useState, useMemo } from "react";
import { ALL_22_PATHWAYS, PathwayInfo } from "../data/pathways";
import { X, Sparkles, Compass, Shield, Search, Lock, Eye, EyeOff, BookOpen, AlertCircle } from "lucide-react";

interface PathwaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  discoveredPathwayIds?: string[];
  originPathwayId?: string;
}

export const PathwaysModal: React.FC<PathwaysModalProps> = ({
  isOpen,
  onClose,
  discoveredPathwayIds = [],
  originPathwayId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"discovered" | "all">("discovered");

  // Determine set of known pathway IDs
  const knownSet = useMemo(() => {
    const set = new Set<string>(discoveredPathwayIds.map((id) => id.toLowerCase()));
    if (originPathwayId) {
      set.add(originPathwayId.toLowerCase());
    }
    return set;
  }, [discoveredPathwayIds, originPathwayId]);

  // Initial selected pathway: first discovered one, or first pathway in all
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>(() => {
    const firstDiscovered = ALL_22_PATHWAYS.find((p) => knownSet.has(p.id.toLowerCase()));
    return firstDiscovered ? firstDiscovered.id : ALL_22_PATHWAYS[0].id;
  });

  if (!isOpen) return null;

  const discoveredCount = ALL_22_PATHWAYS.filter((p) => knownSet.has(p.id.toLowerCase())).length;

  const filteredPathways = ALL_22_PATHWAYS.filter((p) => {
    const isDiscovered = knownSet.has(p.id.toLowerCase());
    if (viewMode === "discovered" && !isDiscovered && searchTerm.trim() === "") {
      // In discovered mode without search, we show locked entries with masked names
      return true;
    }
    const matchesSearch =
      p.sequence9Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sequence9English.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.group.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const selectedPathway = ALL_22_PATHWAYS.find((p) => p.id === selectedPathwayId) || ALL_22_PATHWAYS[0];
  const isSelectedDiscovered = knownSet.has(selectedPathway.id.toLowerCase()) || viewMode === "all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0d1118] border border-[#8a6d3b]/60 rounded-xl flex flex-col shadow-2xl shadow-black overflow-hidden text-[#ddd0b0]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#8a6d3b]/30 bg-[#121622] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#8a6d3b] bg-[#1b150f] flex items-center justify-center text-[#dfb87f] shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Cinzel'] text-sm sm:text-base text-[#f0e6d6] font-bold tracking-wide uppercase">
                  Caminhos das 22 Sequências
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#20180e] border border-[#8a6d3b]/50 text-[#dfb87f]">
                  {discoveredCount} / 22 Descobertos
                </span>
              </div>
              <p className="text-xs text-[#9a8e7c] font-serif">
                Apenas as leis e poções testemunhadas na crônica são reveladas à sua consciência
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#8b8273] hover:text-[#e5dac6] hover:bg-[#1c222f] transition-colors cursor-pointer"
            title="Fechar compêndio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Mode Toggle Bar */}
        <div className="p-3 bg-[#0f131c] border-b border-[#8a6d3b]/20 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8a7d69]" />
            <input
              type="text"
              placeholder="Buscar por nome conhecido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded bg-[#161a25] border border-[#2a3242] text-xs text-[#e5dac6] focus:outline-none focus:border-[#dfb87f]"
            />
          </div>

          {/* Toggle between In-Character Discovery mode and Full Reference Mode */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setViewMode((prev) => (prev === "discovered" ? "all" : "discovered"))}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-serif border transition-all cursor-pointer ${
                viewMode === "all"
                  ? "bg-[#2b1f13] border-[#dfb87f] text-[#f5ebd7] shadow-sm"
                  : "bg-[#141822] border-[#8a6d3b]/40 text-[#a89a84] hover:text-[#dfb87f] hover:border-[#8a6d3b]"
              }`}
              title="Alternar entre visualização de pistas descobertas e compêndio geral"
            >
              {viewMode === "all" ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#dfb87f]" />
                  <span>Modo Referência Completa</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#a89a84]" />
                  <span>Modo Narrativo (Descobertas)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Split View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Pathway List */}
          <div className="md:col-span-5 border-r border-[#8a6d3b]/20 overflow-y-auto p-3 space-y-1.5 max-h-[40vh] md:max-h-none">
            {discoveredCount === 0 && viewMode === "discovered" && (
              <div className="p-4 rounded-lg bg-[#141822] border border-[#8a6d3b]/30 text-center text-xs font-serif text-[#a89a84] mb-2">
                <AlertCircle className="w-5 h-5 text-[#dfb87f] mx-auto mb-2" />
                <p className="font-semibold text-[#f5ebd7] mb-1">
                  Nenhum Caminho Revelado Ainda
                </p>
                <p className="leading-relaxed text-[11px]">
                  Você é um humano mundano nas ruas de Backlund. Interaja com NPCs peculiares, examine relíquias e investigue pistas para vislumbrar os 22 caminhos da divindade.
                </p>
              </div>
            )}

            {filteredPathways.map((pathway, index) => {
              const isDiscovered = knownSet.has(pathway.id.toLowerCase()) || viewMode === "all";
              const isSelected = selectedPathway.id === pathway.id;

              return (
                <div
                  key={pathway.id}
                  onClick={() => setSelectedPathwayId(pathway.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#251e14] border-[#dfb87f] text-[#f7efe1] shadow-[0_0_12px_rgba(223,184,127,0.15)]"
                      : isDiscovered
                      ? "bg-[#121620] border-[#222938] hover:border-[#8a6d3b] hover:bg-[#181f2b] text-[#c7bcab]"
                      : "bg-[#0b0e14] border-[#1a1f2b] text-[#6b6458] hover:border-[#2f271c]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {!isDiscovered && <Lock className="w-3 h-3 text-[#6e5d47]" />}
                      <span
                        className={`font-['Cinzel'] font-bold text-xs ${
                          isDiscovered ? "text-[#e8caa0]" : "text-[#736a5c]"
                        }`}
                      >
                        {isDiscovered
                          ? `Sequência 9: ${pathway.sequence9Name}`
                          : `Sequência Oculta #${index + 1}`}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        isDiscovered
                          ? "bg-[#251e14] border-[#8a6d3b]/50 text-[#dfb87f]"
                          : "bg-[#121217] border-[#292218] text-[#554e44]"
                      }`}
                    >
                      {isDiscovered ? "Seq 9" : "Bloqueado"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] font-serif">
                    {isDiscovered ? (
                      <>
                        <span className="text-[#baa890]">{pathway.sequence9English}</span>
                        <span className="text-[10px] text-[#8a7d69]">• Domínio: {pathway.group}</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-[#61594e] italic">
                        Desconhecido • Requer contato místico na história
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pathway Details View */}
          <div className="md:col-span-7 overflow-y-auto p-5 space-y-4 bg-[#0b0e14]">
            {isSelectedDiscovered ? (
              <>
                <div className="border-b border-[#8a6d3b]/30 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono uppercase text-[#dfb87f] tracking-wider">
                      Domínio Místico: {selectedPathway.group}
                    </span>
                    <span className="text-xs font-serif italic text-[#baa890]">
                      Poção Inicial do Cânone
                    </span>
                  </div>
                  <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-[#f5ebd9] flex items-center gap-2">
                    <span>Sequência 9: {selectedPathway.sequence9Name}</span>
                    <span className="text-sm font-serif font-normal text-[#dfb87f]">
                      ({selectedPathway.sequence9English})
                    </span>
                  </h3>

                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18140e] border border-[#8a6d3b]/50 text-xs font-mono text-[#c9a875]">
                      <Lock className="w-3 h-3 text-[#dfb87f]" />
                      <span>
                        Caminho Completo:{" "}
                        <strong className="text-[#e5cf9b]">Oculto na Névoa</strong> (Descoberto por avanço)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm font-serif leading-relaxed">
                  <div className="p-3 rounded-lg bg-[#121622] border border-[#262e3d]">
                    <h4 className="font-['Cinzel'] text-xs font-bold text-[#dfb87f] uppercase mb-1">
                      Conceito & Essência da Sequência 9
                    </h4>
                    <p className="text-[#cac0b0]">{selectedPathway.coreConcept}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#121622] border border-[#262e3d]">
                    <h4 className="font-['Cinzel'] text-xs font-bold text-[#dfb87f] uppercase mb-1">
                      Habilidades Mundanas & Percepções Arcanas
                    </h4>
                    <p className="text-[#cac0b0]">{selectedPathway.mechanicsAndAbilities}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#181510] border border-[#8a6d3b]/40">
                    <h4 className="font-['Cinzel'] text-xs font-bold text-[#dfb87f] uppercase mb-1 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#dfb87f]" />
                      <span>Rumo do Enredo & Investigação</span>
                    </h4>
                    <p className="text-[#dfd4c5]">{selectedPathway.narrativeTrajectory}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#121622] border border-[#262e3d]">
                    <h4 className="font-['Cinzel'] text-xs font-bold text-[#dfb87f] uppercase mb-1.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#dfb87f]" />
                      <span>Facções & Círculos Ocultos Relacionados</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPathway.associatedFactions.map((faction, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#1c2230] border border-[#313b4f] text-[11px] text-[#baa994]"
                        >
                          {faction}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Atmospheric Locked Pathway Screen */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full border-2 border-[#8a6d3b]/40 bg-[#141822] flex items-center justify-center text-[#8a7d69] shadow-inner">
                  <Lock className="w-8 h-8 text-[#8a6d3b]" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="font-['Cinzel'] text-lg font-bold text-[#e0d3be] tracking-wide">
                    Sequência Oculta na Névoa de Backlund
                  </h3>
                  <p className="text-xs font-serif text-[#9e8f7a] leading-relaxed">
                    Você ainda não teve contato místico com os ecos, relíquias ou praticantes deste Caminho sobrenatural.
                  </p>
                  <p className="text-xs font-serif text-[#c7b9a3] italic bg-[#17130d] border border-[#8a6d3b]/30 p-3 rounded-lg">
                    &ldquo;Aqueles que caminham no escuro não devem buscar nomes antes que o destino apresente seus frascos.&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("all")}
                  className="text-xs font-mono text-[#dfb87f] hover:underline pt-2 cursor-pointer"
                >
                  Consultar compêndio completo em Modo Estudo &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#8a6d3b]/30 bg-[#121622] flex items-center justify-between">
          <span className="text-xs text-[#8f8371] font-serif hidden sm:inline">
            A obtenção de fórmulas depende de suas deduções, pistas no Diário e rituais no mundo.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-[#8a6d3b] bg-[#292015] hover:bg-[#382b1c] text-[#dfb87f] font-serif text-xs font-semibold cursor-pointer transition-colors"
          >
            Fechar Registro
          </button>
        </div>
      </div>
    </div>
  );
};

