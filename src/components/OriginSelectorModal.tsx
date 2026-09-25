import React, { useState } from "react";
import { GameMode, GameOrigin } from "../types";
import { Scroll, X, Shield, Brain, Activity, Eye, MessageSquare, Plus, Minus, Cpu, Sparkles, RefreshCw, Hash } from "lucide-react";

interface OriginSelectorModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSelectOrigin: (origin: GameOrigin, customPrompt?: string) => void;
  isInitial?: boolean;
  isNameOnly?: boolean;
  currentOrigin?: GameOrigin | null;
  onUpdatePlayerName?: (name: string) => void;
  gameMode?: GameMode;
  onGameModeChange?: (mode: GameMode) => void;
  offlineStats?: { starts: number; endings: number; intents: number; events?: number; agendas?: number };
}

type OriginOptions = "Pessoa Normal de Loen" | "Amnésico Humano" | "Transmigrado da Terra";

export const OriginSelectorModal: React.FC<OriginSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectOrigin,
  isInitial = false,
  isNameOnly = false,
  currentOrigin = null,
  onUpdatePlayerName,
  gameMode = "offline",
  onGameModeChange,
  offlineStats = { starts: 24, endings: 30, intents: 19, events: 0, agendas: 0 },
}) => {
  const [playerName, setPlayerName] = useState(currentOrigin?.playerName || "");
  const [gender, setGender] = useState(currentOrigin?.gender || "Masculino");
  const [originType, setOriginType] = useState<OriginOptions>(
    (currentOrigin?.originType as OriginOptions) || "Pessoa Normal de Loen"
  );
  const [earthProfession, setEarthProfession] = useState("");
  const makeSeed = () => `LOEN-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const [campaignSeed, setCampaignSeed] = useState(currentOrigin?.campaignSeed || makeSeed());

  const [attributes, setAttributes] = useState(
    currentOrigin?.attributes || {
      vigor: 1,
      destreza: 1,
      intelecto: 1,
      percepcao: 1,
      carisma: 1,
    }
  );

  // Cada nova crônica recebe uma seed nova por padrão; saves existentes preservam a seed original.
  React.useEffect(() => {
    if (isOpen && isInitial && !currentOrigin?.campaignSeed) {
      setCampaignSeed(makeSeed());
    }
  }, [isOpen, isInitial, currentOrigin?.campaignSeed]);

  // Sync with currentOrigin if it changes
  React.useEffect(() => {
    if (currentOrigin?.playerName) {
      setPlayerName(currentOrigin.playerName);
    }
    if (currentOrigin?.attributes) {
      setAttributes(currentOrigin.attributes);
    }
    if (currentOrigin?.gender) {
      setGender(currentOrigin.gender);
    }
    if (currentOrigin?.originType) {
      setOriginType(currentOrigin.originType as OriginOptions);
    }
    if (currentOrigin?.campaignSeed) {
      setCampaignSeed(currentOrigin.campaignSeed);
    }
  }, [currentOrigin]);

  if (!isOpen) return null;

  // Handler specifically for when only the name is missing
  const handleConfirmNameOnly = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = playerName.trim();
    if (!trimmed) return;

    if (onUpdatePlayerName) {
      onUpdatePlayerName(trimmed);
    } else if (currentOrigin) {
      onSelectOrigin({
        ...currentOrigin,
        playerName: trimmed,
        title: `${trimmed} (${currentOrigin.originType || "Investigador"})`,
      });
    }
    onClose?.();
  };

  // Dedicated focused view if ONLY the name is missing
  if (isNameOnly) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
        <div className="w-full max-w-md bg-[#0d1118] border-2 border-[#8a6d3b]/70 rounded-xl flex flex-col shadow-2xl shadow-black overflow-hidden victorian-border-gold">
          {/* Header */}
          <div className="p-5 border-b border-[#292217] bg-[#121622] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-[#8a6d3b] bg-[#1a150e] flex items-center justify-center text-[#dfb87f]">
                <Scroll className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-['Cinzel'] text-base sm:text-lg text-[#f0e6d6] font-bold tracking-wide">
                  Identidade do Investigador
                </h2>
                <p className="text-xs text-[#9a8e7c] font-serif">
                  Declare seu nome antes de prosseguir no nevoeiro.
                </p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded text-[#8b8273] hover:text-[#e5dac6] hover:bg-[#1c222f]"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <form onSubmit={handleConfirmNameOnly} className="p-5 space-y-4">
            <div className="p-3 rounded-lg bg-[#141924] border border-[#2b3548] text-xs font-serif text-[#c7baa8] leading-relaxed">
              <p>
                No universo de <em>Lord of the Mysteries</em>, um nome é uma âncora que protege a mente humana contra os murmúrios do cosmos e a perda de controle.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#dfb87f] mb-1.5 font-bold">
                Nome do Personagem / Identidade em Loen
              </label>
              <input
                type="text"
                autoFocus
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ex: Arthur, Edward, Leonard, Sean..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#161a25] border-2 border-[#8a6d3b]/50 text-base text-[#ebdcc6] focus:outline-none focus:border-[#dfb87f] shadow-inner font-serif"
              />
            </div>

            {currentOrigin && (
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8a7e6b] px-1 pt-1 border-t border-[#231b12]">
                <span>Origem: {currentOrigin.originType || "Pessoa Normal de Loen"}</span>
                <span>Atributos: Preservados</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#292217] flex justify-end">
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="w-full py-3 px-6 rounded-lg border border-[#8a6d3b] bg-gradient-to-r from-[#382b19] to-[#241c10] text-[#f0e6d6] hover:from-[#4d3c23] hover:to-[#332717] hover:border-[#dfb87f] font-['Cinzel'] tracking-wider text-xs uppercase font-bold transition-all shadow-md disabled:opacity-40"
              >
                Gravar Nome & Prosseguir
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const totalPoints =
    attributes.vigor +
    attributes.destreza +
    attributes.intelecto +
    attributes.percepcao +
    attributes.carisma;
  const pointsLeft = 15 - totalPoints;

  const handleAttributeChange = (attr: keyof typeof attributes, delta: number) => {
    setAttributes((prev) => {
      const newVal = prev[attr] + delta;
      if (newVal >= 1 && newVal <= 5 && (delta < 0 || pointsLeft > 0)) {
        return { ...prev, [attr]: newVal };
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    if (!playerName.trim()) return;

    let originDetails = "";
    let flavorText = "";

    if (originType === "Transmigrado da Terra") {
      originDetails = `Transmigrado da Terra. Profissão original: ${earthProfession || "Desconhecida"}. Acabou de possuir o corpo de um habitante em Loen.`;
      flavorText = "Uma alma estrangeira habitando um corpo desconhecido no nevoeiro.";
    } else if (originType === "Amnésico Humano") {
      originDetails = "Humano Amnésico. Acordou sem memórias de quem é ou de seu passado.";
      flavorText = "O passado é um vazio; o presente, um perigo iminente.";
    } else {
      originDetails = "Pessoa Normal de Loen. Um cidadão mundano pego no fogo cruzado do oculto.";
      flavorText = "Apenas mais um peão ignorante no tabuleiro dos deuses.";
    }

    const customPrompt = `[FICHA DE INVESTIGADOR]
Nome: ${playerName.trim()}
Gênero: ${gender}
Origem: ${originDetails}
Atributos RPG (Mín 1, Máx 10): [VIGOR: ${attributes.vigor} | DESTREZA: ${attributes.destreza} | INTELECTO: ${attributes.intelecto} | PERCEPÇÃO: ${attributes.percepcao} | CARISMA: ${attributes.carisma}]

INSTRUÇÃO PARA O GAME MASTER: O jogador ACABOU de despertar. Ele é 100% mundano, NÃO tem poção, e NÃO sabe nada sobre magias ou "Beyonders". NUNCA faça perguntas como "o que você fazia antes?". O jogo já começou. Exija que as ações dele dependam dos Atributos acima. Narre a cena inicial assustadora/misteriosa em 1ª pessoa no formato obrigatório [CENA], [DIÁLOGO] e [STATUS DO MUNDO] e termine com um dilema tenso.`;

    const newOrigin: GameOrigin = {
      id: "custom-" + Date.now(),
      title: `${playerName.trim()} (${originType})`,
      location: "Reino de Loen (Local Aleatório)",
      year: "1340 do Calendário das Cinco Eras",
      summary: originDetails,
      flavor: flavorText,
      initialPrompt: customPrompt,
      playerName: playerName.trim(),
      gender: gender,
      originType: originType,
      attributes: attributes,
      campaignSeed: campaignSeed.trim().toUpperCase() || makeSeed(),
    };

    onSelectOrigin(newOrigin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#0d1118] border border-[#8a6d3b]/40 rounded-xl flex flex-col shadow-2xl shadow-black overflow-hidden">
        
        <div className="p-5 border-b border-[#292217] bg-[#121622] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#8a6d3b] bg-[#1a150e] flex items-center justify-center text-[#dfb87f]">
              <Scroll className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] text-base sm:text-lg text-[#f0e6d6] font-bold tracking-wide">
                Ficha do Investigador
              </h2>
              <p className="text-xs text-[#9a8e7c] font-serif">
                Distribua seus status e defina sua identidade no nevoeiro de Loen.
              </p>
            </div>
          </div>
          {!isInitial && onClose && (
            <button onClick={onClose} className="p-1.5 rounded text-[#8b8273] hover:text-[#e5dac6] hover:bg-[#1c222f]">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-mono uppercase text-[#a89371]">Motor Narrativo</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onGameModeChange?.("offline")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  gameMode === "offline"
                    ? "bg-[#18231d] border-[#5f8c70] shadow-[0_0_18px_rgba(95,140,112,0.12)]"
                    : "bg-[#11151e] border-[#252c3b] hover:border-[#4b5b70]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-4 h-4 text-[#8fc7a4]" />
                  <span className="font-['Cinzel'] text-xs font-bold uppercase text-[#eef6ef]">Motor Local</span>
                  <span className="ml-auto text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#5f8c70]/60 text-[#9fd0ad]">Sem API</span>
                </div>
                <p className="text-[10px] text-[#aab7ad] font-serif leading-relaxed">
                  Funciona sem IA e sem chave externa. Interpreta texto livre por intenção, alvo, tom, atributos e memória. {offlineStats.starts} prólogos e {offlineStats.endings} finais possíveis.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onGameModeChange?.("ai")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  gameMode === "ai"
                    ? "bg-[#241d2d] border-[#8062a1] shadow-[0_0_18px_rgba(128,98,161,0.12)]"
                    : "bg-[#11151e] border-[#252c3b] hover:border-[#4b5b70]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#c7a6e8]" />
                  <span className="font-['Cinzel'] text-xs font-bold uppercase text-[#f1e9f8]">Motor com IA</span>
                  <span className="ml-auto text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#8062a1]/60 text-[#c7a6e8]">Gemini</span>
                </div>
                <p className="text-[10px] text-[#aaa2b3] font-serif leading-relaxed">
                  Mantém o motor narrativo atual, com geração aberta via servidor e API configurada.
                </p>
              </button>
            </div>
          </div>

          {gameMode === "offline" && (
            <div className="rounded-lg border border-[#35533f] bg-[#111a15] p-3 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-[#9fd0ad] font-bold">
                    <Hash className="w-3.5 h-3.5" /> Seed da Crônica
                  </label>
                  <p className="mt-1 text-[10px] text-[#8fa195] font-serif leading-relaxed">
                    Compartilhe esta seed. Com a mesma origem, atributos e seed, o Motor Local reproduz o mesmo prólogo e a mesma lógica de eventos; decisões diferentes criam ramificações diferentes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCampaignSeed(makeSeed())}
                  className="shrink-0 p-2 rounded border border-[#456b52] bg-[#18231d] text-[#9fd0ad] hover:text-[#d7f3df] hover:border-[#6b9b79] transition-colors"
                  title="Gerar outra seed"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={campaignSeed}
                onChange={(e) => setCampaignSeed(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32))}
                placeholder="Ex: CRIMSON-17"
                className="w-full px-3 py-2 rounded bg-[#0d1510] border border-[#35533f] text-sm font-mono tracking-wider text-[#cce8d4] focus:outline-none focus:border-[#6b9b79]"
              />
              {(offlineStats.events || offlineStats.agendas) ? (
                <div className="text-[9px] font-mono uppercase tracking-wide text-[#71877a]">
                  {offlineStats.events || 0} eventos intermediários · {offlineStats.agendas || 0} agendas autônomas de NPC
                </div>
              ) : null}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#a89371] mb-1.5">Nome do Personagem</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ex: Arthur"
                className="w-full px-3 py-2 rounded bg-[#161a25] border border-[#2e3748] text-sm text-[#ebdcc6] focus:outline-none focus:border-[#c9a875]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#a89371] mb-1.5">Gênero</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#161a25] border border-[#2e3748] text-sm text-[#ebdcc6] focus:outline-none focus:border-[#c9a875]"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#a89371] mb-1.5">Origem Canônica</label>
            <select
              value={originType}
              onChange={(e) => setOriginType(e.target.value as OriginOptions)}
              className="w-full px-3 py-2 rounded bg-[#161a25] border border-[#2e3748] text-sm text-[#ebdcc6] focus:outline-none focus:border-[#c9a875]"
            >
              <option value="Pessoa Normal de Loen">Pessoa Normal de Loen</option>
              <option value="Amnésico Humano">Amnésico Humano</option>
              <option value="Transmigrado da Terra">Transmigrado da Terra</option>
            </select>
          </div>

          {originType === "Transmigrado da Terra" && (
            <div className="animate-fadeIn">
              <label className="block text-[11px] font-mono uppercase text-[#a89371] mb-1.5">Ocupação Original na Terra</label>
              <input
                type="text"
                value={earthProfession}
                onChange={(e) => setEarthProfession(e.target.value)}
                placeholder="Ex: Investigador Criminal, Estudante..."
                className="w-full px-3 py-2 rounded bg-[#161a25] border border-[#2e3748] text-sm text-[#ebdcc6] focus:outline-none focus:border-[#c9a875]"
              />
            </div>
          )}

          <div className="pt-4 border-t border-[#292217]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Cinzel'] text-sm font-bold text-[#e0bf88] uppercase">Atributos Mundanos</h3>
              <span className="text-xs font-mono bg-[#211a11] px-2 py-1 rounded border border-[#6b5233] text-[#e0bf88]">
                Pontos Restantes: {pointsLeft}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "vigor", label: "Vigor", icon: <Activity className="w-3.5 h-3.5" />, desc: "Força, saúde e tolerância à dor" },
                { key: "destreza", label: "Destreza", icon: <Shield className="w-3.5 h-3.5" />, desc: "Furtividade, reflexos e fuga" },
                { key: "intelecto", label: "Intelecto", icon: <Brain className="w-3.5 h-3.5" />, desc: "Raciocínio lógico e ocultismo" },
                { key: "percepcao", label: "Percepção", icon: <Eye className="w-3.5 h-3.5" />, desc: "Visão, audição e intuição" },
                { key: "carisma", label: "Carisma", icon: <MessageSquare className="w-3.5 h-3.5" />, desc: "Lábia, persuasão e intimidação" },
              ].map((attr) => (
                <div key={attr.key} className="p-3 rounded-lg bg-[#11151e] border border-[#252c3b] flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-[#ddd0b0] font-['Cinzel'] text-xs font-bold uppercase mb-0.5">
                      {attr.icon} <span>{attr.label}</span>
                    </div>
                    <p className="text-[9px] font-serif text-[#8a7e6b]">{attr.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAttributeChange(attr.key as any, -1)}
                      className="p-1 bg-[#1a2230] rounded text-[#8a7e6b] hover:text-[#f28e83]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-sm font-bold text-[#f5ebd7] w-4 text-center">
                      {(attributes as any)[attr.key]}
                    </span>
                    <button
                      onClick={() => handleAttributeChange(attr.key as any, 1)}
                      disabled={pointsLeft === 0 || (attributes as any)[attr.key] >= 5}
                      className="p-1 bg-[#1a2230] rounded text-[#8a7e6b] hover:text-[#78c772] disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#292217] bg-[#121622] flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={!playerName.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-lg border border-[#8a6d3b] bg-gradient-to-r from-[#382b19] to-[#241c10] text-[#f0e6d6] hover:from-[#4d3c23] hover:to-[#332717] hover:border-[#dfb87f] font-['Cinzel'] tracking-wider text-xs uppercase font-bold transition-all shadow-md disabled:opacity-40"
          >
            {gameMode === "offline" ? "Despertar no Motor Local" : "Despertar em Loen"}
          </button>
        </div>
      </div>
    </div>
  );
};
