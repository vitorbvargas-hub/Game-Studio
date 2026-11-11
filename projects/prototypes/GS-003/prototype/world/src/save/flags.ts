/**
 * Flags de URL das entregas do Quality Overhaul que viraram PADRÃO na branch quality-overhaul (2026-11-11).
 * Cada uma tem um opt-out explícito para comparação com o comportamento antigo.
 */

/** Controlador de animação v2 (src/render/animctl.ts: idle de pés juntos, 11 estados). ?anim=v1 volta ao antigo. */
export function animV2Of(params: URLSearchParams): boolean {
  return params.get("anim") !== "v1";
}

/**
 * Encontros GS-012 (grama alta + pontos visíveis + selvagens da tabela) nos mapas com tabela.
 * ?encounters=0 desliga (volta às zonas de spawn); ?encdebug=1 liga sempre (painel de debug).
 */
export function encountersOf(params: URLSearchParams): boolean {
  return params.get("encdebug") === "1" || params.get("encounters") !== "0";
}
