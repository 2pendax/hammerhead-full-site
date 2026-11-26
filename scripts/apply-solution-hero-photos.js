const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const photos = {
  'solutions': 'selective-pallet-racking-4',
  'archive-storage': 'industrial-shelving-1',
  'automated-storage': 'selective-pallet-racking-1',
  'beverage-keg-storage': 'selective-pallet-racking-9',
  'cantilever-rack': 'cantilever-racking-2',
  'carton-flow-racks': 'carton-flow-rack-1',
  'drive-in-racks': 'drive-in-warehouse-1',
  'mezzanines': 'steel-mezzanine-1',
  'mobile-pallet-racking': 'mobile-pallet-racking-1',
  'pallet-flow-racks': 'selective-pallet-racking-10',
  'pallet-shuttle-systems': 'drive-in-warehouse-2',
  'pick-modules': 'longspan-racking-3',
  'push-back-racking': 'selective-pallet-racking-3',
  'selective-pallet-racks': 'selective-pallet-racking-4',
  'shelving-systems': 'longspan-racking-4'
};

let updated = 0;
for (const [slug, photo] of Object.entries(photos)) {
  const file = slug === 'solutions'
    ? path.join(root, 'solutions', 'index.html')
    : path.join(root, 'solutions', slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const hero = `<div class="hero solution-photo-hero" style="--solution-hero-image:url('/images/field-projects/${photo}.webp')">`;
  const pattern = /<div class="hero(?: solution-photo-hero)?"(?: style="--solution-hero-image:[^"]+")?>/;
  if (!pattern.test(html)) throw new Error(`Hero marker not found: ${slug}`);
  html = html.replace(pattern, hero);
  fs.writeFileSync(file, html, 'utf8');
  updated++;
}

console.log(JSON.stringify({ updated, uniquePhotos: new Set(Object.values(photos)).size }));
