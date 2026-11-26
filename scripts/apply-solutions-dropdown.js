const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const oldLink = '<a href="/solutions/">Products</a>';
const menu = '<div class="solutions-menu"><button class="solutions-trigger" type="button" aria-expanded="false" aria-haspopup="true">Products <span aria-hidden="true">▾</span></button><div class="solutions-dropdown"><a class="solutions-all" href="/solutions/">View All Solutions <span aria-hidden="true">→</span></a><a href="/solutions/selective-pallet-racks/">Selective Pallet Racks</a><a href="/solutions/drive-in-racks/">Drive-In Racks</a><a href="/solutions/pallet-shuttle-systems/">Pallet Shuttle Systems</a><a href="/solutions/mobile-pallet-racking/">Mobile Pallet Racking</a><a href="/solutions/push-back-racking/">Push-Back Racking</a><a href="/solutions/pallet-flow-racks/">Pallet Flow Racks</a><a href="/solutions/cantilever-rack/">Cantilever Racks</a><a href="/solutions/carton-flow-racks/">Carton Flow Racks</a><a href="/solutions/mezzanines/">Mezzanine Systems</a><a href="/solutions/shelving-systems/">Shelving Systems</a><a href="/solutions/automated-storage/">Automated Storage</a></div></div>';
let updated = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes(oldLink)) continue;
    html = html.replace(oldLink, menu);
    if (!html.includes('/assets/solutions-dropdown.js')) html = html.replace('</head>', '<script defer src="/assets/solutions-dropdown.js"></script></head>');
    fs.writeFileSync(file, html, 'utf8');
    updated += 1;
  }
}
walk(root);
console.log(JSON.stringify({ updated }));
