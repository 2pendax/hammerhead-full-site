const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../about/index.html');
let html = fs.readFileSync(file, 'utf8');
const gallery = '<section class="about-project-gallery" aria-label="zhengdarack product and project photographs"><div class="wrap"><div class="about-gallery-heading"><span>REAL PRODUCT & PROJECT PHOTOGRAPHS</span><h2>Warehouse Storage Systems in Practice</h2><p>Our visual library covers pallet racking, raised storage platforms and hand-loaded shelving. Final configurations are prepared around the actual project requirements.</p></div><div class="about-gallery-grid"><figure><img src="/images/field-projects/selective-pallet-racking-9.webp" width="1600" height="1100" decoding="async" alt="Loaded pallet racking in an operating warehouse"><figcaption><strong>Pallet Racking</strong><span>Storage layouts planned around loads, access and handling flow.</span></figcaption></figure><figure><img src="/images/field-projects/steel-mezzanine-2.webp" width="1600" height="1100" decoding="async" alt="Steel mezzanine storage platform project"><figcaption><strong>Mezzanine Systems</strong><span>Raised storage solutions coordinated with structure and access.</span></figcaption></figure><figure><img src="/images/field-projects/longspan-racking-7.webp" width="1600" height="1100" decoding="async" alt="Industrial longspan shelving installation"><figcaption><strong>Industrial Shelving</strong><span>Hand-loaded storage arranged for item size and daily operation.</span></figcaption></figure></div></div></section>';

html = html.replace('<body>', '<body class="about-page">');
html = html.replace('<section class="hero">', '<section class="hero about-hero">');
if (!html.includes('class="about-project-gallery"')) {
  const marker = '<section class="section"><div class="wrap content">';
  if (!html.includes(marker)) throw new Error('About content marker not found');
  html = html.replace(marker, gallery + marker);
}

fs.writeFileSync(file, html, 'utf8');
console.log(JSON.stringify({ updated: 1, galleryImages: 3 }));
