// Tipos do adaptador (adapt-brief.mjs) para os testes em TS.
export function hashSeed(s: string): number;
export function isDesignBrief(b: unknown): boolean;
export function zoneRect(z: any): { x: number; y: number; w: number; h: number };
export function signText(it: { effect?: string; description: string }): string;
export function radiusFor(widthTiles: number | undefined): [number, number];
export function adaptDesignBrief(gd: any, kit: any, build?: any): { brief: any; report: string[]; warnings: string[] };
export const DEFAULT_ORGANIC: any;
export function organicOf(kit: any, build?: any): any;
export function meanderRoute(points: number[][], rng: () => number, opts?: { step?: number; amp?: number }, keepStraight?: (a: number[], b: number[]) => boolean): number[][];
export function riverPoints(r: { x: number; y: number; w: number; h: number }, crossings: number[], rng: () => number, o: any, size: { W: number; H: number }, dry?: number[]): number[][];
export function halfWidthFor(widthTiles: number | undefined): number;
export function crossingKind(p: any, fallback?: string): "bridge" | "ford";
export function npcSpriteOf(n: any, kit: any): { key: string; solid: boolean } | null;
export function inPolygon(pts: number[][], x: number, y: number): boolean;
export function polygonCenterline(poly: number[][], size: { W: number; H: number }, opts?: { step?: number; dry?: number[][] }): number[][];
