const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../index.html');
let html = fs.readFileSync(file, 'utf8');
if (html.includes('class="guide-card-grid"')) {
  console.log(JSON.stringify({ updated: 0, reason: 'already applied' }));
  process.exit(0);
}
const cards = [
  ['/racking-guides/heavy-duty-pallet-racking/', '/images/field-projects/selective-pallet-racking-1.webp', 'Heavy Duty Pallet Racking', 'Heavy duty pallet racks installed in a warehouse'],
  ['/racking-guides/warehouse-racking-systems/', '/images/field-projects/selective-pallet-racking-3.webp', 'Warehouse Racking Systems', 'Warehouse pallet racking system and forklift aisles'],
  ['/racking-guides/high-density-pallet-racking/', '/images/field-projects/drive-in-warehouse-1.webp', 'High Density Pallet Racking', 'High density pallet storage installation'],
  ['/racking-guides/drive-in-pallet-racking/', '/images/field-projects/drive-in-warehouse-2.webp', 'Drive-In Pallet Racking', 'Drive-in pallet racking lanes in a warehouse'],
  ['/racking-guides/pallet-flow-racking/', '/images/solutions/pallet-flow-racks/heroImage.webp', 'Pallet Flow Racking', 'Pallet flow racking system'],
  ['/racking-guides/radio-shuttle-racking/', '/images/solutions/pallet-shuttle-systems/productImage.avif', 'Radio Shuttle Racking', 'Radio shuttle pallet storage system'],
  ['/racking-guides/industrial-storage-racks/', '/images/field-projects/longspan-racking-4.webp', 'Industrial Storage Racks', 'Industrial storage racks installed in a warehouse'],
  ['/racking-guides/steel-mezzanine/', '/images/field-projects/steel-mezzanine-2.webp', 'Steel Mezzanine', 'Steel mezzanine platform installation']
];
const grid = `<div class="guide-card-grid">${cards.map(([href, src, title, alt]) => `<a class="guide-card" href="${href}"><img src="${src}" width="1600" height="1100" loading="lazy" decoding="async" alt="${alt}"><span>${title}</span><small>Read guide <span aria-hidden="true">→</span></small></a>`).join('')}</div>`;
const next = html.replace(/<div class="links">[\s\S]*?<\/div>/, grid);
if (next === html) throw new Error('Homepage planning-guide link list was not found');
fs.writeFileSync(file, next, 'utf8');
console.log(JSON.stringify({ updated: 1, cards: cards.length }));
