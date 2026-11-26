const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const home = path.join(root, 'index.html');
let html = fs.readFileSync(home, 'utf8');

const section = '<section class="project-capabilities"><div class="wrap"><div class="capabilities-panel"><div class="capabilities-photo"><img src="/images/field-projects/project-support-racking-hd.webp" width="1400" height="1800" loading="lazy" decoding="async" alt="High-resolution zhengdarack warehouse racking project photograph"></div><div class="capabilities-content"><span class="capabilities-eyebrow">PROJECT SUPPORT</span><h2>One Racking Partner from Planning to Acceptance</h2><p class="capabilities-intro">Bring the project information together with one supplier—from early storage decisions and technical confirmation to manufacturing, export delivery and acceptance support.</p><div class="capabilities-list"><article><b aria-hidden="true">01</b><div><h3>Storage System Planning</h3><p>Compare access, density, stock rotation, aisle use and handling flow around your actual loads and building.</p></div></article><article><b aria-hidden="true">02</b><div><h3>Layout & Technical Confirmation</h3><p>Confirm dimensions, rated loads, configuration, interfaces, drawings and the agreed supply scope before production.</p></div></article><article><b aria-hidden="true">03</b><div><h3>U.S. & International Compliance Support</h3><p>Align the product specification with applicable U.S. or other target-market requirements, and confirm certificates and technical documents for project review and acceptance.</p></div></article><article><b aria-hidden="true">04</b><div><h3>Manufacturing & Quality Control</h3><p>Produce to the confirmed specification with agreed materials, finishes, inspections and production records.</p></div></article><article><b aria-hidden="true">05</b><div><h3>Export Packing & Delivery Coordination</h3><p>Prepare shipment documents, export packing and delivery coordination for the confirmed destination and handover boundary.</p></div></article><article><b aria-hidden="true">06</b><div><h3>Acceptance & After-Sales Support</h3><p>Support acceptance against agreed drawings, standards and quality documents, with follow-up for project questions.</p></div></article></div><a class="capabilities-link" href="/quote/">Discuss Your Warehouse Project →</a></div></div></div></section>';

if (html.includes('class="project-capabilities"')) {
  html = html.replace(/<section class="project-capabilities">[\s\S]*?<\/section>/, section);
} else {
  const marker = '<section class="project-process">';
  if (!html.includes(marker)) throw new Error('Project process marker not found');
  html = html.replace(marker, section + marker);
}

fs.writeFileSync(home, html);
console.log('Homepage capabilities section applied.');
