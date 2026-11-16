// merge near-black outline shades into #010101; replace magenta-ish strays by 8-neighbour mode
const { readPNG, writePNG } = require('./png.js');
const [src,dst]=process.argv.slice(2);const {width:W,height:H,data:D}=readPNG(src);let nb=0,mg=0;
for(let i=0;i<W*H;i++){const o=i*4;if(!D[o+3])continue;if(D[o]+D[o+1]+D[o+2]<=12){if(D[o]!==1||D[o+1]!==1||D[o+2]!==1)nb++;D[o]=1;D[o+1]=1;D[o+2]=1;}}
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const o=(y*W+x)*4;if(!D[o+3])continue;const r=D[o],g=D[o+1],b=D[o+2];
 if(r>120&&b>120&&g<40){const m=new Map();for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const q=(yy*W+xx)*4;if(!D[q+3])continue;const k=D[q]+','+D[q+1]+','+D[q+2];m.set(k,(m.get(k)||0)+1);}
  const best=[...m.entries()].sort((a,b)=>b[1]-a[1])[0][0].split(',').map(Number);D[o]=best[0];D[o+1]=best[1];D[o+2]=best[2];mg++;}}
writePNG(dst,W,H,D);console.log(src,'near-black merged',nb,'magenta strays fixed',mg);
