const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const stylesheet = '<link rel="stylesheet" href="/assets/sticky-nav.css">';
let updated = 0;

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    const html = fs.readFileSync(fullPath, 'utf8');
    if (!html.includes('<header') || html.includes('/assets/sticky-nav.css')) continue;
    if (!html.includes('</head>')) throw new Error(`Missing </head>: ${fullPath}`);

    fs.writeFileSync(fullPath, html.replace('</head>', `${stylesheet}</head>`));
    updated += 1;
  }
}

visit(root);
console.log(JSON.stringify({ updated }));
