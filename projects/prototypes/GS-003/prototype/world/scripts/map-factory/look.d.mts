// Tipos de look.mjs (look de um mapa por cima da montagem: troca de chão/props, aliases do renderer).
export function applyLook(brief: Record<string, unknown>, build: { look: Record<string, unknown>; depth?: unknown; out?: string }): Record<string, unknown>;
export function lookAliases(brief: Record<string, unknown>, aliases: Record<string, unknown>): Record<string, unknown>;
export function packLights(pack: string, prefix: string): Record<string, Record<string, unknown>>;
export function packGrade(pack: string): Record<string, unknown> | undefined;
