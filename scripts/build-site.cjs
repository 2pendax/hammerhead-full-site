'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const {run: normalizeCanonicals} = require('./normalize-canonicals.cjs');
const {loadImageAliases} = require('./image-aliases.cjs');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const excluded = new Set(['dist', 'node_modules', 'scripts', 'tests', 'work', 'outputs']);
const publicTypes = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg',
  '.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.pdf']);
const privateFiles = new Set(['package.json', 'package-lock.json', 'vercel.json', 'CLONE_NOTES.txt']);

async function build() {
  const aliases = await loadImageAliases(root);
  await fs.rm(output, {recursive: true, force: true});
  let sourceBytes = 0, outputBytes = 0, optimized = 0, files = 0;
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, {withFileTypes: true})) {
      if (entry.name.startsWith('.') || excluded.has(entry.name) || entry.isSymbolicLink()) continue;
      const input = path.join(dir, entry.name);
      if (entry.isDirectory()) { await walk(input); continue; }
      if (privateFiles.has(entry.name) || !publicTypes.has(path.extname(entry.name).toLowerCase())) continue;
      const relative = path.relative(root, input);
      const original = await fs.readFile(input);
      sourceBytes += original.length;
      // Vercel serves the already-existing WebP at the original JPG/PNG URL.
      // The original remains in Git, but is not stored in every deployment.
      if (aliases.has(relative)) continue;
      const destination = path.join(output, relative);
      let data = original;
      // Preserve existing WebP/AVIF variants and every URL, including JPEG fallbacks.
      // Never upscale, crop, alter small icons, or replace an image with a larger file.
      if (/\.(jpe?g|png)$/i.test(entry.name) && original.length > 200 * 1024) {
        const metadata = await sharp(original).metadata();
        if ((metadata.pages || 1) === 1) {
          let pipeline = sharp(original).rotate().resize({width: 1920, height: 1920,
            fit: 'inside', withoutEnlargement: true});
          pipeline = metadata.format === 'jpeg'
            ? pipeline.jpeg({quality: 76, mozjpeg: true})
            : pipeline.png({compressionLevel: 9});
          const candidate = await pipeline.toBuffer();
          if (candidate.length < original.length) { data = candidate; optimized++; }
        }
      }
      await fs.mkdir(path.dirname(destination), {recursive: true});
      await fs.writeFile(destination, data);
      outputBytes += data.length;
      files++;
    }
  }
  await walk(root);
  // Run the existing SEO guard against generated output, never against source files.
  await fs.copyFile(path.join(root, 'vercel.json'), path.join(output, 'vercel.json'));
  normalizeCanonicals(output);
  await fs.unlink(path.join(output, 'vercel.json'));
  console.log(JSON.stringify({files, optimized, imageAliases: aliases.size, sourceBytes, outputBytes,
    reduction: ((1 - outputBytes / sourceBytes) * 100).toFixed(1) + '%'}));
}
build().catch(error => { console.error(error); process.exitCode = 1; });
