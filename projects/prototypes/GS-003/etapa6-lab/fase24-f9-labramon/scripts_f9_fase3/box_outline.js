// mode resample + 1px external outline + pivot placement. args: src dst targetH(incl outline) canvas footY pivX
const { readPNG, writePNG } = require('./png.js');
const [src,dst]=process.argv.slice(2,4);const TH=+process.argv[4]||32,CAN=+process.argv[5]||60,FOOTY=+process.argv[6]||49,PIVX=+process.argv[7]||29.5;
const img=readPNG(src);const {width:W,height:H,data:D}=img;
let x0=W,x1=-1,y0=H,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(D[(y*W+x)*4+3]>10){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
const cw=x1-x0+1,ch=y1-y0+1;
// outline color: darkest frequent opaque color
const cnt=new Map();for(let i=0;i<W*H;i++){if(D[i*4+3]<200)continue;const l=D[i*4]+D[i*4+1]+D[i*4+2];if(l<120){const k=D[i*4]+','+D[i*4+1]+','+D[i*4+2];cnt.set(k,(cnt.get(k)||0)+1);}}
const OL=[...cnt.entries()].sort((a,b)=>b[1]-a[1])[0][0].split(',').map(Number);
const ih=TH-2;const s=ih/ch;const ow=Math.round(cw*s),oh=ih;
const out=new Array(ow*oh).fill(null);
const q=(r,g,b)=>((r>>4)<<8)|((g>>4)<<4)|(b>>4);
for(let dy=0;dy<oh;dy++)for(let dx=0;dx<ow;dx++){
 const sx0=dx/s,sx1=(dx+1)/s,sy0=dy/s,sy1=(dy+1)/s;let cov=0,tot=0,r=0,g=0,bb=0;
 for(let sy=Math.floor(sy0);sy<Math.ceil(sy1);sy++)for(let sx=Math.floor(sx0);sx<Math.ceil(sx1);sx++){
  const a=(Math.min(sx1,sx+1)-Math.max(sx0,sx))*(Math.min(sy1,sy+1)-Math.max(sy0,sy));if(a<=0)continue;tot+=a;
  const i=((y0+sy)*W+x0+sx)*4;if(D[i+3]<128)continue;cov+=a;r+=D[i]*a;g+=D[i+1]*a;bb+=D[i+2]*a;}
 if(cov/tot<0.5)continue;out[dy*ow+dx]=[Math.round(r/cov),Math.round(g/cov),Math.round(bb/cov)];}
// pad 1 and outline
const PW=ow+2,PH=oh+2;const P=new Array(PW*PH).fill(null);
for(let y=0;y<oh;y++)for(let x=0;x<ow;x++)P[(y+1)*PW+x+1]=out[y*ow+x];
const P2=P.slice();for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){if(P[y*PW+x])continue;
 const n=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const xx=x+a,yy=y+b;return xx>=0&&yy>=0&&xx<PW&&yy<PH&&P[yy*PW+xx];});if(n)P2[y*PW+x]=OL;}
let by1=-1;for(let y=0;y<PH;y++)for(let x=0;x<PW;x++)if(P2[y*PW+x])by1=y;
let cmin=1e9,cmax=-1;for(let y=by1-2;y<=by1;y++)for(let x=0;x<PW;x++)if(P2[y*PW+x]){cmin=Math.min(cmin,x);cmax=Math.max(cmax,x);}
const ox=Math.round(PIVX+0.5-(cmin+cmax+1)/2),oy=FOOTY-by1;
const C=new Uint8ClampedArray(CAN*CAN*4);let clip=0;
for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){const c=P2[y*PW+x];if(!c)continue;const X=x+ox,Y=y+oy;if(X<0||Y<0||X>=CAN||Y>=CAN){clip++;continue;}const i=(Y*CAN+X)*4;C[i]=c[0];C[i+1]=c[1];C[i+2]=c[2];C[i+3]=255;}
writePNG(dst,CAN,CAN,C);
let a=CAN,b=-1,c=CAN,d=-1;for(let y=0;y<CAN;y++)for(let x=0;x<CAN;x++)if(C[(y*CAN+x)*4+3]){a=Math.min(a,x);b=Math.max(b,x);c=Math.min(c,y);d=Math.max(d,y);}
console.log(JSON.stringify({dst,outline:OL,w:b-a+1,h:d-c+1,minX:a,maxX:b,minY:c,maxY:d,contact:[cmin+ox,cmax+ox],clip}));
