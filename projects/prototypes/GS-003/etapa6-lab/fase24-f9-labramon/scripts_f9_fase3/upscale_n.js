const { readPNG, writePNG } = require('./png.js');
const img=readPNG(process.argv[2]);const s=Number(process.argv[4]);const {width:W,height:H,data:D}=img;
const o=new Uint8ClampedArray(W*s*H*s*4);
for(let y=0;y<H*s;y++)for(let x=0;x<W*s;x++){const si=(Math.floor(y/s)*W+Math.floor(x/s))*4,di=(y*W*s+x)*4;for(let k=0;k<4;k++)o[di+k]=D[si+k];}
writePNG(process.argv[3],W*s,H*s,o);
