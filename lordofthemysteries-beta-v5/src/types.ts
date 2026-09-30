export type AudioMood = "calm" | "mystery" | "discovery" | "tension";
export type GameMode = "ai" | "offline";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  parsed?: ParsedTurn;
  audioMood?: AudioMood;
  suggestedActions?: string[];
}

export interface ParsedTurn {
  scene: string;
  dialogue: string;
  worldStatus: string;
  dilemma: string;
  rawRemainder?: string;
}

export interface NPCRecord {
  name: string;
  role?: string;
  attitude?: string;
  secretsKnown?: string;
  conversationMemory?: string[]; 
  notes?: string;
  lastLocationMet?: string;
}

export interface ItemRecord {
  id: string;
  name: string;
  description: string;
  category: "Documento" | "Poção/Fórmula" | "Artefato Oculto" | "Pertence Pessoal" | "Arma" | "Outro";
  quantity: number;
  acquiredAt?: string;
}

export interface LedgerData {
  location: string;
  timeAndWeather: string;
  sanity: number;
  sanityStatus?: "Lúcido" | "Alerta" | "Perturbado" | "Alucinado" | "À Beira da Mutação";
  sanityHistory?: Array<{ reason: string; delta: number; timestamp: number }>;
  items: ItemRecord[];
  npcs: NPCRecord[];
  clues: string[];
  playerLies: string[];
  playerNotes: string[];
  mysteries: string[];
  resolvedMysteries?: string[]; 
  secretsDiscovered?: string[]; 
  chosenPathwaySeq9?: string; 
  discoveredPathways?: string[]; 
  /** Estado serializável do Motor Local. Mantido opcional para compatibilidade com saves antigos/IA. */
  offlineState?: import("./utils/offlineEngine").OfflineGameState;
  /** Simulação persistente do mundo da V4: relógio, clima, facções, NPCs e acontecimentos fora da tela. */
  worldState?: import("./game/worldSimulation").WorldSimulationState;
  /** V4.1: malha de histórias do mesmo mundo. Preparada para receber sinais de outros jogadores no online. */
  sharedStoryState?: import("./game/sharedStoryWorld").SharedStoryWorldState;
  /** V5: diretor dramático offline — ritmo, promessa/payoff, objetivo de curto prazo e leitura de estagnação. */
  dramaticDirectorState?: import("./game/dramaticDirector").DramaticDirectorState;
}

export interface GameOrigin {
  id: string;
  title: string;
  location: string;
  year: string;
  summary: string;
  initialPrompt: string;
  flavor: string;
  playerName?: string;
  gender?: string;
  suggestedPathway?: string;
  /** Seed da crônica individual. Escolhe a história/corpo em Loen, nunca a formação da Terra. */
  campaignSeed?: string;
  /** Seed do mundo compartilhado. No offline, cai para campaignSeed; no online vários personagens poderão compartilhar este valor. */
  worldSeed?: string;
  /** Identidade persistente do personagem para sincronização futura de eventos online. */
  characterId?: string;
  originType?: "Transmigrado da Terra" | "Amnésico Humano" | "Pessoa Normal de Loen";
  /** Formação, profissão ou conhecimentos declarados pelo jogador antes da transmigração. */
  earthBackground?: string;
  attributes?: {
    vigor: number;
    destreza: number;
    intelecto: number;
    percepcao: number;
    carisma: number;
  };
}
