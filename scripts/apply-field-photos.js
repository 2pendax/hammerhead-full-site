const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const libraries = {
  pallet: ['selective-pallet-racking-1','selective-pallet-racking-2','selective-pallet-racking-3','selective-pallet-racking-4'],
  dense: ['drive-in-warehouse-1','drive-in-warehouse-2','selective-pallet-racking-4'], mobile: ['mobile-pallet-racking-1','selective-pallet-racking-3'],
  shelving: ['industrial-shelving-1','medium-duty-shelving-1','medium-duty-shelving-2'], longspan: ['longspan-racking-1','longspan-racking-2','medium-duty-shelving-1'],
  flow: ['carton-flow-rack-1','longspan-racking-2'], stacking: ['stacking-rack-1','stacking-rack-2'], cantilever: ['cantilever-racking-1','cantilever-racking-2'],
  cable: ['cable-reel-racking-1','cable-reel-racking-2'], mezzanine: ['steel-mezzanine-1','steel-mezzanine-2','steel-mezzanine-3']
};
const meta = {
  pallet:['Installed industrial pallet racking with clear forklift aisles','Real warehouse pallet-racking installation. Final bay sizes, loads and aisles must be engineered for the project.'],
  dense:['High-density warehouse racking installation','Real high-density storage installation. Lane arrangement depends on pallets, rotation and handling equipment.'],
  mobile:['Mobile pallet racking on powered bases','Real mobile-racking project. Rails, controls, floor interfaces and safety provisions require project-specific confirmation.'],
  shelving:['Industrial shelving for hand-loaded warehouse storage','Real industrial shelving installation. Shelf size, load rating and aisles vary by stored item and picking method.'],
  longspan:['Longspan warehouse shelving with steel frames and beams','Real longspan shelving for bulky hand-loaded goods. Confirm shelf load, clear span and deck type.'],
  flow:['Gravity carton flow rack lanes','Real gravity-flow rack detail. Lane slope, container type and replenishment method must be tested.'],
  stacking:['Loaded removable stacking racks','Real stacking-rack application. Stack height, unit load and handling method determine the safe configuration.'],
  cantilever:['Cantilever storage racks for long materials','Real cantilever-rack installation. Arm capacity, column spacing and restraint require confirmation.'],
  cable:['Industrial cable reel storage racking','Real cable-reel installation. Reel diameter, weight, axle support and dispensing method govern the design.'],
  mezzanine:['Installed steel warehouse mezzanine platform','Real steel-platform installation. Loads, stairs, guarding, fire strategy and approvals are project-specific.']
};
function type(slug){if(/(cable|wire|coil|reel)/.test(slug))return'cable';if(/(cantilever|lumber|timber|pipe)/.test(slug))return'cantilever';if(/(mezzanine|platform|multi-tier)/.test(slug))return'mezzanine';if(/(stacking|stackable)/.test(slug))return'stacking';if(/mobile/.test(slug))return'mobile';if(/(carton-flow|gravity-flow|flow-rack)/.test(slug)&&!/pallet-flow/.test(slug))return'flow';if(/(longspan|wide-span|medium-duty|bulk-storage|industrial-shelving|warehouse-shelving|shelving-system|shelf)/.test(slug))return'longspan';if(/(drive-in|drive-through|high-density|shuttle|deep-lane)/.test(slug))return'dense';if(/(shelving|storage-racks)/.test(slug)&&!/(pallet|heavy-duty)/.test(slug))return'shelving';return'pallet'}
function img(name,alt,eager=false){return`<img src="/images/field-projects/${name}.webp" width="1600" height="1100" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" alt="${alt}">`}
let updated=0;
for(const entry of fs.readdirSync(path.join(root,'racking-guides'),{withFileTypes:true})){
  if(!entry.isDirectory())continue;const slug=entry.name,file=path.join(root,'racking-guides',slug,'index.html');if(!fs.existsSync(file))continue;
  let s=fs.readFileSync(file,'utf8');s=s.replace(/<section class="field-gallery"[\s\S]*?<\/section>/,'');if(!s.includes('/assets/field-photos.css'))s=s.replace('<link rel="stylesheet" href="/assets/racking-guides.css">','<link rel="stylesheet" href="/assets/racking-guides.css"><link rel="stylesheet" href="/assets/field-photos.css">');const t=type(slug),lib=libraries[t],[alt,caption]=meta[t];const offset=[...slug].reduce((n,c)=>n+c.charCodeAt(0),0)%lib.length;const p=lib.map((_,i)=>lib[(i+offset)%lib.length]);
  s=s.replace(/<figure(?: class="field-hero")?><img[^>]+><figcaption>[^<]*<\/figcaption><\/figure>(?=<\/div><div class="quick">)/,`<figure class="field-hero">${img(p[0],alt,true)}<figcaption>${caption}</figcaption></figure>`);
  const galleryPhotos=p.slice(1,Math.min(3,p.length));const gallery=`<section class="field-gallery${galleryPhotos.length===1?' field-gallery-single':''}" aria-label="Real project photos">${galleryPhotos.map((photo,index)=>`<figure>${img(photo,alt)}<figcaption>${index===0?caption:'Project photograph from the zhengdarack product library. Final supply follows the approved project specification.'}</figcaption></figure>`).join('')}</section>`;
  s=s.replace('</div><div class="layout">',`</div>${gallery}<div class="layout">`);fs.writeFileSync(file,s,'utf8');updated++;
}
const home=path.join(root,'index.html');let h=fs.readFileSync(home,'utf8');if(!h.includes('home-hero'))h=h.replace('<section class="hero">','<section class="hero home-hero">');if(!h.includes('home-card-photo')){h=h.replace('<article class="card"><h3>Pallet racking</h3>',`<article class="card"><img class="home-card-photo" src="/images/field-projects/selective-pallet-racking-4.webp" width="1600" height="1100" loading="lazy" decoding="async" alt="Selective pallet racking installed in a warehouse"><h3>Pallet racking</h3>`).replace('<article class="card"><h3>Industrial shelving</h3>',`<article class="card"><img class="home-card-photo" src="/images/field-projects/longspan-racking-1.webp" width="1600" height="1100" loading="lazy" decoding="async" alt="Industrial longspan warehouse shelving"><h3>Industrial shelving</h3>`).replace('<article class="card"><h3>Mezzanine systems</h3>',`<article class="card"><img class="home-card-photo" src="/images/field-projects/steel-mezzanine-2.webp" width="1600" height="1100" loading="lazy" decoding="async" alt="Steel mezzanine platform installed in a warehouse"><h3>Mezzanine systems</h3>`)}fs.writeFileSync(home,h,'utf8');updated++;
console.log(JSON.stringify({updated}));
