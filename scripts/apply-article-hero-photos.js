const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const photos = {
  'carton-flow-rack-systems': 'carton-flow-rack-1',
  'does-pallet-racking-need-to-be-bolted-down': 'selective-pallet-racking-6',
  'fire-marshal-warehouse-inspection': 'selective-pallet-racking-5',
  'first-racking-install-tips': 'selective-pallet-racking-4',
  'how-to-buy-pallet-rack-gsa-schedule': 'selective-pallet-racking-1',
  'mezzanine-permit-requirements': 'steel-mezzanine-3',
  'pallet-rack-dimensions-and-sizes-guide': 'selective-pallet-racking-2',
  'pallet-rack-osha-requirements': 'selective-pallet-racking-5',
  'pallet-rack-spacing-requirements': 'selective-pallet-racking-3',
  'pallet-rack-weight-capacity': 'selective-pallet-racking-4',
  'pallet-racking-cost': 'selective-pallet-racking-8',
  'pallet-shuttle-system-planning-guide': 'drive-in-warehouse-2',
  'push-back-vs-pallet-flow': 'selective-pallet-racking-10',
  'rack-protection-guide': 'selective-pallet-racking-7',
  'selective-vs-drive-in-racking': 'drive-in-warehouse-1',
  'static-dynamic-automated-pallet-racking': 'mobile-pallet-racking-1',
  'used-vs-new-pallet-racking': 'selective-pallet-racking-6',
  'warehouse-layout-design-guide': 'selective-pallet-racking-3',
  'warehouse-management-dos-and-donts': 'selective-pallet-racking-9',
  'warehouse-racking-fails-inspection': 'selective-pallet-racking-5',
  'warehouse-racking-permits-guide': 'selective-pallet-racking-8',
  'warehouse-racking-project-budget': 'selective-pallet-racking-1'
};

let updated = 0;
for (const [slug, photo] of Object.entries(photos)) {
  const file = path.join(root, 'articles', slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const hero = `<section class="hero article-photo-hero" style="--article-hero-image:url('/images/field-projects/${photo}.webp')">`;
  const pattern = /<section class="hero(?: article-photo-hero)?"(?: style="--article-hero-image:[^"]+")?>/;
  if (!pattern.test(html)) throw new Error(`Hero marker not found: ${slug}`);
  html = html.replace(pattern, hero);
  fs.writeFileSync(file, html, 'utf8');
  updated++;
}

console.log(JSON.stringify({ updated, uniquePhotos: new Set(Object.values(photos)).size }));
