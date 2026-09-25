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
  /** Seed compartilhável usada pelo Motor Local para reproduzir a mesma crônica-base. */
  campaignSeed?: string;
  originType?: "Transmigrado da Terra" | "Amnésico Humano" | "Pessoa Normal de Loen";
  attributes?: {
    vigor: number;
    destreza: number;
    intelecto: number;
    percepcao: number;
    carisma: number;
  };
}
