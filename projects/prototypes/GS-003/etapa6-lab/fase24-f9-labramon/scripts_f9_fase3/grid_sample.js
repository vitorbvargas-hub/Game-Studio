// free local "unzoom": estimate block size b from target and sample (mode within block) -> small image keeping magenta bg as transparent
// Simplified: downsample crop by factor F using majority colour per block of FxF (no AI). args: src dst F
const { readPNG, writePNG } = require('./png.js');
const [src,dst,F]=[process.argv[2],process.argv[3],+process.argv[4]];const {width:W,height:H,data:D}=readPNG(src);
const ow=Math.floor(W/F),oh=Math.floor(H/F);const O=new Uint8ClampedArray(ow*oh*4);
for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){const m=new Map();for(let yy=Math.floor(y*F);yy<Math.floor((y+1)*F);yy++)for(let xx=Math.floor(x*F);xx<Math.floor((x+1)*F);xx++){const i=(yy*W+xx)*4;const k=((D[i]>>3)<<10)|((D[i+1]>>3)<<5)|(D[i+2]>>3);const e=m.get(k)||[0,0,0,0];e[0]++;e[1]+=D[i];e[2]+=D[i+1];e[3]+=D[i+2];m.set(k,e);}
 let b=null;for(const e of m.values())if(!b||e[0]>b[0])b=e;const o=(y*ow+x)*4;O[o]=b[1]/b[0];O[o+1]=b[2]/b[0];O[o+2]=b[3]/b[0];O[o+3]=255;}
writePNG(dst,ow,oh,O);console.log(dst,ow,oh);
