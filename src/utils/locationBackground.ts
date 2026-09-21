export type LocationSceneKey =
  | "docas"
  | "beco"
  | "quarto"
  | "biblioteca"
  | "taverna"
  | "rua"
  | "generico";

/**
 * Deriva um "tipo de cenário" a partir do texto do status do mundo + da cena,
 * para dar um fundo ambientado condizente com onde o investigador está.
 * Nunca inventa local novo — só lê palavras-chave do que o Motor Narrativo já escreveu.
 */
export function getLocationSceneKey(text: string): LocationSceneKey {
  const t = (text || "").toLowerCase();

  if (/doca|cais|porto|navio|embarca/.test(t)) return "docas";
  if (/beco|viela|beco sem saída/.test(t)) return "beco";
  if (/quarto|sótão|aposento|dormitório|cama\b/.test(t)) return "quarto";
  if (/biblioteca|arquivo|estante|livraria/.test(t)) return "biblioteca";
  if (/taverna|bar\b|pub\b|salão de bebidas/.test(t)) return "taverna";
  if (/rua|avenida|praça|calçada|distrito/.test(t)) return "rua";

  return "generico";
}