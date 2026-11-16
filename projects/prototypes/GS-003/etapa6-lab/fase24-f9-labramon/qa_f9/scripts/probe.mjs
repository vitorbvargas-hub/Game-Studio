import {readPNG,hex} from './png.mjs';
const base='../../';
for (const d of ['S','E','N','W']) {
  const p=readPNG(base+`rotacoes/labramon_${d}.png`); const m={};
  for(let y=0;y<p.h;y++)for(let x=0;x<p.w;x++){const o=(y*p.w+x)*4; if(!p.data[o+3])continue; const c=hex(p.data,o); (m[c]??=[]).push([x,y]);}
  console.log(d,p.w,p.h,'bd',p.bd,'ct',p.ct, Object.keys(m).length);
  for(const [c,l] of Object.entries(m).sort()){const xs=l.map(a=>a[0]),ys=l.map(a=>a[1]); console.log(' ',c,l.length,'x',Math.min(...xs)+'-'+Math.max(...xs),'y',Math.min(...ys)+'-'+Math.max(...ys));}
}
