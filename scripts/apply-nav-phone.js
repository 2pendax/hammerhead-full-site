const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const phoneLink = '<a class="nav-phone" href="tel:+8615069070069" aria-label="Call zhengdarack at +86 150 6907 0069"><span aria-hidden="true">&#9742;</span><span class="nav-phone-full">+86 150 6907 0069</span><span class="nav-phone-short">Call Now</span></a>';
let updated = 0;

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(fullPath);
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;

    const source = fs.readFileSync(fullPath, 'utf8');
    if (!source.includes('<header') || source.includes('class="nav-phone"')) continue;
    const headerEnd = source.indexOf('</header>');
    if (headerEnd === -1) continue;
    const navEnd = source.lastIndexOf('</nav>', headerEnd);
    if (navEnd === -1) continue;

    const output = source.slice(0, navEnd) + phoneLink + source.slice(navEnd);
    fs.writeFileSync(fullPath, output, 'utf8');
    updated += 1;
  }
}

visit(root);
console.log(JSON.stringify({ updated }));
