const { readPNG } = require('./png.js');
const [f,x0,y0,x1,y1]=[process.argv[2],...process.argv.slice(3).map(Number)];const {width:W,data:D}=readPNG(f);
const pal=new Map();const sym='.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef';const rows=[];
for(let y=y0;y<=y1;y++){let r=String(y).padStart(2)+' ';for(let x=x0;x<=x1;x++){const i=(y*W+x)*4;if(!D[i+3]){r+='.';continue;}const k=`#${[D[i],D[i+1],D[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('')}`;if(!pal.has(k))pal.set(k,sym[pal.size+1]);r+=pal.get(k);}rows.push(r);}
console.log(rows.join('\n'));console.log([...pal.entries()].map(([k,v])=>v+'='+k).join(' '));
