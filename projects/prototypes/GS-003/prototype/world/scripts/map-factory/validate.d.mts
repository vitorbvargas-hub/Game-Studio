// Tipos do validador (validate.mjs) para os testes em TS.
export interface GateResult {
  id: string;
  title: string;
  status: "pass" | "fail" | "skip";
  errors: string[];
  warnings: string[];
  info: string[];
}
export interface MapValidation {
  map: string;
  profile: string;
  ok: boolean;
  gates: GateResult[];
  stats: Record<string, unknown>;
}
export interface ValidateContext {
  species?: Set<string>;
  maps?: Record<string, unknown>;
  assets?: (key: string) => { day: boolean; night: boolean | null };
  profile?: string;
}
export const PROFILES: Record<string, { tile: string[]; object: string[]; anyObjectLayer: boolean }>;
export function profileOf(m: unknown): string;
export function isNormalizedW47(mask: number): boolean;
export function validateMap(id: string, m: unknown, ctx?: ValidateContext): MapValidation;
export function reportMarkdown(results: MapValidation[], opts?: { title?: string; date?: string }): string;
