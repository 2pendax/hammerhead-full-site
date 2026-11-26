const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/AB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const source = 'D:/货架外贸网站/2026_11_25_18_36_31_IMG_0266.JPG';
const output = path.resolve(__dirname, '../images/contact/zhengdarack-whatsapp-qr.png');

fs.mkdirSync(path.dirname(output), { recursive: true });

sharp(source)
  .extract({ left: 285, top: 930, width: 555, height: 555 })
  .resize({ width: 600, height: 600, fit: 'fill', kernel: sharp.kernel.nearest })
  .png({ compressionLevel: 9, palette: false })
  .toFile(output)
  .then(() => console.log(JSON.stringify({ output, width: 600, height: 600 })))
  .catch(error => { console.error(error); process.exitCode = 1; });
