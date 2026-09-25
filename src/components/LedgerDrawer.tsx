import React, { useState, useEffect } from "react";
import { LedgerData, NPCRecord } from "../types";
import {
  X,
  Users,
  Key,
  AlertTriangle,
  BookMarked,
  FileText,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  MessageSquare,
  Compass,
  PieChart as PieChartIcon,
  Brain,
  Activity,
  Sparkles,
  Shield,
  Coffee,
} from "lucide-react";
import { InvestigationProgressPanel } from "./InvestigationProgressPanel";
import { NpcAvatarSilhouette } from "./NpcAvatarSilhouette";

interface LedgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ledger: LedgerData;
  onUpdateLedger: (updated: LedgerData) => void;
  onExportMarkdown: () => void;
  initialTab?: "progress" | "sanity" | "npcs" | "clues" | "lies" | "notes";
}

export const LedgerDrawer: React.FC<LedgerDrawerProps> = ({
  isOpen,
  onClose,
  ledger,
  onUpdateLedger,
  onExportMarkdown,
  initialTab = "progress",
}) => {
  const [activeTab, setActiveTab] = useState<"progress" | "sanity" | "npcs" | "clues" | "lies" | "notes">(initialTab);
  const [newNote, setNewNote] = useState("");
  const [newClue, setNewClue] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const sanityVal = typeof ledger.sanity === "number" ? ledger.sanity : 100;
  const activeMysteriesCount = ledger.mysteries?.length || 0;
  const resolvedMysteriesCount = ledger.resolvedMysteries?.length || 0;
  const totalMysteries = activeMysteriesCount + resolvedMysteriesCount;
  const totalSecrets = (ledger.secretsDiscovered?.length || 0) + (ledger.npcs?.filter(n => n.secretsKnown).length || 0);
  const resolvedPct = totalMysteries > 0 ? Math.round((resolvedMysteriesCount / totalMysteries) * 100) : 0;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onUpdateLedger({
      ...ledger,
      playerNotes: [...(ledger.playerNotes || []), newNote.trim()],
    });
    setNewNote("");
  };

  const handleRemoveNote = (index: number) => {
    const updated = [...(ledger.playerNotes || [])];
    updated.splice(index, 1);
    onUpdateLedger({ ...ledger, playerNotes: updated });
  };

  const handleAddClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClue.trim()) return;
    onUpdateLedger({
      ...ledger,
      clues: [...(ledger.clues || []), newClue.trim()],
    });
    setNewClue("");
  };

  const handleCopySummary = () => {
    const summary = `DIÁRIO DE MEMÓRIA ABSOLUTA - LORD OF THE MYSTERIES
Local: ${ledger.location || "Desconhecido"}
Horário/Clima: ${ledger.timeAndWeather || "Desconhecido"}

PROGRESSO DA INVESTIGAÇÃO:
- Mistérios Resolvidos: ${resolvedMysteriesCount} / ${totalMysteries} (${resolvedPct}%)
- Segredos Descobertos: ${totalSecrets}
- Pistas Catalogadas: ${ledger.clues?.length || 0}

NPCS E MEMÓRIA DE CONVERSAS:
${(ledger.npcs || [])
  .map(
    (n) =>
      `- ${n.name} (${n.role || "Indivíduo"} | Atitude: ${n.attitude || "Neutra"}):
  Memória de Diálogo: ${(n.conversationMemory || []).join("; ") || "Nenhuma registrada"}
  Notas: ${n.notes || "Nenhuma"}`
  )
  .join("\n\n") || "Nenhum ainda."}

PISTAS COLETADAS:
${(ledger.clues || []).map((c) => `- ${c}`).join("\n") || "Nenhuma ainda."}

MENTIRAS E PROMESSAS FEITAS:
${(ledger.playerLies || []).map((l) => `- ${l}`).join("\n") || "Nenhuma mentira registrada."}

ANOTAÇÕES PESSOAIS:
${(ledger.playerNotes || []).map((note) => `- ${note}`).join("\n") || "Nenhuma anotação."}
`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0a0d11] border-l border-[#8a6d3b]/35 h-full flex flex-col shadow-2xl shadow-black">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#8a6d3b]/25 flex items-center justify-between bg-[#121620]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#171c26] border border-[#8a6d3b]/40 flex items-center justify-center flex-shrink-0">
              <BookMarked className="w-5 h-5 text-[#8a6d3b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Cinzel'] text-sm sm:text-base text-[#ddd0b0] uppercase tracking-wider font-bold">
                  Diário de Memória Absoluta
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("progress")}
                  className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#20180e] text-[#ddd0b0] border border-[#8a6d3b]/50 hover:bg-[#2c2214] transition-colors"
                  title="Ver painel de progresso"
                >
                  {resolvedPct}% Resolvido
                </button>
              </div>
              <p className="text-xs text-[#8c8273] font-serif truncate max-w-xs">
                {ledger.location || "Backlund, Reino de Loen"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#8b8273] hover:text-[#ddd0b0] hover:bg-[#1a202c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#8a6d3b]/25 bg-[#0a0d11] px-2 text-xs font-serif overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("progress")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "progress"
                ? "border-[#8a6d3b] text-[#ddd0b0] font-medium"
                : "border-transparent text-[#7d7568] hover:text-[#ddd0b0]"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#8a6d3b]" />
            <span>Progresso ({resolvedPct}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sanity")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "sanity"
                ? "border-[#7ec79c] text-[#a6f0c2] font-medium"
                : "border-transparent text-[#7d7568] hover:text-[#ddd0b0]"
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-[#7ec79c]" />
            <span>Sanidade ({sanityVal}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("npcs")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "npcs"
                ? "border-[#8a6d3b] text-[#ddd0b0] font-medium"
                : "border-transparent text-[#7d7568] hover:text-[#ddd0b0]"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#8a6d3b]" />
            <span>NPCs ({ledger.npcs?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clues")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "clues"
                ? "border-[#8a6d3b] text-[#ddd0b0] font-medium"
                : "border-transparent text-[#7d7568] hover:text-[#ddd0b0]"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#8a6d3b]" />
            <span>Pistas ({ledger.clues?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lies")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "lies"
                ? "border-[#8a6d3b] text-[#ddd0b0] font-medium"
                : "border-transparent text-[#7d7568] hover:text-[#ddd0b0]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#8a6d3b]" />
            <span>Mentiras ({ledger.playerLies?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "notes"
                ? "border-[#8a6d3b] text-[#ddd0b0] font-medium"
                : "border-transparent text-[#7d7568] hover:text-[#ddd0b0]"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#8a6d3b]" />
            <span>Anotações ({ledger.playerNotes?.length || 0})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 0: PROGRESSO DA INVESTIGAÇÃO (Recharts Visual Panel) */}
          {activeTab === "progress" && (
            <div className="animate-fadeIn">
              <InvestigationProgressPanel
                ledger={ledger}
                onUpdateLedger={onUpdateLedger}
              />
            </div>
          )}

          {/* TAB: SANIDADE & ESTABILIDADE MENTAL */}
          {activeTab === "sanity" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Main Sanity Gauge Card */}
              <div className={`p-4 rounded-lg border relative overflow-hidden ${
                sanityVal >= 75
                  ? "bg-[#101914] border-[#294c34]"
                  : sanityVal >= 50
                  ? "bg-[#211910] border-[#6b4923]"
                  : sanityVal >= 25
                  ? "bg-[#281212] border-[#7d2c23]"
                  : "bg-[#330f16] border-[#9e1f37] animate-pulse"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#9e8f7c]">
                      Estabilidade Psíquica (Cânone LoM)
                    </span>
                    <h3 className="font-['Cinzel'] text-lg font-bold text-[#fbf6ed] flex items-center gap-2 mt-0.5">
                      <Brain className={`w-5 h-5 ${
                        sanityVal >= 75
                          ? "text-[#85cca1]"
                          : sanityVal >= 50
                          ? "text-[#e3aa59]"
                          : sanityVal >= 25
                          ? "text-[#f08578]"
                          : "text-[#ff6b85]"
                      }`} />
                      <span>
                        {sanityVal >= 75
                          ? "Mente Lúcida e Racional"
                          : sanityVal >= 50
                          ? "Estado de Alerta & Tensão"
                          : sanityVal >= 25
                          ? "Percepção Perturbada & Delírio"
                          : "À Beira do Colapso & Mutação"}
                      </span>
                    </h3>
                    <p className="text-xs font-serif text-[#c4b6a1] mt-1 leading-relaxed">
                      {sanityVal >= 75
                        ? "Sua consciência permanece ancorada na realidade mundana. Os sussurros do místico ainda não penetraram sua barreira cognitiva."
                        : sanityVal >= 50
                        ? "A névoa de Backlund e as pistas ocultas começam a desgastar seus nervos. Pequenas sombras parecem se mover na visão periférica."
                        : sanityVal >= 25
                        ? "Distorções graves de percepção. Os ponteiros dos relógios parecem hesitar, e vozes indistintas ecoam do vazio astral ao fechar os olhos."
                        : "Risco extremo de Perda de Controle (Loss of Control). A carne pode se romper em tentáculos ou olhos aberretes a qualquer momento!"}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-3xl font-['Cinzel'] font-bold text-[#f3ede2] block">
                      {sanityVal}%
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 text-[#dfb87f] border border-[#52412b]">
                      {sanityVal >= 75 ? "Seguro" : sanityVal >= 50 ? "Alerta" : sanityVal >= 25 ? "Crítico" : "Fatal"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 w-full bg-[#161a22] rounded-full h-2.5 overflow-hidden border border-[#362e22]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      sanityVal >= 75
                        ? "bg-gradient-to-r from-[#2f6e47] to-[#85cca1]"
                        : sanityVal >= 50
                        ? "bg-gradient-to-r from-[#8a5d25] to-[#e3aa59]"
                        : sanityVal >= 25
                        ? "bg-gradient-to-r from-[#9c3024] to-[#f08578]"
                        : "bg-gradient-to-r from-[#b31435] to-[#ff6b85]"
                    }`}
                    style={{ width: `${Math.max(4, Math.min(100, sanityVal))}%` }}
                  />
                </div>
              </div>

              {/* Stabilize composure action */}
              <div className="p-3.5 rounded-lg bg-[#141822] border border-[#2d3444] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-['Cinzel'] font-bold text-[#dfb87f] uppercase">
                    <Coffee className="w-3.5 h-3.5 text-[#dfb87f]" />
                    <span>Recomposição Mental</span>
                  </div>
                  <p className="text-xs font-serif text-[#a39785]">
                    Pausar a investigação, beber chá quente e respirar fundo para ancorar a razão.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSanity = Math.min(100, sanityVal + 5);
                    const newHistory = [
                      ...(ledger.sanityHistory || []),
                      {
                        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                        delta: 5,
                        reason: "Pausa consciente para ancoragem psicológica e chá quente",
                      },
                    ];
                    onUpdateLedger({
                      ...ledger,
                      sanity: newSanity,
                      sanityStatus: newSanity >= 75 ? "Lúcido" : newSanity >= 50 ? "Alerta" : "Perturbado",
                      sanityHistory: newHistory,
                      playerNotes: [
                        ...(ledger.playerNotes || []),
                        `[Recomposição Mental]: Recobrei a calma e estabilizei minha respiração. Sanidade restaurada para ${newSanity}%.`,
                      ],
                    });
                  }}
                  disabled={sanityVal >= 100}
                  className="px-3 py-1.5 rounded border border-[#6b5233] bg-[#221b13] hover:bg-[#2e2418] hover:border-[#a8824f] text-[#dfb87f] disabled:opacity-40 disabled:pointer-events-none text-xs font-serif flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#dfb87f]" />
                  <span>Ancorar Mente (+5%)</span>
                </button>
              </div>

              {/* Canonical LoM Lore rules */}
              <div className="p-3.5 rounded-lg bg-[#111620] border border-[#293245] space-y-2 text-xs font-serif">
                <div className="flex items-center gap-2 text-[11px] font-['Cinzel'] font-bold text-[#c9a875] uppercase border-b border-[#252c3d] pb-1">
                  <Shield className="w-3.5 h-3.5 text-[#c9a875]" />
                  <span>Perigos Psíquicos em Lord of the Mysteries</span>
                </div>
                <ul className="space-y-1.5 text-[#b5a995] leading-relaxed list-disc list-inside">
                  <li><strong className="text-[#e5dac6]">Lua Carmesim:</strong> O plenilúnio intensifica o anseio instintivo por sangue e desperta impulsos caóticos.</li>
                  <li><strong className="text-[#e5dac6]">Línguas Proibidas:</strong> Hermes Antigo, Dragão e Élfico conduzem poder místico e ferem mentes sem proteção ritual.</li>
                  <li><strong className="text-[#e5dac6]">Perda de Controle:</strong> Quando a sanidade colapsa, a característica de Beyonder se rebela, transformando o hospedeiro em um monstro aberrente.</li>
                </ul>
              </div>

              {/* Sanity History */}
              <div className="space-y-2">
                <h4 className="font-['Cinzel'] text-xs font-bold text-[#dfb87f] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#dfb87f]" />
                  <span>Histórico de Flutuações Psíquicas</span>
                </h4>
                {(!ledger.sanityHistory || ledger.sanityHistory.length === 0) ? (
                  <div className="p-5 text-center border border-dashed border-[#2d251a] rounded-lg text-xs text-[#736a5c] font-serif">
                    Nenhuma perturbação profunda registrada até o momento. Sua mente permanece firme sob as brumas de Loen.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...ledger.sanityHistory].reverse().map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-[#131722] border border-[#273042] flex items-start justify-between gap-3 text-xs font-serif"
                      >
                        <div className="space-y-0.5">
                          <p className="text-[#e0d6c5]">{item.reason}</p>
                          <span className="text-[10px] font-mono text-[#786d5c]">
                            Horário: {typeof item.timestamp === "number" ? new Date(item.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : item.timestamp}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold flex-shrink-0 ${
                          item.delta > 0
                            ? "bg-[#14261d] text-[#63d191] border border-[#275239]"
                            : "bg-[#291414] text-[#f28e83] border border-[#6b251f]"
                        }`}>
                          {item.delta > 0 ? `+${item.delta}%` : `${item.delta}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: NPCs */}
          {activeTab === "npcs" && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#141822] border border-[#2b3345] text-xs font-serif text-[#c9bfae] leading-relaxed">
                <p className="font-semibold text-[#dfb87f] font-mono uppercase text-[11px] mb-0.5">
                  Memória Inquebrável Ativa:
                </p>
                Cada indivíduo retém a memória exata de palavras, promessas, mentiras e acordos passados. Ninguém esquecerá o que você fez ou disse.
              </div>

              {!ledger.npcs || ledger.npcs.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[#2d251a] rounded-lg text-sm text-[#736a5c] font-serif">
                  Nenhum indivíduo registrado até o momento. Conduza conversas para catalogar nomes e posturas.
                </div>
              ) : (
                ledger.npcs.map((npc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-[#141822] border border-[#2d3444] space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <NpcAvatarSilhouette
                          name={npc.name}
                          role={npc.role}
                          attitude={npc.attitude}
                          size="md"
                        />
                        <div>
                          <h3 className="font-['Cinzel'] text-sm text-[#f0e6d6] font-bold">
                            {npc.name}
                          </h3>
                          {npc.role && (
                            <p className="text-[11px] text-[#a39785] font-serif leading-none mt-0.5">
                              {npc.role}
                            </p>
                          )}
                        </div>
                      </div>
                      {npc.attitude && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1f2633] text-[#c9a875] border border-[#3b4356] flex-shrink-0">
                          {npc.attitude}
                        </span>
                      )}
                    </div>

                    {npc.conversationMemory && npc.conversationMemory.length > 0 && (
                      <div className="pt-1.5 border-t border-[#232938]">
                        <span className="text-[10px] font-mono uppercase text-[#dfb87f] flex items-center gap-1 mb-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>Fatos Lembrados por este NPC:</span>
                        </span>
                        <ul className="space-y-1">
                          {npc.conversationMemory.map((mem, mIdx) => (
                            <li key={mIdx} className="text-xs text-[#d8cdbd] font-serif pl-2 border-l border-[#8b6f47]/40">
                              {mem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {npc.secretsKnown && (
                      <p className="text-xs text-[#d19c94] font-serif bg-[#221716] p-2 rounded border border-[#482824]">
                        <strong>Segredo Observado:</strong> {npc.secretsKnown}
                      </p>
                    )}

                    {npc.notes && (
                      <p className="text-xs text-[#ded3c3] font-serif pt-1 border-t border-[#232938]">
                        {npc.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PISTAS */}
          {activeTab === "clues" && (
            <div className="space-y-3">
              <form onSubmit={handleAddClue} className="flex gap-2">
                <input
                  type="text"
                  value={newClue}
                  onChange={(e) => setNewClue(e.target.value)}
                  placeholder="Registrar nova dedução ou pista..."
                  className="flex-1 px-3 py-1.5 rounded bg-[#141924] border border-[#2b3342] text-xs text-[#ebdcc6] focus:outline-none focus:border-[#8b6f47]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-[#2c2419] hover:bg-[#3d3222] border border-[#6b5435] text-[#dfb87f] text-xs font-serif flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </form>

              {!ledger.clues || ledger.clues.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[#2d251a] rounded-lg text-sm text-[#736a5c] font-serif">
                  Nenhuma pista catalogada. Observe objetos, marcas arcanas e contradições.
                </div>
              ) : (
                <ul className="space-y-2">
                  {ledger.clues.map((clue, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded bg-[#131720] border border-[#262c3b] text-xs text-[#d8cdbd] font-serif flex items-start gap-2"
                    >
                      <span className="text-[#c9a875] font-mono mt-0.5">•</span>
                      <span>{clue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* TAB 3: MENTIRAS & PROMESSAS */}
          {activeTab === "lies" && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#241a15] border border-[#483321] text-xs font-serif text-[#dbcaa8] leading-relaxed">
                Toda mentira proferida ou promessa assumida pelo jogador é registrada. Testemunhas e autoridades recordarão cada discrepância lógica.
              </div>

              {!ledger.playerLies || ledger.playerLies.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[#2d251a] rounded-lg text-sm text-[#736a5c] font-serif">
                  Nenhuma mentira ou contradição registrada até o momento.
                </div>
              ) : (
                <ul className="space-y-2">
                  {ledger.playerLies.map((lie, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded bg-[#1d1717] border border-[#4d2d2a] text-xs text-[#ebd2cd] font-serif flex items-start gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-[#e0897b] flex-shrink-0 mt-0.5" />
                      <span>{lie}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* TAB 4: ANOTAÇÕES */}
          {activeTab === "notes" && (
            <div className="space-y-3">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Escrever uma nota de investigação..."
                  className="flex-1 px-3 py-1.5 rounded bg-[#141924] border border-[#2b3342] text-xs text-[#ebdcc6] focus:outline-none focus:border-[#8b6f47]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-[#2c2419] hover:bg-[#3d3222] border border-[#6b5435] text-[#dfb87f] text-xs font-serif flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>
              </form>

              {!ledger.playerNotes || ledger.playerNotes.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[#2d251a] rounded-lg text-sm text-[#736a5c] font-serif">
                  Nenhuma nota escrita pelo jogador. Registre hipóteses e suspeitas.
                </div>
              ) : (
                <ul className="space-y-2">
                  {ledger.playerNotes.map((note, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded bg-[#141820] border border-[#2b3342] text-xs text-[#ded3c3] font-serif flex items-start justify-between gap-2"
                    >
                      <span>{note}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNote(idx)}
                        className="text-[#887c6b] hover:text-[#d38379] p-1 transition-colors"
                        title="Remover nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#292217] bg-[#121620] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded border border-[#3c3325] bg-[#1a202c] hover:bg-[#252d3d] text-[#c9bfae] text-xs font-serif flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copiado!" : "Copiar Diário"}</span>
          </button>

          <button
            type="button"
            onClick={onExportMarkdown}
            className="px-3 py-1.5 rounded border border-[#8b6f47] bg-[#2a2014] hover:bg-[#3d2f1f] text-[#dfb87f] text-xs font-serif flex items-center gap-1.5 transition-colors font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Crônica (.md)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
