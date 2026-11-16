// crop rect with margin, pad with magenta to min size (>=256 each side), centered horizontally, bottom-aligned kept by symmetric pad
const { readPNG, writePNG } = require('./png.js');
const [src,out,x0,y0,x1,y1,minS]=[process.argv[2],process.argv[3],...process.argv.slice(4,8).map(Number),Number(process.argv[8]||256)];
const img=readPNG(src);const {width:W,data:D}=img;const m=6;
const cx0=x0-m,cy0=y0-m,cw=x1-x0+1+2*m,ch=y1-y0+1+2*m;
const w=Math.max(cw,minS),h=Math.max(ch,minS);const ox=Math.floor((w-cw)/2),oy=Math.floor((h-ch)/2);
const o=new Uint8ClampedArray(w*h*4);
for(let i=0;i<w*h;i++){o[i*4]=255;o[i*4+1]=0;o[i*4+2]=255;o[i*4+3]=255;}
for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const si=((cy0+y)*W+cx0+x)*4,di=((oy+y)*w+ox+x)*4;for(let k=0;k<4;k++)o[di+k]=D[si+k];o[di+3]=255;}
writePNG(out,w,h,o);console.log(out,w,h,'offset',ox,oy);
