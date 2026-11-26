const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../contact/index.html');
let html = fs.readFileSync(file, 'utf8');
const url = 'https://wa.me/8615069070069?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20your%20warehouse%20racking%20solutions.';
const card = `<div class="card contact-whatsapp-card"><h3>WhatsApp</h3><a href="${url}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a><small>+86 150 6907 0069</small></div>`;

html = html.replace('<body>', '<body class="contact-page">');
html = html.replace('<div class="wrap content"><div class="grid">', '<div class="wrap content contact-content"><div class="grid contact-methods">');
if (!html.includes('contact-whatsapp-card')) {
  const guides = '<div class="card"><h3>Guides</h3><a href="/racking-guides/">Browse buying guides</a></div>';
  if (!html.includes(guides)) throw new Error('Contact card marker not found');
  html = html.replace(guides, card + guides);
}

fs.writeFileSync(file, html, 'utf8');
console.log(JSON.stringify({ updated: 1, methodCards: 4 }));
