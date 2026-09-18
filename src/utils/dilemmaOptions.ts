/**
 * Extrai as opções canônicas (1., 2., 3'...) escritas pelo próprio Motor Narrativo
 * dentro do texto do dilema. Nunca gera texto novo — só lê o que já está lá.
 * Formato esperado: "1. [Atributo] Texto da ação. 2. [Atributo] Texto da ação. ..."
 */
export function extractCanonicalOptions(dilemmaText: string): string[] {
  if (!dilemmaText) return [];

  const regex = /\d+\.\s*\[[^\]]+\]\s*([^]*?)(?=\s*\d+\.\s*\[|$)/g;
  const matches = [...dilemmaText.matchAll(regex)];

  const options = matches
    .map((m) => m[1].trim())
    .filter((text) => text.length > 0 && text.length < 400);

  return options.slice(0, 4);
}
