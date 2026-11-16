const { readPNG } = require('./png.js');const a=readPNG(process.argv[2]),b=readPNG(process.argv[3]);const W=a.width,H=a.height;
// align by flipping b horizontally, then best x-shift
let best=null;for(let s=-6;s<=6;s++){let diff=0,tot=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const xb=W-1-x+s;const ia=(y*W+x)*4;const oa=a.data[ia+3]>0;let ob=false,ib=-1;if(xb>=0&&xb<W){ib=(y*W+xb)*4;ob=b.data[ib+3]>0;}if(!oa&&!ob)continue;tot++;if(oa!==ob){diff++;continue;}const d=Math.abs(a.data[ia]-b.data[ib])+Math.abs(a.data[ia+1]-b.data[ib+1])+Math.abs(a.data[ia+2]-b.data[ib+2]);if(d>30)diff++;}
if(!best||diff/tot<best.r)best={s,r:diff/tot,diff,tot};}
console.log('E vs mirror(W): best shift',best.s,'differing pixels',best.diff,'/',best.tot,(100*best.r).toFixed(1)+'%');
