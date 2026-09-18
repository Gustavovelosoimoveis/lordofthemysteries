import React, { useState } from "react";
import { LedgerData } from "../types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Compass,
  CheckCircle2,
  HelpCircle,
  Eye,
  Sparkles,
  Plus,
  RotateCcw,
  ShieldAlert,
  Search,
  BookOpen,
} from "lucide-react";

interface InvestigationProgressPanelProps {
  ledger: LedgerData;
  onUpdateLedger: (updated: LedgerData) => void;
}

export const InvestigationProgressPanel: React.FC<InvestigationProgressPanelProps> = ({
  ledger,
  onUpdateLedger,
}) => {
  const [newMysteryInput, setNewMysteryInput] = useState("");
  const [newSecretInput, setNewSecretInput] = useState("");
  const [showAddForm, setShowAddForm] = useState<"none" | "mystery" | "secret">("none");

  const activeMysteries = ledger.mysteries || [];
  const resolvedMysteries = ledger.resolvedMysteries || [];
  const totalMysteries = activeMysteries.length + resolvedMysteries.length;

  const secretsDiscovered = ledger.secretsDiscovered || [];
  const npcSecrets = (ledger.npcs || []).filter((n) => Boolean(n.secretsKnown));
  const totalSecrets = secretsDiscovered.length + npcSecrets.length;

  // Percentage of mysteries solved
  const resolvedPercentage =
    totalMysteries > 0
      ? Math.round((resolvedMysteries.length / totalMysteries) * 100)
      : 0;

  // Ratio percentage: Resolved mysteries compared to discovered secrets
  const mysteryToSecretPercentage =
    totalSecrets > 0
      ? Math.round((resolvedMysteries.length / totalSecrets) * 100)
      : resolvedMysteries.length > 0
      ? 100
      : 0;

  // Rank / Title
  const getInvestigatorRank = () => {
    if (resolvedPercentage >= 80) {
      return {
        title: "Mestre dos Enigmas Além do Véu",
        desc: "Capaz de discernir os sussurros dos Deuses Exteriores sem sucumbir à loucura.",
        badgeColor: "border-[#e5c07b] text-[#eed2a5] bg-[#2a2215]",
      };
    }
    if (resolvedPercentage >= 50) {
      return {
        title: "Decifrador de Conspirações",
        desc: "Os fios das sociedades secretas de Backlund começam a fazer sentido lógico.",
        badgeColor: "border-[#8b6f47] text-[#dfb87f] bg-[#1e1913]",
      };
    }
    if (resolvedPercentage >= 20 || totalSecrets >= 2) {
      return {
        title: "Buscador de Segredos Ocultos",
        desc: "Você já viu o que não deveria ter sido visto por olhos mortais.",
        badgeColor: "border-[#4a5568] text-[#c9bfae] bg-[#141923]",
      };
    }
    return {
      title: "Investigador Cego pela Névoa",
      desc: "Suas deduções ainda são superficiais diante da névoa de Loen e das Igrejas Ortodoxas.",
      badgeColor: "border-[#352d21] text-[#9a8c79] bg-[#12151c]",
    };
  };

  const rank = getInvestigatorRank();

  // Donut chart data for mysteries resolution
  const donutData = [
    {
      name: "Resolvidos",
      value: resolvedMysteries.length,
      color: "#dfb87f", // Antique gold
    },
    {
      name: "Em Investigação",
      value: Math.max(activeMysteries.length, totalMysteries === 0 ? 1 : 0),
      color: "#232b38", // Victorian cold charcoal
    },
  ];

  // Bar chart comparative data
  const comparisonData = [
    {
      name: "Resolvidos",
      quantidade: resolvedMysteries.length,
      fill: "#dfb87f",
    },
    {
      name: "Ativos",
      quantidade: activeMysteries.length,
      fill: "#63748c",
    },
    {
      name: "Segredos",
      quantidade: totalSecrets,
      fill: "#c25e52",
    },
    {
      name: "Pistas",
      quantidade: ledger.clues?.length || 0,
      fill: "#8a755d",
    },
  ];

  // Handlers
  const handleResolveMystery = (index: number) => {
    const mystery = activeMysteries[index];
    const newActive = activeMysteries.filter((_, i) => i !== index);
    const newResolved = Array.from(new Set([...resolvedMysteries, mystery]));

    onUpdateLedger({
      ...ledger,
      mysteries: newActive,
      resolvedMysteries: newResolved,
    });
  };

  const handleReopenMystery = (index: number) => {
    const mystery = resolvedMysteries[index];
    const newResolved = resolvedMysteries.filter((_, i) => i !== index);
    const newActive = Array.from(new Set([...activeMysteries, mystery]));

    onUpdateLedger({
      ...ledger,
      mysteries: newActive,
      resolvedMysteries: newResolved,
    });
  };

  const handleAddMystery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMysteryInput.trim()) return;
    onUpdateLedger({
      ...ledger,
      mysteries: [...activeMysteries, newMysteryInput.trim()],
    });
    setNewMysteryInput("");
    setShowAddForm("none");
  };

  const handleAddSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretInput.trim()) return;
    onUpdateLedger({
      ...ledger,
      secretsDiscovered: [...secretsDiscovered, newSecretInput.trim()],
    });
    setNewSecretInput("");
    setShowAddForm("none");
  };

  // Custom Victorian Tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-[#10141d] border border-[#52412b] p-2 rounded shadow-xl text-xs font-serif">
          <p className="text-[#dfb87f] font-['Cinzel'] font-bold">{data.name || data.payload?.name}</p>
          <p className="text-[#e2d8c9] font-mono">
            Quantidade: <span className="font-bold text-[#f7f2ea]">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Victorian Title Badge & Progress Rank */}
      <div className={`p-4 rounded-lg border ${rank.badgeColor} relative overflow-hidden shadow-lg shadow-black/40`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#dfb87f]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#a89578] uppercase">
              Patamar de Dedução Oculta
            </span>
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[#f3ede2] tracking-wide mt-0.5">
              {rank.title}
            </h3>
            <p className="text-xs font-serif text-[#b8ab97] italic mt-1 max-w-sm leading-relaxed">
              “{rank.desc}”
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] font-mono uppercase text-[#9e8b75] block">
              Eficiência
            </span>
            <span className="font-['Cinzel'] text-2xl font-bold text-[#dfb87f]">
              {resolvedPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Donut + Bar comparative */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* CHART 1: Donut Gauge - % Mistérios Resolvidos */}
        <div className="p-3.5 rounded-lg bg-[#11151f] border border-[#2e261a] flex flex-col items-center justify-center relative">
          <div className="w-full flex items-center justify-between border-b border-[#241f17] pb-1 mb-1">
            <span className="text-[11px] font-['Cinzel'] font-bold text-[#dfb87f] uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#c9a875]" />
              <span>Resolução do Caso</span>
            </span>
            <span className="text-[10px] font-mono text-[#8a7a67]">
              {resolvedMysteries.length} de {totalMysteries}
            </span>
          </div>

          <div className="relative w-full h-36 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={52}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth={1}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered number in donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-['Cinzel'] text-xl font-bold text-[#f5ebd9] leading-none">
                {resolvedPercentage}%
              </span>
              <span className="text-[9px] font-mono text-[#a69784] uppercase tracking-wider mt-0.5">
                Resolvido
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] font-serif text-[#b8ab99] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dfb87f]" />
              <span>Elucidados ({resolvedMysteries.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#232b38]" />
              <span>Pendentes ({activeMysteries.length})</span>
            </div>
          </div>
        </div>

        {/* CHART 2: Comparative Bar Chart (Mistérios x Segredos x Pistas) */}
        <div className="p-3.5 rounded-lg bg-[#11151f] border border-[#2e261a] flex flex-col justify-between">
          <div className="w-full flex items-center justify-between border-b border-[#241f17] pb-1 mb-1">
            <span className="text-[11px] font-['Cinzel'] font-bold text-[#dfb87f] uppercase flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#c25e52]" />
              <span>Segredos & Evidências</span>
            </span>
            <span className="text-[10px] font-mono text-[#8a7a67]">
              Razão: {mysteryToSecretPercentage}%
            </span>
          </div>

          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9f8e7a", fontSize: 10, fontFamily: "Cinzel" }}
                  interval={0}
                  axisLine={{ stroke: "#2b2318" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#736453", fontSize: 9, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantidade" radius={[3, 3, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-center font-serif text-[#958774] italic pt-1">
            {totalSecrets > 0
              ? `${totalSecrets} segredo(s) descoberto(s) fundamentam ${resolvedMysteries.length} mistério(s) resolvido(s).`
              : "Investigue indivíduos suspeitos e rituais para desvendar segredos arcanos."}
          </p>
        </div>
      </div>

      {/* Metric Ratio Banner */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-[#17130f] via-[#141824] to-[#11151e] border border-[#423321] flex items-center justify-between text-xs font-serif">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#dfb87f] flex-shrink-0" />
          <span className="text-[#dbcaa8]">
            Proporção de <strong>Mistérios Resolvidos</strong> em relação aos <strong>Segredos Descobertos</strong>:
          </span>
        </div>
        <div className="font-['Cinzel'] font-bold text-[#eed2a5] text-sm px-2.5 py-0.5 rounded bg-[#241c14] border border-[#594228]">
          {mysteryToSecretPercentage}%
        </div>
      </div>

      {/* Interactive Lists of Mysteries & Secrets */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between border-b border-[#261f16] pb-1.5">
          <h4 className="font-['Cinzel'] text-xs font-bold text-[#dfb87f] uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#c9a875]" />
            <span>Mistérios Ativos ({activeMysteries.length})</span>
          </h4>

          <button
            type="button"
            onClick={() => setShowAddForm(showAddForm === "mystery" ? "none" : "mystery")}
            className="text-[11px] font-serif text-[#c9a875] hover:text-[#f0e6d6] flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Adicionar Mistério</span>
          </button>
        </div>

        {showAddForm === "mystery" && (
          <form onSubmit={handleAddMystery} className="flex gap-2 p-2 rounded bg-[#151924] border border-[#3b3427] animate-fadeIn">
            <input
              type="text"
              value={newMysteryInput}
              onChange={(e) => setNewMysteryInput(e.target.value)}
              placeholder="Descrever enigma ou pergunta aberta da investigação..."
              className="flex-1 px-3 py-1.5 rounded bg-[#0d1017] border border-[#2b3345] text-xs text-[#ebdcc6] focus:outline-none focus:border-[#8b6f47]"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#2c2419] hover:bg-[#3d3222] border border-[#6b5435] text-[#dfb87f] text-xs font-serif"
            >
              Registrar
            </button>
          </form>
        )}

        {activeMysteries.length === 0 ? (
          <p className="p-3 text-center text-xs text-[#786e5e] italic border border-dashed border-[#241e15] rounded">
            Nenhum mistério pendente no momento. Explore locais e interrogue testemunhas.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {activeMysteries.map((m, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded bg-[#121620] border border-[#262c3b] flex items-start justify-between gap-2.5 text-xs text-[#ded3c3] font-serif group hover:border-[#4b3f2e] transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-[#c9a875] font-mono mt-0.5">•</span>
                  <span className="leading-relaxed">{m}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveMystery(idx)}
                  className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#1b2519] border border-[#2e4d29] text-[#78c772] hover:bg-[#253823] transition-colors flex-shrink-0"
                  title="Marcar mistério como solucionado"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Solucionar</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Resolved Mysteries (Click to reopen if needed) */}
        {resolvedMysteries.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="font-['Cinzel'] text-xs font-bold text-[#78c772] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1c2e1b] pb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#78c772]" />
              <span>Mistérios Solucionados ({resolvedMysteries.length})</span>
            </h4>

            <ul className="space-y-1.5">
              {resolvedMysteries.map((m, idx) => (
                <li
                  key={idx}
                  className="p-2 rounded bg-[#101b13]/60 border border-[#213824] flex items-start justify-between gap-2 text-xs text-[#c5dfc4] font-serif"
                >
                  <span className="line-through decoration-[#4e7d4c] opacity-90 leading-relaxed">
                    {m}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleReopenMystery(idx)}
                    className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1d261e] border border-[#3b543c] text-[#a4c7a2] hover:text-[#f0e6d6] transition-colors flex-shrink-0"
                    title="Reabrir se surgiram novas contradições"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reabrir</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Discovered Secrets Section */}
        <div className="space-y-2 pt-3 border-t border-[#261f16]">
          <div className="flex items-center justify-between">
            <h4 className="font-['Cinzel'] text-xs font-bold text-[#c25e52] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#c25e52]" />
              <span>Segredos Ocultos Catalogados ({totalSecrets})</span>
            </h4>

            <button
              type="button"
              onClick={() => setShowAddForm(showAddForm === "secret" ? "none" : "secret")}
              className="text-[11px] font-serif text-[#c25e52] hover:text-[#ebd2cd] flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Anotar Segredo</span>
            </button>
          </div>

          {showAddForm === "secret" && (
            <form onSubmit={handleAddSecret} className="flex gap-2 p-2 rounded bg-[#201514] border border-[#4d2d2a] animate-fadeIn">
              <input
                type="text"
                value={newSecretInput}
                onChange={(e) => setNewSecretInput(e.target.value)}
                placeholder="Revelação oculta, heresia ou identidade descoberta..."
                className="flex-1 px-3 py-1.5 rounded bg-[#140e0e] border border-[#3d2422] text-xs text-[#ebd2cd] focus:outline-none focus:border-[#c25e52]"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-[#381a17] hover:bg-[#4d2320] border border-[#6d302a] text-[#ebd2cd] text-xs font-serif"
              >
                Salvar
              </button>
            </form>
          )}

          {totalSecrets === 0 ? (
            <p className="p-3 text-center text-xs text-[#786e5e] italic border border-dashed border-[#241e15] rounded">
              Nenhum segredo oculto catalogado ainda. Preste atenção aos lapsos e confissões dos NPCs.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {secretsDiscovered.map((sec, idx) => (
                <li
                  key={`sec-${idx}`}
                  className="p-2 rounded bg-[#1e1313] border border-[#4a2623] text-xs text-[#ebd5d2] font-serif flex items-start gap-2"
                >
                  <span className="text-[#c25e52] font-mono mt-0.5">♦</span>
                  <span className="leading-relaxed">{sec}</span>
                </li>
              ))}
              {npcSecrets.map((npc, idx) => (
                <li
                  key={`npc-sec-${idx}`}
                  className="p-2 rounded bg-[#191319] border border-[#442b47] text-xs text-[#dfd0e0] font-serif flex items-start gap-2"
                >
                  <span className="text-[#b573be] font-mono mt-0.5">♦</span>
                  <span className="leading-relaxed">
                    <strong className="text-[#f0e3f2] font-['Cinzel']">{npc.name}:</strong> {npc.secretsKnown}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
