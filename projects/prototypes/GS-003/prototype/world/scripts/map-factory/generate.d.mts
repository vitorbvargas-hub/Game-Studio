// Tipos do gerador (generate.mjs) para os testes em TS.
export function mulberry(seed: number): () => number;
export function autotileMask(same: (x: number, y: number) => boolean, x: number, y: number, mode: "w47" | "blob16"): number;
export function checkBrief(brief: unknown): void;
export function strHash(s: string): number;
export function smoothNoise(seed: number): (x: number, y: number) => number;
export function generateFromBrief(brief: any): {
  tmj: any;
  stats: { size: string; props: number; tiles: number; terrain: Record<string, number>; bridges: { name: string; x: number; y: number; w: number; h: number }[]; rivers: { name: string; cells: number }[] };
};
export function aliasesFor(brief: any, baseAliases: any): any;
