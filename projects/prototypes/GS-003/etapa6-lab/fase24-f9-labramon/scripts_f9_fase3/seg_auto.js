// auto-segment non-magenta blobs by column runs; print bboxes
const { readPNG } = require('./png.js');
const img = readPNG(process.argv[2]); const {width:W,height:H,data:D}=img;
const isBg=(i)=>{const r=D[i],g=D[i+1],b=D[i+2];return r>150&&b>150&&g<Math.min(r,b)-60;};
const col=new Array(W).fill(0);
for(let x=0;x<W;x++)for(let y=0;y<H;y++){if(!isBg((y*W+x)*4))col[x]++;}
const segs=[];let s=-1;
for(let x=0;x<=W;x++){const on=x<W&&col[x]>2;if(on&&s<0)s=x;if(!on&&s>=0){if(x-s>20)segs.push([s,x-1]);s=-1;}}
console.log('size',W,H);
for(const [x0,x1] of segs){let y0=H,y1=-1;for(let y=0;y<H;y++)for(let x=x0;x<=x1;x++)if(!isBg((y*W+x)*4)){if(y<y0)y0=y;if(y>y1)y1=y;}
console.log(JSON.stringify({x0,x1,y0,y1,w:x1-x0+1,h:y1-y0+1}));}
