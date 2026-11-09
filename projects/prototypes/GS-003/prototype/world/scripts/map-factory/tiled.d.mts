// Tipos dos utilitários Tiled (tiled.mjs) para os testes em TS.
export function prop(props: { name: string; value: unknown }[] | undefined, name: string): unknown;
export function solidGrid(m: unknown): { solid: Uint8Array; why: Map<number, string> };
export function allObjects(m: unknown): any[];
