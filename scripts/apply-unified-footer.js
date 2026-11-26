const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const footer = '<footer class="site-footer"><div class="footer-cta"><div class="footer-cta-inner"><div><h2>Planning a warehouse racking project?</h2><p>Send your load details, building dimensions, handling method and destination for a clearer discussion.</p></div><a class="footer-quote-button" href="/quote/">Request a Quote →</a></div></div><div class="footer-main"><div class="footer-brand"><a class="footer-brand-name" href="/">zhengdarack</a><p>Original warehouse-racking buying guides and project-enquiry support for international buyers.</p><a class="footer-contact-link" href="tel:+8615069070069">☎ +86 150 6907 0069</a><a class="footer-contact-link" href="mailto:tomzh221@gmail.com">tomzh221@gmail.com</a><span class="footer-location">Jinan, Shandong, China</span></div><div class="footer-column"><h3>Solutions</h3><ul><li><a href="/solutions/selective-pallet-racks/">Selective Pallet Racks</a></li><li><a href="/solutions/drive-in-racks/">Drive-In Racks</a></li><li><a href="/solutions/pallet-shuttle-systems/">Pallet Shuttle Systems</a></li><li><a href="/solutions/mezzanines/">Mezzanine Systems</a></li><li><a href="/solutions/">View All Solutions →</a></li></ul></div><div class="footer-column"><h3>Guides & Resources</h3><ul><li><a href="/racking-guides/">Racking Buying Guides</a></li><li><a href="/articles/">Articles</a></li><li><a href="/resources/">Resources</a></li><li><a href="/calculator/">Capacity Calculator</a></li><li><a href="/projects/">Projects</a></li></ul></div><div class="footer-column footer-contact"><h3>Contact</h3><ul><li><a href="/contact/">Contact zhengdarack</a></li><li><a href="/quote/">Prepare a Project Brief</a></li><li><a href="/about/">About This Website</a></li></ul><p class="footer-contact-note">Based in Jinan, Shandong, China. For a useful first reply, include pallet or item dimensions, maximum loads, quantities, building information and delivery destination.</p></div></div><div class="footer-bottom"><span>© 2026 zhengdarack. Jinan, Shandong, China.</span><div class="footer-bottom-links"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/sitemap.xml">Sitemap</a></div></div></footer>';
const renderedFooter = footer.replace('<span class="footer-location">Jinan, Shandong, China</span>', '<address class="footer-location">4F, Building 6, China Railway Caizhi Center<br>Shunhua Subdistrict, Jinan High-tech Zone<br>Jinan, Shandong, China</address>');
let updated = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const original = fs.readFileSync(file, 'utf8');
    if (!/<footer[\s\S]*?<\/footer>/.test(original)) continue;
    let html = original.replace(/<footer[\s\S]*?<\/footer>/, renderedFooter);
    if (!html.includes('/assets/site-footer.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/assets/site-footer.css"></head>');
    if (html !== original) { fs.writeFileSync(file, html, 'utf8'); updated += 1; }
  }
}
walk(root);
console.log(JSON.stringify({ updated }));
