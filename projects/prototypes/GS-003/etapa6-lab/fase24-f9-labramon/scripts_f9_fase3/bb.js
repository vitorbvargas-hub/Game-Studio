const { readPNG } = require('./png.js');
for(const f of process.argv.slice(2)){const {width:W,height:H,data:D}=readPNG(f);let a=W,b=-1,c=H,d=-1,cmin=1e9,cmax=-1;
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(D[(y*W+x)*4+3]){a=Math.min(a,x);b=Math.max(b,x);c=Math.min(c,y);d=Math.max(d,y);}
for(let y=d-2;y<=d;y++)for(let x=0;x<W;x++)if(D[(y*W+x)*4+3]){cmin=Math.min(cmin,x);cmax=Math.max(cmax,x);}
console.log(f,JSON.stringify({w:b-a+1,h:d-c+1,minX:a,maxX:b,minY:c,maxY:d,contact:[cmin,cmax],contactCenter:(cmin+cmax+1)/2}));}
