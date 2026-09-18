import { ParsedTurn } from "../types";

export function parseGMResponse(text: string): ParsedTurn {
  const clean = text.trim();

  // Look for markers
  const cenaIdx = clean.indexOf("[CENA]");
  const dialogoIdx = clean.indexOf("[DIÁLOGO]");
  const statusIdx = clean.indexOf("[STATUS DO MUNDO]");

  // If no markers found at all, return raw text as scene
  if (cenaIdx === -1 && dialogoIdx === -1 && statusIdx === -1) {
    return {
      scene: clean,
      dialogue: "",
      worldStatus: "",
      dilemma: "",
    };
  }

  let scene = "";
  let dialogue = "";
  let worldStatus = "";
  let dilemma = "";

  // Extract CENA
  if (cenaIdx !== -1) {
    const start = cenaIdx + 6;
    const nextIdx = dialogoIdx !== -1 ? dialogoIdx : statusIdx !== -1 ? statusIdx : clean.length;
    scene = clean.substring(start, nextIdx).trim();
  }

  // Extract DIÁLOGO
  if (dialogoIdx !== -1) {
    const start = dialogoIdx + 9;
    const nextIdx = statusIdx !== -1 ? statusIdx : clean.length;
    dialogue = clean.substring(start, nextIdx).trim();
  }

  // Extract STATUS DO MUNDO and any trailing DILEMMA
  if (statusIdx !== -1) {
    const start = statusIdx + 17;
    const statusAndRest = clean.substring(start).trim();

    // Check if there are separate paragraphs after the status line
    const lines = statusAndRest.split(/\n\s*\n/);
    if (lines.length > 1) {
      worldStatus = lines[0].trim();
      dilemma = lines.slice(1).join("\n\n").trim();
    } else {
      // Maybe separated by single newline or parentheses
      const parenMatch = statusAndRest.match(/^([^\n]+)(?:\n+([\s\S]+))?$/);
      if (parenMatch) {
        worldStatus = (parenMatch[1] || "").trim();
        dilemma = (parenMatch[2] || "").trim();
      } else {
        worldStatus = statusAndRest;
      }
    }
  }

  // Clean up any stray square brackets or leading asterisks if needed
  return {
    scene,
    dialogue,
    worldStatus,
    dilemma,
  };
}

/**
 * Extracts suggested player actions directly from the GM text or dilemma,
 * ensuring 100% coherence between what is written in the dilemma and what is clickable.
 * If no numbered options are listed, returns an empty array (NEVER returns generic fallbacks).
 */
export function extractSuggestedActionsFromText(text: string, dilemmaFallback?: string): string[] {
  const source = (dilemmaFallback && dilemmaFallback.trim().length > 0) ? dilemmaFallback : text;
  if (!source || !source.trim()) return [];

  const matches: string[] = [];

  // Match numbered options: \d+\.\s*(\[[\w\s]+\])?\s*[\s\S]+?(?=\d+\.|$|\n\n)
  const optionRegex = /(?:^|\s|\n)(?:(\d+)[\.\)])\s*(\[[^\]]+\])?\s*([\s\S]+?)(?=(?:\s*\d+[\.\)])|\n\n(?![^\n]*\d+[\.\)])|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = optionRegex.exec(source)) !== null) {
    const attributeTag = match[2] ? match[2].trim() : "";
    const actionBody = match[3]
      ? match[3]
          .replace(/^\*+|\*+$/g, "")
          .replace(/^"|"$/g, "")
          .replace(/\s+/g, " ")
          .trim()
      : "";

    const fullOption = attributeTag ? `${attributeTag} ${actionBody}` : actionBody;
    const cleanOption = fullOption.replace(/\.$/, "").trim();

    if (cleanOption.length > 5) {
      matches.push(cleanOption);
    }
  }

  if (matches.length >= 2) {
    return matches.slice(0, 4);
  }

  // Line-by-line check if options were separated by linebreaks
  const lines = source.split("\n");
  const lineMatched: string[] = [];
  const lineRegex = /^\s*(?:(\d+)[\.\)]|\[\d+\])\s*(.*)$/;
  for (const line of lines) {
    const lMatch = line.trim().match(lineRegex);
    if (lMatch && lMatch[2]) {
      const clean = lMatch[2].replace(/^\*+|\*+$/g, "").trim();
      if (clean.length > 5) {
        lineMatched.push(clean);
      }
    }
  }

  if (lineMatched.length >= 2) {
    return lineMatched.slice(0, 4);
  }

  // Strict: If no numbered options exist in the dilemma, return empty list
  return [];
}
