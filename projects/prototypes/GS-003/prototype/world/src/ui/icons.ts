// Ícones pixel-art ORIGINAIS do HUD (10×10), desenhados aqui como mapas de caracteres → SVG de retângulos.
// Nada copiado de terceiros. Paleta: a do projeto (Endesga-like, ver ART_STYLE_GUIDE).

const PAL: Record<string, string> = {
  k: "#181425", // contorno
  w: "#ffffff",
  g: "#c0cbdc",
  y: "#fee761",
  o: "#feae34",
  b: "#b86f50",
  d: "#743f39",
  r: "#e43b44",
  p: "#f6757a",
  G: "#63c74d",
  D: "#3e8948",
  c: "#2ce8f5",
  B: "#0099db",
  n: "#124e89",
  v: "#b55088",
  s: "#8b9bb4",
};

const ICONS: Record<string, string[]> = {
  bag: ["...kkkk...", "..k.yy.k..", "..kkkkkk..", ".kooooook.", "kooyoooook", "kooooooook", "kobbbbbbok", "kooooooook", "kobooooook", ".kkkkkkkk."],
  chest: ["..........", ".kkkkkkkk.", "kbbbbbbbbk", "kddddddddk", "kkkkyykkkk", "kbbbyybbbk", "kbbbbbbbbk", "kddddddddk", "kkkkkkkkkk", ".........."],
  team: ["..kk...kk.", ".kGGk.kcck", ".kGGk.kcck", "..kk...kk.", ".kDDk.kBBk", "kDDDDkBBBk", "kDDDDkBBBk", "kkkkkkkkkk", "..........", ".........."],
  dex: [".kkkkkkkk.", "krrrrrrrk.", "krwwrrrrk.", "krwwrrrrkk", "krrrrrrrkg", "krkkkkkrkg", "krrrrrrrkg", "kkkkkkkkkg", ".kgggggggg", ".........."],
  map: ["kkkk.kkkk.", "kGGkkyyykk", "kGGGkyyyBk", "kGrGkyyBBk", "kGGGkyBBBk", "kGGGkyyBBk", "kGGkkyyyBk", "kkkk.kkkkk", "..........", ".........."],
  quest: [".kkkkkkk..", "kyyyyyyyk.", ".kwwwwwwk.", ".kwkkkkwk.", ".kwwwwwwk.", ".kwkkkwwk.", ".kwwwwwwk.", "kyyyyyyyk.", ".kkkkkkk..", ".........."],
  shop: ["..kkkkkk..", ".kyyyyyyk.", "kyyokkoyyk", "kyykyyyyyk", "kyyokkoyyk", "kyyyyykyyk", "kyyokkoyyk", ".kyyyyyyk.", "..kkkkkk..", ".........."],
  evo: ["....kk....", "...kGGk...", "..kGGGGk..", ".kGGGGGGk.", "kkkGGGGkkk", "..kDDDDk..", "..kDDDDk..", "..kDDDDk..", "..kkkkkk..", ".........."],
  arena: ["k.......k.", "kgk...kgk.", ".kgk.kgk..", "..kgkgk...", "...kgk....", "..kgkgk...", ".kbk.kbk..", "kbk...kbk.", "kk.....kk.", ".........."],
  friends: ["...kk.....", "..kppk.kk.", "..kppkkcck", "...kk.kcck", "..kvvk.kk.", ".kvvvvkBBk", ".kvvvvkBBk", ".kkkkkkkkk", "..........", ".........."],
  guild: ["kk........", "kskkkkkk..", "ksrrrrrrk.", "ksrryrrrk.", "ksrrrrrrk.", "kskkkkkk..", "ks........", "ks........", "kk........", ".........."],
  trophy: ["kkkkkkkkk.", "kyyyyyyyk.", "kyowyyyyk.", "kyowyyyyk.", ".kyyyyyk..", "..kyyyk...", "...kyk....", "..kooook..", "..kkkkkk..", ".........."],
  gear: ["...kkk....", ".kkgggkk..", ".kgsssgk..", "kgsskssgk.", "kgskkksgk.", "kgsskssgk.", ".kgsssgk..", ".kkgggkk..", "...kkk....", ".........."],
  mail: ["..........", "kkkkkkkkkk", "kwkwwwwkwk", "kwwkwwkwwk", "kwwwkkwwwk", "kwwwwwwwwk", "kwwwwwwwwk", "kkkkkkkkkk", "..........", ".........."],
  gift: ["..kk.kk...", ".krrkrrk..", "kkkkkkkkk.", "krrrkrrrk.", "kkkkkkkkk.", ".krrkrrk..", ".krrkrrk..", ".krrkrrk..", ".kkkkkkk..", ".........."],
  coin: ["..kkkkk...", ".kyyyyyk..", "kyyoyyyyk.", "kyoyyyyyk.", "kyoyyyyyk.", "kyoyyyyyk.", "kyyoyyyyk.", ".kyyyyyk..", "..kkkkk...", ".........."],
  chat: ["kkkkkkkkk.", "kwwwwwwwk.", "kwkkwkkwk.", "kwwwwwwwk.", "kwkkkkwwk.", "kwwwwwwwk.", "kkkwkkkkk.", "..kwk.....", "..kk......", ".........."],
  boss: ["k..kkk..k.", "kk.krk.kk.", "kkkkkkkkk.", "kpwkpkwpk.", "kprkpkrpk.", "kpppppppk.", ".kpkkkpk..", ".kpwpwpk..", "..kkkkk...", ".........."],
  star: ["....k.....", "...kyk....", "kkkkykkkk.", "kyyyyyyyk.", ".kyyyyyk..", "..kyyyk...", ".kyykyyk..", "kyk...kyk.", "kk.....kk.", ".........."],
  moon: ["..kkkk....", ".kyyyk....", "kyyyk.....", "kyyk......", "kyyk......", "kyyyk...k.", ".kyyykkkk.", "..kkkkkk..", "..........", ".........."],
};

export type IconName = keyof typeof ICONS;

const cache = new Map<string, string>();

/** SVG inline (pixel-perfect com shape-rendering crispEdges). `size` em px CSS. */
export function icon(name: string, size = 20): string {
  const id = `${name}|${size}`;
  const hit = cache.get(id);
  if (hit) return hit;
  const rows = ICONS[name] ?? ICONS.star;
  let rects = "";
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const col = PAL[ch];
      if (col) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`;
    }),
  );
  const svg = `<svg class="ico" viewBox="0 0 10 10" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  cache.set(id, svg);
  return svg;
}

export const ICON_NAMES = Object.keys(ICONS);
