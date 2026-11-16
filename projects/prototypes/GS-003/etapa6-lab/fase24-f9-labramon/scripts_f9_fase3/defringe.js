// recolor magenta-contaminated pixels (b>=0.8r, r>g+40) -> outline black; report count
const { readPNG, writePNG } = require('./png.js');
const [src,dst]=process.argv.slice(2);const img=readPNG(src);const {width:W,height:H,data:D}=img;let n=0;const seen=new Map();
for(let i=0;i<W*H;i++){const o=i*4;if(!D[o+3])continue;const r=D[o],g=D[o+1],b=D[o+2];
 if(r>g+40&&b>=0.8*r&&r+g+b<330){seen.set(`${r},${g},${b}`,1);D[o]=0;D[o+1]=0;D[o+2]=0;n++;}}
writePNG(dst,W,H,D);console.log(src,'defringed',n,[...seen.keys()].slice(0,12).join(' '));
