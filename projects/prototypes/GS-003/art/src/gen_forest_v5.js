'use strict';
// GS-003 forest-v5 -- professional ready-made tileset (ADR-010 method
// switch: NinjaAdventure Asset Pack, pixel-boy, CC0, instead of procedural
// code-drawn tiles used in forest-v3/v4/v4.1). 16px source art rendered at
// 2x (nearest-neighbor) -> 32px engine grid tile, see resolutionDecision.
const fs = require('fs');
const path = require('path');
const { naSheet, cropTiles2x, cropTiles, recolor } = require('./na_source.js');
const { buildBlobSet } = require('./na_blob.js');

const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/forest-v5');
fs.mkdirSync(path.join(OUT, 'tiles'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'props'), { recursive: true });

const floor = naSheet('tileset_floor.png');

// ---- ground fills (native 16px samples used as tiled-fill brushes) -------
const grassSample = cropTiles(floor, 6, 7, 1, 1);
const dirtSample = cropTiles(floor, 1, 8, 1, 1);

// ---- 16-tile real-texture blob autotile: dirt path through grass ---------
const pathBlob = buildBlobSet('path_blob', dirtSample, grassSample, 10101);
for (const [name, canvas] of Object.entries(pathBlob)) canvas.save(path.join(OUT, 'tiles', `${name}.png`));

// ---- plain grass variants (3 distinct crops, no repeat seam) -------------
const grassVariants = [
  cropTiles2x(floor, 6, 7, 1, 1),
  cropTiles2x(floor, 2, 11, 1, 1),
  cropTiles2x(floor, 3, 11, 1, 1),
];
grassVariants.forEach((c, i) => c.save(path.join(OUT, 'tiles', `grass_0${i}.png`)));

// ---- forest clearing stamp: real hand-painted circular dirt-in-grass blob,
// used as a multi-tile ground decal (not part of the autotile set) so the
// artist's own transition shading is reused verbatim, not reconstructed. ---
const clearingStamp = cropTiles2x(floor, 0, 7, 5, 4);
clearingStamp.save(path.join(OUT, 'tiles', 'clearing_stamp_5x4.png'));
const pathStrip = cropTiles2x(floor, 3, 7, 2, 4);
pathStrip.save(path.join(OUT, 'tiles', 'path_strip_2x4.png'));

// ---- canopy clumps: licensed blossom-tree blob, hue-shifted orange->green
// so the professional shading/puff silhouette is kept but reads as forest
// foliage, not sakura. No separate base/top layer this version (see
// README self-critique #1): the canonical IdleDex reference shows massed
// canopy without visible individual trunks, so a single collide+decor tile
// matches the reference better than forest-v4's base/top split did. ------
const canopyBig = cropTiles2x(floor, 0, 0, 5, 4);
const canopyBigGreen = recolor(canopyBig, { hueShift: 0.25, satMul: 0.9, lightAdd: -0.02 });
canopyBigGreen.save(path.join(OUT, 'props', 'canopy_clump_big.png'));
const canopyStrip = cropTiles2x(floor, 3, 0, 2, 4);
const canopyStripGreen = recolor(canopyStrip, { hueShift: 0.25, satMul: 0.85 });
canopyStripGreen.save(path.join(OUT, 'props', 'canopy_clump_strip.png'));
// second green tone for variety (olive/darker) from the pink block
const canopyBig2 = cropTiles2x(floor, 11, 0, 5, 4);
const canopyBig2Green = recolor(canopyBig2, { hueShift: 0.22, satMul: 0.8, lightAdd: -0.1 });
canopyBig2Green.save(path.join(OUT, 'props', 'canopy_clump_dark.png'));

console.log('forest-v5 ground+canopy assets written to', OUT);
