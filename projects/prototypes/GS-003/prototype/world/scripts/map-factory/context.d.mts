// Tipos do contexto do validador (context.mjs) para os testes em TS.
import type { ValidateContext } from "./validate.mjs";
export const WORLD_DIR: string;
export const GAME_ASSETS: string;
export const MAPS_DIR: string;
export function assetResolver(aliases: unknown): (key: string) => { day: boolean; night: boolean | null };
export function loadSpecies(): Set<string>;
export function loadMaps(dirs?: string[]): Record<string, { tmj: any; path: string; aliases: any }>;
export function contextFor(id: string, maps: Record<string, { tmj: any; path: string; aliases: any }>, species?: Set<string>): ValidateContext;
export const MAP_FACTORY_ART: string;
export function extraPackFiles(e: { pack: string; prefix: string; root?: string; crops?: Record<string, { from: string; rect: number[] }> }): Map<string, { path: string; rect?: number[] }>;
