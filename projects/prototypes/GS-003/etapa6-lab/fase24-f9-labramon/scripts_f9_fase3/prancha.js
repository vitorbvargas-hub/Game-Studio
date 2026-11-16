const { readPNG, writePNG } = require('./png.js');
const B='/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab';const W9='../work';
const sprites=[
 ['tamer',readPNG(`${B}/fase1-pixellab/referencias/tamer_v13_south.png`)],
 ['agumon',readPNG(`${B}/fase17-f7-hibrido/v2/pacote_agumon_f7v2/rotations/S.png`)],
 ['hawkmon',readPNG(`${B}/fase22-hawkmon-estilo-chatgpt/pacote_hawkmon_v2/rotations/S.png`)],
 ...['S','N','W','E'].map(d=>['lab'+d,readPNG(`${W9}/fin_${d}.png`)]),
 ['sitS',readPNG(`${W9}/v1f_S.png`)],['sitW',readPNG(`${W9}/v1f_W.png`)]];
// each slot 64 wide, ground line at y=56 of a 64-tall strip; align sprite bottom-opaque row to ground, bbox-centre x to slot centre
const SW=64,SH=64,GY=56,N=sprites.length,CW=SW*N,CH=SH;
const C=new Uint8ClampedArray(CW*CH*4);
const base=[90,143,61],dark=[74,122,48];
for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){const i=(y*CW+x)*4;const g=((x%32===0)||(y%32===0));const c=g?dark:base;C[i]=c[0];C[i+1]=c[1];C[i+2]=c[2];C[i+3]=255;}
const info=[];
sprites.forEach(([n,s],k)=>{const {width:w,height:h,data:d}=s;let a=w,b=-1,c=h,e=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>0){a=Math.min(a,x);b=Math.max(b,x);c=Math.min(c,y);e=Math.max(e,y);}
 const ox=k*SW+Math.round(SW/2-(a+b+1)/2),oy=GY-e;
 // contact shadow ellipse (2px tall) under feet
 const sw=Math.round((b-a+1)*0.8);for(let x=-sw/2;x<sw/2;x++)for(let yy=0;yy<2;yy++){const X=Math.round(k*SW+SW/2+x),Y=GY+yy;const i=(Y*CW+X)*4;C[i]=56;C[i+1]=92;C[i+2]=40;}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const si=(y*w+x)*4;if(d[si+3]<128)continue;const X=x+ox,Y=y+oy;if(X<0||Y<0||X>=CW||Y>=CH)continue;const di=(Y*CW+X)*4;C[di]=d[si];C[di+1]=d[si+1];C[di+2]=d[si+2];}
 info.push({n,w:b-a+1,h:e-c+1});});
writePNG(process.argv[2],CW,CH,C);
const s=4,O=new Uint8ClampedArray(CW*s*CH*s*4);for(let y=0;y<CH*s;y++)for(let x=0;x<CW*s;x++){const si=(Math.floor(y/s)*CW+Math.floor(x/s))*4,di=(y*CW*s+x)*4;for(let q=0;q<4;q++)O[di+q]=C[si+q];}
writePNG(process.argv[3],CW*s,CH*s,O);console.log(JSON.stringify(info));
