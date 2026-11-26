const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const dropdown = '<div class="solutions-menu"><button class="solutions-trigger" type="button" aria-expanded="false" aria-haspopup="true">Products <span aria-hidden="true">▾</span></button><div class="solutions-dropdown"><a class="solutions-all" href="/solutions/">View All Solutions <span aria-hidden="true">→</span></a><a href="/solutions/selective-pallet-racks/">Selective Pallet Racks</a><a href="/solutions/drive-in-racks/">Drive-In Racks</a><a href="/solutions/pallet-shuttle-systems/">Pallet Shuttle Systems</a><a href="/solutions/mobile-pallet-racking/">Mobile Pallet Racking</a><a href="/solutions/push-back-racking/">Push-Back Racking</a><a href="/solutions/pallet-flow-racks/">Pallet Flow Racks</a><a href="/solutions/cantilever-rack/">Cantilever Racks</a><a href="/solutions/carton-flow-racks/">Carton Flow Racks</a><a href="/solutions/mezzanines/">Mezzanine Systems</a><a href="/solutions/shelving-systems/">Shelving Systems</a><a href="/solutions/automated-storage/">Automated Storage</a></div></div>';
const header = `<header class="site-header"><div class="global-nav"><a class="brand" href="/" aria-label="zhengdarack home">zhengdarack</a><nav aria-label="Primary navigation"><a href="/racking-guides/">Buying Guides</a>${dropdown}<a href="/about/">About</a><a href="/contact/">Contact</a></nav><a class="nav-phone" href="tel:+8615069070069" aria-label="Call zhengdarack at +86 150 6907 0069"><span aria-hidden="true">&#9742;</span><span class="nav-phone-full">+86 150 6907 0069</span><span class="nav-phone-short">Call Now</span></a></div></header>`;
let updated = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (!/<header[\s\S]*?<\/header>/.test(html)) continue;
    const next = html.replace(/<header[\s\S]*?<\/header>/, header);
    html = next.includes('/assets/solutions-dropdown.js') ? next : next.replace('</head>', '<script defer src="/assets/solutions-dropdown.js"></script></head>');
    if (html !== fs.readFileSync(file, 'utf8')) { fs.writeFileSync(file, html, 'utf8'); updated += 1; }
  }
}
walk(root);
console.log(JSON.stringify({ updated }));
