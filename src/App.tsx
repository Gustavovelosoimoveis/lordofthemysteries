import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from "react";
import { Message, LedgerData, GameOrigin } from "./types";
import { parseGMResponse } from "./utils/parser";
import { extractCanonicalOptions } from "./utils/dilemmaOptions";
import { getAmbientMood } from "./utils/ambientMood";
import { Header } from "./components/Header";
import { TurnView } from "./components/TurnView";
import { ActionBar } from "./components/ActionBar";
import { audioEngine } from "./utils/audioEngine";
import { Scroll, AlertCircle, RefreshCw, Sparkles, Compass, Feather, BookOpen, ShieldAlert } from "lucide-react";

// Modais carregados sob demanda (lazy) — não pesam no carregamento inicial da tela de narrativa
const LedgerDrawer = lazy(() => import("./components/LedgerDrawer").then((m) => ({ default: m.LedgerDrawer })));
const OriginSelectorModal = lazy(() => import("./components/OriginSelectorModal").then((m) => ({ default: m.OriginSelectorModal })));
const LoreGuideModal = lazy(() => import("./components/LoreGuideModal").then((m) => ({ default: m.LoreGuideModal })));
const PathwaysModal = lazy(() => import("./components/PathwaysModal").then((m) => ({ default: m.PathwaysModal })));
const InventoryModal = lazy(() => import("./components/InventoryModal").then((m) => ({ default: m.InventoryModal })));
const InvestigatorSheet = lazy(() => import("./components/InvestigatorSheet").then((m) => ({ default: m.InvestigatorSheet })));

const STORAGE_MESSAGES_KEY = "lom_rpg_history_v1";
const STORAGE_LEDGER_KEY = "lom_rpg_ledger_v1";
const STORAGE_ORIGIN_KEY = "lom_rpg_origin_v1";
const STORAGE_MUTE_KEY = "lom_rpg_user_muted_v1";

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MESSAGES_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      // Auto-repair if player was left with a single stuck user prompt
      if (Array.isArray(parsed) && parsed.length === 1 && parsed[0].role === "user") {
        return [];
      }
      return parsed;
    } catch (e) {
      return [];
    }
  });

  const [userMuted, setUserMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_MUTE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [ledger, setLedger] = useState<LedgerData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LEDGER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const currentSanity = typeof parsed.sanity === "number" ? parsed.sanity : 100;
        return {
          sanity: currentSanity,
          sanityStatus: parsed.sanityStatus || (currentSanity >= 75 ? "Lúcido" : currentSanity >= 50 ? "Alerta" : "Perturbado"),
          sanityHistory: parsed.sanityHistory || [],
          items: parsed.items || [],
          ...parsed,
          resolvedMysteries: parsed.resolvedMysteries || [],
          secretsDiscovered: parsed.secretsDiscovered || [],
        };
      }
      return {
        location: "Backlund, Reino de Loen",
        timeAndWeather: "Fim de Tarde, Névoa Densa",
        sanity: 100,
        sanityStatus: "Lúcido",
        sanityHistory: [],
        items: [],
        npcs: [],
        clues: [],
        playerLies: [],
        playerNotes: [],
        mysteries: [],
        resolvedMysteries: [],
        secretsDiscovered: [],
      };
    } catch (e) {
      return {
        location: "Backlund, Reino de Loen",
        timeAndWeather: "Fim de Tarde, Névoa Densa",
        sanity: 100,
        sanityStatus: "Lúcido",
        sanityHistory: [],
        items: [],
        npcs: [],
        clues: [],
        playerLies: [],
        playerNotes: [],
        mysteries: [],
        resolvedMysteries: [],
        secretsDiscovered: [],
      };
    }
  });

  const [origin, setOrigin] = useState<GameOrigin | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORIGIN_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showOriginModal, setShowOriginModal] = useState(messages.length === 0);
  const [showLedger, setShowLedger] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showInvestigatorSheet, setShowInvestigatorSheet] = useState(false);
  const [draftActionText, setDraftActionText] = useState<string>("");
  const [ledgerInitialTab, setLedgerInitialTab] = useState<"progress" | "sanity" | "npcs" | "clues" | "lies" | "notes">("progress");
  const [showLore, setShowLore] = useState(false);
  const [showPathways, setShowPathways] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Immersive visual feedback alerts
  const [sanityShockAlert, setSanityShockAlert] = useState(false);
  const [pathwayRevelationAlert, setPathwayRevelationAlert] = useState<string | null>(null);

  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("Storage save failed:", e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LEDGER_KEY, JSON.stringify(ledger));
    } catch (e) {
      console.warn("Ledger save failed:", e);
    }
  }, [ledger]);

  useEffect(() => {
    if (origin) {
      try {
        localStorage.setItem(STORAGE_ORIGIN_KEY, JSON.stringify(origin));
      } catch (e) {
        // ignore
      }
    }
  }, [origin]);

  // Sync mute state and handle audio engine start/stop
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MUTE_KEY, String(userMuted));
    } catch (e) {
      // ignore
    }
    if (userMuted) {
      audioEngine.stop();
    }
  }, [userMuted]);

  const handleToggleUserMute = async () => {
    if (userMuted) {
      setUserMuted(false);
      try {
        await audioEngine.start();
      } catch (e) {
        // audio policy
      }
    } else {
      setUserMuted(true);
      audioEngine.stop();
    }
  };

  const handleUpdatePlayerName = (newName: string) => {
    if (!newName.trim()) return;
    setOrigin((prev) => {
      const trimmed = newName.trim();
      if (!prev) {
        const def: GameOrigin = {
          id: "origin-default",
          title: `${trimmed} (Pessoa Normal de Loen)`,
          location: "Backlund, Distrito de Cherwood",
          year: "1340 do Calendário das Cinco Eras",
          summary: "Um cidadão mundano pego no nevoeiro de Loen.",
          initialPrompt: "Você desperta em um aposento modesto de Backlund sob a névoa de Loen.",
          flavor: "A ignorância protege a mente dos terrores do cosmos.",
          playerName: trimmed,
          gender: "Masculino",
          originType: "Pessoa Normal de Loen",
          attributes: {
            vigor: 2,
            destreza: 2,
            intelecto: 2,
            percepcao: 2,
            carisma: 2,
          },
        };
        try {
          localStorage.setItem(STORAGE_ORIGIN_KEY, JSON.stringify(def));
        } catch (e) {}
        return def;
      }

      const updated: GameOrigin = {
        ...prev,
        playerName: trimmed,
        title: `${trimmed} (${prev.originType || "Investigador"})`,
      };
      try {
        localStorage.setItem(STORAGE_ORIGIN_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Reabre o modal pedindo apenas o nome caso o playerName esteja ausente em jogo ativo
  useEffect(() => {
    if (messages.length > 0 && (!origin?.playerName || !origin.playerName.trim())) {
      setShowOriginModal(true);
    }
  }, [messages.length, origin?.playerName]);

  // Scroll to bottom on new messages or during streaming
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Get current world status from the latest assistant message
  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages]
  );
  const currentStatusString = latestAssistantMessage?.parsed?.worldStatus || ledger.timeAndWeather || "";
  const ambientMood = getAmbientMood(currentStatusString);

  // Dynamic dilemma suggestions strictly parsed from current GM dilemma (never fallbacks, never hallucinated)
  const activeSuggestions = useMemo(() => {
    if (!latestAssistantMessage?.parsed?.dilemma || isStreaming) return [];
    return extractCanonicalOptions(latestAssistantMessage.parsed.dilemma);
  }, [latestAssistantMessage, isStreaming]);

  // Helper to serialize ledger for GM prompt context (ensures absolute memory of NPCs)
  const serializeLedgerContext = (l: LedgerData) => {
    const npcsDescription = (l.npcs || [])
      .map(
        (n) =>
          `[NPC: ${n.name}] Cargo/Postura: ${n.role || "indivíduo"} | Atitude: ${n.attitude || "neutra"} | Memória do diálogo com o jogador: ${(n.conversationMemory || []).join(", ") || "nenhuma"} | Notas/Segredos: ${n.notes || n.secretsKnown || "nenhum"}`
      )
      .join("\n");

    const itemsDescription = (l.items || [])
      .map((it) => `${it.name} (x${it.quantity}) [${it.category}]: ${it.description}`)
      .join("; ");

    return `Local Atual: ${l.location}
Horário e Clima: ${l.timeAndWeather}
INVENTÁRIO / PERTENCES EM POSSE DO JOGADOR:
${itemsDescription || "Nenhum item ou posse relevante"}
REGISTRO INQUEBRÁVEL DE NPCS (MEMÓRIA ABSOLUTA - ELES NÃO ESQUECEM NADA):
${npcsDescription || "Nenhum NPC conhecido ainda"}
Pistas Catalogadas: ${(l.clues || []).join("; ") || "Nenhuma"}
Mentiras ou Promessas Feitas pelo Jogador (NUNCA ESQUECER): ${(l.playerLies || []).join("; ") || "Nenhuma"}
Mistérios e Conflitos Ativos: ${(l.mysteries || []).join("; ") || "Nenhum"}`;
  };

  // Start with chosen origin - Driven by Game Master
  const handleSelectOrigin = async (selected: GameOrigin) => {
    setOrigin(selected);
    setShowOriginModal(false);
    setErrorMessage(null);
    setIsLoading(true);
    setIsStreaming(true);

    // Subtle automatic audio start if user engaged and not muted
    if (!userMuted) {
      try {
        if (!audioEngine.isPlaying()) {
          await audioEngine.start();
        }
        audioEngine.setMood("calm");
      } catch (e) {
        console.warn("Audio autoplay blocked by browser policy:", e);
      }
    }

    const initialLedger: LedgerData = {
      location: selected.location,
      timeAndWeather: "Fim de Tarde, Névoa Densa de Loen",
      sanity: 100,
      sanityStatus: "Lúcido",
      sanityHistory: [],
      items: [],
      npcs: [],
      clues: [],
      playerLies: [],
      playerNotes: [],
      mysteries: [selected.summary],
      resolvedMysteries: [],
      secretsDiscovered: [],
      discoveredPathways: selected.suggestedPathway ? [selected.suggestedPathway.toLowerCase()] : [],
    };
    setLedger(initialLedger);

    const assistantMsgId = "turn-" + Date.now();
    // Initial placeholder for Game Master's opening narration
    setMessages([
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        parsed: { scene: "", dialogue: "", worldStatus: "", dilemma: "" },
      },
    ]);

    try {
      const res = await fetch("/api/prologue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: selected,
          customPrompt: selected.initialPrompt,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Falha ao iniciar o prólogo com o Motor Narrativo.");
      }

      const data = await res.json();
      const text = data.text || "";
      const parsed = parseGMResponse(text);
      const mood = audioEngine.detectMoodFromText(text);
      audioEngine.setMood(mood);

      const canonicalOptions = extractCanonicalOptions(parsed.dilemma);

      setMessages([
        {
          id: assistantMsgId,
          role: "assistant",
          content: text,
          timestamp: Date.now(),
          parsed,
          suggestedActions: canonicalOptions,
          audioMood: mood,
        },
      ]);

      extractLedgerUpdates("Despertar inicial no distrito", text, initialLedger);
    } catch (err: any) {
      console.error("Prologue generation failed:", err);
      setErrorMessage(err.message || "Erro ao consultar o Motor Narrativo. Tente novamente.");
      setMessages([]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Main turn action handler
  const handleUserAction = async (actionText: string) => {
    if (isLoading || isStreaming) return;
    setErrorMessage(null);

    // Verificação estrita de nome do investigador: se ausente, reabre o modal pedindo apenas o nome
    if (!origin?.playerName || !origin.playerName.trim()) {
      setShowOriginModal(true);
      setErrorMessage("Por favor, registre o nome do seu investigador antes de prosseguir com a investigação.");
      return;
    }

    // Audio resume check if player has not muted
    if (!userMuted && !audioEngine.isPlaying()) {
      try {
        await audioEngine.start();
      } catch (e) {
        // browser audio policy
      }
    }

    const userMsg: Message = {
      id: "turn-" + Date.now(),
      role: "user",
      content: actionText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    await fetchNarrativeStream(updatedMessages, origin, ledger);
  };

  // Streaming fetch narrative with dynamic audio mood analysis
  const fetchNarrativeStream = async (
    allMessages: Message[],
    currentOrigin: GameOrigin | null,
    currentLedger: LedgerData
  ) => {
    setIsLoading(true);
    setIsStreaming(true);

    const assistantMsgId = "turn-" + (Date.now() + 1);
    let accumulatedText = "";

    // Add placeholder assistant message
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        parsed: { scene: "", dialogue: "", worldStatus: "", dilemma: "" },
      },
    ]);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          origin: currentOrigin?.summary || "",
          ledgerContext: serializeLedgerContext(currentLedger),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Erro na conexão com o servidor (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.substring(6);
            if (dataStr === "[DONE]") break;

            try {
              const parsedData = JSON.parse(dataStr);
              if (parsedData.text) {
                accumulatedText += parsedData.text;
                const parsedTurn = parseGMResponse(accumulatedText);

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          content: accumulatedText,
                          parsed: parsedTurn,
                        }
                      : msg
                  )
                );
              } else if (parsedData.error) {
                throw new Error(parsedData.error);
              }
            } catch (e) {
              // Non-fatal chunk error
            }
          }
        }
      }

      // Final parsed turn
      const finalParsed = parseGMResponse(accumulatedText);

      // Dynamically detect atmosphere mood (calm vs tension) and shift audio synthesis
      const detectedMood = audioEngine.detectMoodFromText(accumulatedText);
      audioEngine.setMood(detectedMood);

      // Extract canonical dilemma options directly from the dilemma (never generic fallbacks)
      const canonicalOptions = extractCanonicalOptions(finalParsed.dilemma);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: accumulatedText,
                parsed: finalParsed,
                suggestedActions: canonicalOptions,
                audioMood: detectedMood,
              }
            : msg
        )
      );

      // Trigger background ledger & NPC memory updates
      extractLedgerUpdates(
        allMessages[allMessages.length - 1]?.content || "",
        accumulatedText,
        currentLedger
      );
    } catch (err: any) {
      console.warn("Stream failed or unavailable, falling back to /api/chat:", err);

      try {
        const fallbackRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
            origin: currentOrigin?.summary || "",
            ledgerContext: serializeLedgerContext(currentLedger),
          }),
        });

        if (!fallbackRes.ok) {
          const errData = await fallbackRes.json().catch(() => ({}));
          throw new Error(errData.error || "Falha ao obter narrativa do Motor.");
        }

        const data = await fallbackRes.json();
        accumulatedText = data.text || "";
        const finalParsed = parseGMResponse(accumulatedText);

        const detectedMood = audioEngine.detectMoodFromText(accumulatedText);
        audioEngine.setMood(detectedMood);

        const canonicalFallbackOptions = extractCanonicalOptions(finalParsed.dilemma);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: accumulatedText,
                  parsed: finalParsed,
                  suggestedActions: canonicalFallbackOptions,
                  audioMood: detectedMood,
                }
              : msg
          )
        );

        extractLedgerUpdates(
          allMessages[allMessages.length - 1]?.content || "",
          accumulatedText,
          currentLedger
        );
      } catch (fallbackErr: any) {
        console.error("All narrative fetch attempts failed:", fallbackErr);
        setErrorMessage(fallbackErr.message || "Erro de conexão com o Motor Narrativo.");
        if (!accumulatedText) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
        }
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Background helper to extract memory and update ledger
  const extractLedgerUpdates = async (
    lastUserAction: string,
    lastGMResponse: string,
    curLedger: LedgerData
  ) => {
    try {
      const res = await fetch("/api/ledger/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastUserAction,
          lastGMResponse,
          currentLedger: curLedger,
        }),
      });

      if (!res.ok) return;
      const data = await res.json();

      if (data.detectedMood && (data.detectedMood === "calm" || data.detectedMood === "tension")) {
        audioEngine.setMood(data.detectedMood);
      }

      setLedger((prev) => {
        const updatedNpcs = [...(prev.npcs || [])];
        if (data.newOrUpdatedNPCs && Array.isArray(data.newOrUpdatedNPCs)) {
          for (const newNpc of data.newOrUpdatedNPCs) {
            if (!newNpc.name) continue;
            const existingIdx = updatedNpcs.findIndex(
              (n) => n.name.toLowerCase() === newNpc.name.toLowerCase()
            );
            if (existingIdx !== -1) {
              const prevMem = updatedNpcs[existingIdx].conversationMemory || [];
              const incomingMem = newNpc.conversationMemory || [];
              const combinedMem = Array.from(new Set([...prevMem, ...incomingMem]));

              updatedNpcs[existingIdx] = {
                ...updatedNpcs[existingIdx],
                ...newNpc,
                conversationMemory: combinedMem,
              };
            } else {
              updatedNpcs.push(newNpc);
            }
          }
        }

        const updatedClues = Array.from(
          new Set([...(prev.clues || []), ...(data.newClues || [])])
        );
        const updatedLies = Array.from(
          new Set([...(prev.playerLies || []), ...(data.playerLiesOrPromises || [])])
        );
        const updatedMysteries = Array.from(
          new Set([...(prev.mysteries || []), ...(data.unresolvedMysteries || [])])
        );
        const updatedResolved = Array.from(
          new Set([...(prev.resolvedMysteries || []), ...(data.resolvedMysteries || [])])
        );
        const updatedSecrets = Array.from(
          new Set([...(prev.secretsDiscovered || []), ...(data.newSecretsDiscovered || [])])
        );

        // Process items updated, gained or lost narrative-driven by the Engine
        let updatedItems = [...(prev.items || [])];
        if (data.newOrUpdatedItems && Array.isArray(data.newOrUpdatedItems)) {
          for (const itemDelta of data.newOrUpdatedItems) {
            if (!itemDelta || !itemDelta.name) continue;
            const existingIdx = updatedItems.findIndex(
              (it) => it.name.toLowerCase().trim() === itemDelta.name.toLowerCase().trim()
            );
            const delta = typeof itemDelta.quantityDelta === "number" ? itemDelta.quantityDelta : 1;

            if (existingIdx !== -1) {
              const currentQty = updatedItems[existingIdx].quantity;
              const newQty = currentQty + delta;
              if (newQty <= 0) {
                updatedItems.splice(existingIdx, 1);
              } else {
                updatedItems[existingIdx] = {
                  ...updatedItems[existingIdx],
                  quantity: newQty,
                  description: itemDelta.description || updatedItems[existingIdx].description,
                  category: itemDelta.category || updatedItems[existingIdx].category,
                };
              }
            } else if (delta > 0) {
              const validCategories = [
                "Documento",
                "Poção/Fórmula",
                "Artefato Oculto",
                "Pertence Pessoal",
                "Arma",
                "Outro",
              ] as const;
              const cat = validCategories.includes(itemDelta.category)
                ? itemDelta.category
                : "Outro";
              updatedItems.push({
                id: "item-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
                name: itemDelta.name.trim(),
                description: itemDelta.description || "Objeto em posse do investigador.",
                category: cat,
                quantity: delta,
                acquiredAt: new Date().toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              });
            }
          }
        }

        // If any mystery was resolved, remove it from active mysteries
        const filteredActiveMysteries = updatedMysteries.filter(
          (m) => !updatedResolved.includes(m)
        );

        // Sanity calculations
        let currentSanity = typeof prev.sanity === "number" ? prev.sanity : 100;
        let newHistory = prev.sanityHistory ? [...prev.sanityHistory] : [];
        if (typeof data.sanityDelta === "number" && data.sanityDelta !== 0) {
          const delta = Math.max(-25, Math.min(10, data.sanityDelta));
          const updatedSanity = Math.max(0, Math.min(100, currentSanity + delta));
          if (delta < 0) {
            audioEngine.playSanityDropCue();
            setSanityShockAlert(true);
            setTimeout(() => setSanityShockAlert(false), 1800);
          }
          currentSanity = updatedSanity;
          newHistory.push({
            timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            delta,
            reason: data.sanityReason || (delta < 0 ? "Choque psíquico ao encarar o arcano" : "Compostura mental preservada"),
          });
        }

        const calculatedStatus =
          currentSanity >= 75
            ? "Lúcido"
            : currentSanity >= 50
            ? "Alerta"
            : currentSanity >= 25
            ? "Perturbado"
            : "Mutação Iminente";

        // Extract and accumulate newly discovered pathways from narrative
        let updatedDiscovered = [...(prev.discoveredPathways || [])];
        let newlyDiscoveredPathway: string | null = null;
        if (Array.isArray(data.discoveredPathwayIds) && data.discoveredPathwayIds.length > 0) {
          for (const pid of data.discoveredPathwayIds) {
            if (typeof pid === "string" && pid.trim()) {
              const cleaned = pid.trim().toLowerCase();
              if (!updatedDiscovered.includes(cleaned)) {
                updatedDiscovered.push(cleaned);
                newlyDiscoveredPathway = cleaned.toUpperCase();
              }
            }
          }
        }

        // Trigger revelation reward celebration (audio cue + visual arcane glow)
        if (newlyDiscoveredPathway) {
          audioEngine.playPathwayDiscoveryCue();
          setPathwayRevelationAlert(newlyDiscoveredPathway);
          setTimeout(() => setPathwayRevelationAlert(null), 4500);
        }

        // Apply audio mood if specified by narrative analysis
        if (data.audioMood && ["calm", "tension", "mystery", "discovery"].includes(data.audioMood)) {
          audioEngine.setMood(data.audioMood);
        }

        return {
          ...prev,
          location: data.location || prev.location,
          timeAndWeather: data.timeAndWeather || prev.timeAndWeather,
          items: updatedItems,
          npcs: updatedNpcs,
          clues: updatedClues,
          playerLies: updatedLies,
          mysteries: filteredActiveMysteries,
          resolvedMysteries: updatedResolved,
          secretsDiscovered: updatedSecrets,
          discoveredPathways: updatedDiscovered,
          sanity: currentSanity,
          sanityStatus: calculatedStatus,
          sanityHistory: newHistory,
        };
      });
    } catch (e) {
      // Non-blocking
    }
  };

  // Reset / Start fresh unpredictable game
  const handleNewGame = () => {
    if (
      messages.length > 0 &&
      !window.confirm("Deseja iniciar uma nova crônica? Cada novo jogo começa em um local e trama imprevisíveis.")
    ) {
      return;
    }
    setMessages([]);
    setOrigin(null);
    audioEngine.setMood("calm");
    localStorage.removeItem(STORAGE_MESSAGES_KEY);
    localStorage.removeItem(STORAGE_LEDGER_KEY);
    localStorage.removeItem(STORAGE_ORIGIN_KEY);
    setShowOriginModal(true);
  };

  // Export chronicle as Markdown
  const handleExportMarkdown = () => {
    let md = `# LORD OF THE MYSTERIES - CRÔNICA EM 1ª PESSOA\n`;
    md += `*Período: ${origin?.year || "c. 1342"} | Local de Início: ${origin?.location || "Backlund"}*\n\n`;
    md += `---\n\n`;

    for (const msg of messages) {
      if (msg.role === "user") {
        md += `### > Decisão do Jogador\n*${msg.content}*\n\n`;
      } else {
        const p = msg.parsed || parseGMResponse(msg.content);
        if (p.worldStatus) md += `**Status do Mundo:** \`${p.worldStatus}\`\n\n`;
        if (p.scene) md += `**[CENA]**\n${p.scene}\n\n`;
        if (p.dialogue) md += `**[DIÁLOGO]**\n${p.dialogue}\n\n`;
        if (p.dilemma) md += `> **Dilema:** ${p.dilemma}\n\n`;
        md += `---\n\n`;
      }
    }

    const totalMysteriesCount = (ledger.mysteries?.length || 0) + (ledger.resolvedMysteries?.length || 0);
    const resolvedMysteriesCount = ledger.resolvedMysteries?.length || 0;
    const resolvedPct = totalMysteriesCount > 0 ? Math.round((resolvedMysteriesCount / totalMysteriesCount) * 100) : 0;
    const totalSecretsCount = (ledger.secretsDiscovered?.length || 0) + (ledger.npcs?.filter(n => n.secretsKnown).length || 0);

    md += `\n## DIÁRIO DE INVESTIGAÇÃO & PROGRESSO\n`;
    md += `- **Local Atual:** ${ledger.location || "Backlund"}\n`;
    md += `- **Resolução do Caso:** ${resolvedPct}% (${resolvedMysteriesCount} resolvidos de ${totalMysteriesCount} mistérios)\n`;
    md += `- **Segredos Arcanos Revelados:** ${totalSecretsCount}\n`;
    md += `- **Pistas Catalogadas:** ${ledger.clues?.length || 0}\n`;
    if (ledger.resolvedMysteries && ledger.resolvedMysteries.length > 0) {
      md += `\n### Mistérios Solucionados:\n`;
      ledger.resolvedMysteries.forEach((m) => {
        md += `- [x] ${m}\n`;
      });
    }
    if (ledger.mysteries && ledger.mysteries.length > 0) {
      md += `\n### Mistérios Pendentes:\n`;
      ledger.mysteries.forEach((m) => {
        md += `- [ ] ${m}\n`;
      });
    }
    if (ledger.secretsDiscovered && ledger.secretsDiscovered.length > 0) {
      md += `\n### Segredos Ocultos Descobertos:\n`;
      ledger.secretsDiscovered.forEach((s) => {
        md += `- ♦ ${s}\n`;
      });
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cronica-lom-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalLedgerItems =
    (ledger.npcs?.length || 0) + (ledger.clues?.length || 0) + (ledger.playerLies?.length || 0);

  const sanityVal = typeof ledger.sanity === "number" ? ledger.sanity : 100;
  const sanityOverlayClass =
    sanityVal < 25
      ? "sanity-overlay-critical"
      : sanityVal < 50
      ? "sanity-overlay-perturbed"
      : "";

  return (
    <Suspense fallback={null}>
    <div className="min-h-screen bg-[#0a0d11] text-[#ddd0b0] flex flex-col font-serif relative selection:bg-[#8a6d3b]/40 selection:text-[#f7f2ea]">
      {/* Dynamic Sanity Distortion & Aberration Overlay */}
      {sanityOverlayClass && (
        <div
          className={`fixed inset-0 pointer-events-none z-20 ${sanityOverlayClass}`}
          aria-hidden="true"
        />
      )}

      {/* Cinematic Chiaroscuro Ambiance (Bloodborne/Sekiro key art feel) */}
      {/* Dynamic ambient vignette — reflete a hora/clima reais da cena, nunca "hora azul" fixa */}
      <div className={`fixed inset-0 pointer-events-none transition-colors duration-[2000ms] ambient-${ambientMood}`} />
      {/* Gaslamp warm amber breathing glow on the right */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_rgba(138,109,59,0.14)_0%,_transparent_70%)] animate-gaslamp" />
      {/* Crimson moon subtle rim light leaking on the bottom left */}
      <div className="fixed -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#8b1c1c]/10 blur-3xl pointer-events-none" />
      {/* Atmospheric mist floats */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#8a6d3b]/5 blur-3xl pointer-events-none animate-mist" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#1b2a40]/15 blur-3xl pointer-events-none animate-mist" />
      {/* Grão de filme sutil — textura cinematográfica leve, sempre presente */}
      <div className="fixed inset-0 pointer-events-none z-[5] film-grain-overlay" />

      {/* Header */}
      <Header
        onOpenLedger={() => {
          setLedgerInitialTab("progress");
          setShowLedger(true);
        }}
        onOpenLore={() => setShowLore(true)}
        onOpenPathways={() => setShowPathways(true)}
        onOpenInventory={() => setShowInventory(true)}
        onOpenInvestigatorSheet={() => setShowInvestigatorSheet((prev) => !prev)}
        onNewGame={handleNewGame}
        onOpenSanity={() => {
          setLedgerInitialTab("sanity");
          setShowLedger(true);
        }}
        ledgerCount={totalLedgerItems}
        inventoryCount={ledger.items?.length || 0}
        discoveredPathwaysCount={ledger.discoveredPathways?.length || 0}
        currentWorldStatus={currentStatusString}
        sanity={sanityVal}
        playerName={origin?.playerName}
        userMuted={userMuted}
        onToggleUserMute={handleToggleUserMute}
      />

      {/* Main Narrative Scroll Area ("A TELA CLEAN") */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-between relative overflow-hidden">
        {/* Efeito visual sutil de nevoeiro vitoriano com máscara de opacidade animada */}
        <div className="victorian-fog-container" aria-hidden="true">
          <div className="victorian-fog-billow-1" />
          <div className="victorian-fog-billow-2" />
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-[#271412] border border-[#5e2722] text-[#e89b94] flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (messages.length > 0) {
                  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                  if (lastUserMsg) {
                    fetchNarrativeStream(messages, origin, ledger);
                  }
                }
              }}
              className="px-2.5 py-1 rounded bg-[#3d1a17] hover:bg-[#52221e] text-[#f7c5c1] text-xs font-serif flex items-center gap-1 border border-[#7a322b]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        )}

        {/* Empty state: Waiting for origin selection */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-10 space-y-6 my-auto max-w-2xl mx-auto animate-fadeIn">
            {/* Victorian Seal Crest */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-[#a3804d] bg-gradient-to-br from-[#1f2637] via-[#141924] to-[#0c1017] flex items-center justify-center text-[#dfb87f] shadow-[0_0_35px_rgba(223,184,127,0.2)]">
                <Compass className="w-10 h-10 text-[#dfb87f] animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#351e15] border border-[#854332] flex items-center justify-center text-[#e89083]">
                <Feather className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171c26] border border-[#3b3425] text-xs font-mono text-[#c9a875] tracking-widest uppercase">
                <Sparkles className="w-3 h-3 text-[#dfb87f]" />
                <span>Lord of the Mysteries • Crônica Narrativa</span>
              </div>

              <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-[#f5ebd9] tracking-wider uppercase drop-shadow-md">
                O Despertar Sob a Névoa de Loen
              </h2>

              <p className="text-sm sm:text-base text-[#b0a290] font-serif leading-relaxed max-w-xl mx-auto">
                O motor do jogo assume o papel do <strong>Game Master</strong> canônico. Você inicia diretamente na cena como um humano mundano em um distrito imprevisível de Loen ou Trier, antes do despertar de Klein Moretti (1198–1349).
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex justify-center pt-2 w-full max-w-md">
              <button
                id="btn-start-character-creation"
                type="button"
                onClick={() => setShowOriginModal(true)}
                className="w-full py-3.5 px-6 rounded-lg border-2 border-[#b58f55] bg-gradient-to-r from-[#40301c] via-[#2c2214] to-[#1e170e] text-[#fbf6ed] hover:from-[#574226] hover:to-[#2c2012] hover:border-[#dfb87f] font-['Cinzel'] tracking-wider text-xs sm:text-sm uppercase font-bold transition-all shadow-[0_8px_25px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#dfb87f]" />
                <span>Criar Ficha & Despertar</span>
              </button>
            </div>

            <div className="pt-2 flex items-center gap-4 text-[11px] font-mono text-[#786e5e]">
              <span>22 Sequências 9 Canônicas</span>
              <span>•</span>
              <span>Memória Absoluta de NPCs</span>
              <span>•</span>
              <span>Início Imprevisível</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <TurnView
                key={message.id || index}
                message={message}
                isLatest={index === messages.length - 1}
                isStreaming={isStreaming}
                onSelectAction={handleUserAction}
                onDraftAction={(actionText) => setDraftActionText(actionText)}
                pageNumber={index + 1}
                sanity={sanityVal}
                ledger={ledger}
              />
            ))}
            <div ref={turnsEndRef} />
          </div>
        )}
      </main>

      {/* Action Input Bar with Dynamic Dilemma Chips */}
      {messages.length > 0 && (
        <ActionBar
          onSend={handleUserAction}
          isLoading={isLoading || isStreaming}
          draftText={draftActionText}
          onClearDraftText={() => setDraftActionText("")}
          activeSuggestions={activeSuggestions}
        />
      )}

      {/* Visual Feedback Overlay: Sanity Shock (Item 2 e) */}
      {sanityShockAlert && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(180,20,20,0.5)_100%)] backdrop-blur-[0.5px] animate-pulse"
        />
      )}

      {/* Visual Feedback Overlay: Pathway Discovery Reward (Item 2 b) */}
      {pathwayRevelationAlert && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 transition-all duration-700 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(223,184,127,0.35)_100%)]"
        >
          <div className="px-5 py-3 rounded-full bg-[#18120a]/95 border-2 border-[#dfb87f] shadow-[0_0_40px_rgba(223,184,127,0.6)] flex items-center gap-3 animate-fadeIn text-[#dfb87f]">
            <Sparkles className="w-5 h-5 text-[#dfb87f] animate-spin" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#c9a875]">
                ✦ Revelação Sobrenatural Descoberta ✦
              </span>
              <span className="font-['Cinzel'] text-sm sm:text-base font-bold text-[#fff2d6]">
                Caminho Arcano: {pathwayRevelationAlert}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Drawer (Memória Absoluta) */}
      <LedgerDrawer
        isOpen={showLedger}
        onClose={() => setShowLedger(false)}
        ledger={ledger}
        onUpdateLedger={(updated) => setLedger(updated)}
        onExportMarkdown={handleExportMarkdown}
        initialTab={ledgerInitialTab}
      />

      {/* Origin Selection Modal */}
      <OriginSelectorModal
        isOpen={showOriginModal}
        onClose={() => setShowOriginModal(false)}
        onSelectOrigin={handleSelectOrigin}
        isInitial={messages.length === 0}
        isNameOnly={messages.length > 0 && (!origin?.playerName || !origin.playerName.trim())}
        currentOrigin={origin}
        onUpdatePlayerName={handleUpdatePlayerName}
      />

      {/* Lore Guide Modal */}
      <LoreGuideModal
        isOpen={showLore}
        onClose={() => setShowLore(false)}
      />

      {/* 22 Pathways Compendium Modal */}
      <PathwaysModal
        isOpen={showPathways}
        onClose={() => setShowPathways(false)}
        discoveredPathwayIds={ledger.discoveredPathways || []}
        originPathwayId={origin?.suggestedPathway}
      />

      {/* Gabinete de Pertences & Inventário */}
      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        items={ledger.items || []}
      />

      {/* Ficha de Investigador Modal */}
      <InvestigatorSheet
        isOpen={showInvestigatorSheet}
        onClose={() => setShowInvestigatorSheet(false)}
        origin={origin}
        sanity={sanityVal}
        onUpdatePlayerName={handleUpdatePlayerName}
      />
    </div>
    </Suspense>
  );
}
