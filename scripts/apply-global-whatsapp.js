const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const chatUrl = 'https://wa.me/8615069070069?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20your%20warehouse%20racking%20solutions.';
const icon = '<span class="whatsapp-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16.1 3a12.8 12.8 0 0 0-11 19.3L3.3 29l6.9-1.8A12.9 12.9 0 1 0 16.1 3Zm0 23.5c-2.1 0-4.1-.6-5.8-1.6l-.4-.2-4.1 1.1 1.1-4-.3-.4a10.6 10.6 0 1 1 9.5 5.1Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.4-3.8c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.3 1.4 3.5a12 12 0 0 0 4.6 4.1c1.7.7 2.4.8 3.3.7 1-.1 1.9-.8 2.2-1.5s.3-1.3.2-1.5-.3-.1-.6-.2Z"/></svg></span>';
const widget = `<aside class="whatsapp-contact" aria-label="WhatsApp contact"><div class="whatsapp-card"><strong>Chat with zhengdarack</strong><span>Scan with WhatsApp</span><img src="/images/contact/zhengdarack-whatsapp-qr.png" width="600" height="600" loading="lazy" decoding="async" alt="WhatsApp QR code for zhengdarack"><small>+86 150 6907 0069</small><a class="whatsapp-card-link" href="${chatUrl}" target="_blank" rel="noopener noreferrer">Start WhatsApp Chat</a></div><a class="whatsapp-float" href="${chatUrl}" target="_blank" rel="noopener noreferrer" aria-label="Chat with zhengdarack on WhatsApp">${icon}<span>WhatsApp</span></a></aside>`;
const stylesheet = '<link rel="stylesheet" href="/assets/whatsapp-contact.css">';
const footerLink = `<a class="footer-contact-link footer-whatsapp-link" href="${chatUrl}" target="_blank" rel="noopener noreferrer">WhatsApp: +86 150 6907 0069</a>`;

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['.git', 'dist', 'node_modules'].includes(entry.name)) return files(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

let updated = 0;
for (const file of files(root)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('</body>')) continue;
  html = html.replace(/<aside class="whatsapp-contact"[\s\S]*?<\/aside>/, '');
  if (!html.includes('/assets/whatsapp-contact.css')) html = html.replace('</head>', `${stylesheet}</head>`);
  if (html.includes('class="site-footer"') && !html.includes('footer-whatsapp-link')) {
    const email = /(<a class="footer-contact-link" href="mailto:[^>]+>[^<]+<\/a>)/;
    html = html.replace(email, `$1${footerLink}`);
  }
  html = html.replace('</body>', `${widget}</body>`);
  fs.writeFileSync(file, html, 'utf8');
  updated++;
}

console.log(JSON.stringify({ updated, phone: '+8615069070069' }));
