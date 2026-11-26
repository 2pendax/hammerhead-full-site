const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { chromium } = require('C:/Users/AB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = http.createServer((request, response) => {
  let pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  let file = path.join(root, pathname.replace(/^\/+/, ''));
  if (pathname.endsWith('/')) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});

(async () => {
  await new Promise(resolve => server.listen(4178, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const results = [];
  for (const item of [
    { name: 'home-desktop', url: '/', width: 1440, height: 1100 },
    { name: 'guide-desktop', url: '/racking-guides/heavy-duty-pallet-racking/', width: 1440, height: 1300 },
    { name: 'catalog-desktop', url: '/racking-guides/', width: 1440, height: 1100 },
    { name: 'home-mobile', url: '/', width: 390, height: 1000 },
    { name: 'guide-mobile', url: '/racking-guides/heavy-duty-pallet-racking/', width: 390, height: 1200 }
    ,{ name: 'catalog-mobile', url: '/racking-guides/', width: 390, height: 1000 }
  ]) {
    const page = await browser.newPage({ viewport: { width: item.width, height: item.height }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:4178${item.url}`, { waitUntil: 'networkidle' });
    const output = path.join(os.tmpdir(), `${item.name}.png`);
    await page.screenshot({ path: output, fullPage: true });
    results.push({ name: item.name, output, brokenImages: await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).length), horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth) });
    await page.close();
  }
  await browser.close();
  server.close();
  console.log(JSON.stringify(results));
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
