/**
 * Deriva o "clima visual" ambiente (cor de fundo/vinheta) a partir do texto real
 * de [STATUS DO MUNDO] gerado pelo Motor Narrativo. Nunca fixo — muda com a
 * hora e o clima reais da cena, em vez de sempre usar "hora azul".
 */
export type AmbientMood = "night-crimson" | "day-industrial" | "dusk-amber" | "storm-grey";

export function getAmbientMood(statusText: string): AmbientMood {
  const t = (statusText || "").toLowerCase();

  // Clima extremo tem prioridade sobre a hora do dia
  if (/tempestade|tormenta|chuva forte|trovão|trovões/.test(t)) {
    return "storm-grey";
  }

  if (/madrugada|noite|meia-noite|lua carmesim|lua carmim/.test(t)) {
    return "night-crimson";
  }

  if (/entardecer|fim de tarde|crepúsculo|pôr do sol/.test(t)) {
    return "dusk-amber";
  }

  // Manhã, dia, tarde, meio-dia — luz industrial filtrada pela poluição de Backlund
  return "day-industrial";
}
