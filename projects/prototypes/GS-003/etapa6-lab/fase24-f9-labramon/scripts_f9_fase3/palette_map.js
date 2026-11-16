// map every opaque pixel to nearest colour of a reference palette (taken from ref PNGs)
const { readPNG, writePNG } = require('./png.js');
const [src,dst,...refs]=process.argv.slice(2);const pal=new Map();
for(const r of refs){const {width:W,height:H,data:D}=readPNG(r);for(let i=0;i<W*H;i++)if(D[i*4+3])pal.set(D[i*4]+','+D[i*4+1]+','+D[i*4+2],1);}
const P=[...pal.keys()].map(k=>k.split(',').map(Number));
const {width:W,height:H,data:D}=readPNG(src);
for(let i=0;i<W*H;i++){const o=i*4;if(!D[o+3])continue;let best=null,bd=1e9;for(const p of P){const d=2*(D[o]-p[0])**2+4*(D[o+1]-p[1])**2+3*(D[o+2]-p[2])**2;if(d<bd){bd=d;best=p;}}D[o]=best[0];D[o+1]=best[1];D[o+2]=best[2];}
writePNG(dst,W,H,D);console.log(dst,'palette',P.length);
