export type LocationSceneKey =
  | "docas"
  | "beco"
  | "quarto"
  | "biblioteca"
  | "taverna"
  | "rua"
  | "escritorio"
  | "praca"
  | "comercio"
  | "santuario"
  | "generico";

/**
 * Deriva um "tipo de cenário" a partir do texto do status do mundo + da cena,
 * para dar um fundo ambientado condizente com onde o investigador está.
 * Nunca inventa local novo — só lê palavras-chave do que o Motor Narrativo já escreveu.
 */
export function getLocationSceneKey(text: string): LocationSceneKey {
  const t = (text || "").toLowerCase();

  if (/altar|ritual|círculo arcano|santuário|símbolo proibido/.test(t)) return "santuario";
  if (/doca|cais|porto|navio|embarca/.test(t)) return "docas";
  if (/beco|viela|beco sem saída/.test(t)) return "beco";
  if (/quarto|sótão|aposento|dormitório|cama\b/.test(t)) return "quarto";
  if (/biblioteca|arquivo|estante|livraria/.test(t)) return "biblioteca";
  if (/taverna|bar\b|pub\b|salão de bebidas/.test(t)) return "taverna";
  if (/escritório|gabinete|sala de investigação|mesa de trabalho/.test(t)) return "escritorio";
  if (/loja|vitrine|comércio|mercearia/.test(t)) return "comercio";
  if (/catedral|praça|igreja|escadaria/.test(t)) return "praca";
  if (/rua|avenida|calçada|distrito/.test(t)) return "rua";

  return "generico";
}