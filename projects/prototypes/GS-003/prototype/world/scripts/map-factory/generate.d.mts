// Tipos do gerador (generate.mjs) para os testes em TS.
export interface CurveSample {
  x: number;
  y: number;
  hw: number;
  s: number;
}
export function mulberry(seed: number): () => number;
export function autotileMask(same: (x: number, y: number) => boolean, x: number, y: number, mode: "w47" | "blob16" | "c16"): number;
export function cornerMask(same: (x: number, y: number) => boolean, x: number, y: number): number;
export function sampleCurve(points: number[][], opts?: { step?: number; hw?: number }): CurveSample[];
export function curveField(samples: CurveSample[], opts: { W: number; H: number; reach?: number }): Map<number, { f: number; k: number }>;
export function curvePolyline(samples: CurveSample[], T: number, every?: number): { points: { x: number; y: number }[]; hw: number[] };
export function checkBrief(brief: unknown): void;
export function strHash(s: string): number;
export function smoothNoise(seed: number): (x: number, y: number) => number;
export function generateFromBrief(brief: any): {
  tmj: any;
  stats: {
    size: string;
    props: number;
    tiles: number;
    terrain: Record<string, number>;
    bridges: { name: string; x: number; y: number; w: number; h: number; kind: string }[];
    rivers: { name: string; cells: number; curve?: boolean }[];
    curves: number;
  };
};
export function aliasesFor(brief: any, baseAliases: any): any;
