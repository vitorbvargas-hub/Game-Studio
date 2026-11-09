// Tipos do adaptador (adapt-brief.mjs) para os testes em TS.
export function hashSeed(s: string): number;
export function isDesignBrief(b: unknown): boolean;
export function zoneRect(z: any): { x: number; y: number; w: number; h: number };
export function signText(it: { effect?: string; description: string }): string;
export function radiusFor(widthTiles: number | undefined): [number, number];
export function adaptDesignBrief(gd: any, kit: any, build?: any): { brief: any; report: string[] };
