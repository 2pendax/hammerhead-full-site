'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const {normalize, normalizeSitemap, normalizeRobots} = require('./normalize-canonicals.cjs');
const {loadImageAliases} = require('./image-aliases.cjs');
const {loadReferencedImages} = require('./referenced-images.cjs');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const privateFiles = new Set(['package.json', 'package-lock.json', 'vercel.json', 'CLONE_NOTES.txt']);

async function verify() {
  const aliases = await loadImageAliases(root);
  const referencedImages = await loadReferencedImages(root);
  const requiredImages = new Set(referencedImages);
  for (const image of referencedImages) if (aliases.has(image)) requiredImages.add(aliases.get(image));
  const counted = new Set();
  let pages = 0, images = 0, totalBytes = 0;
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, {withFileTypes: true})) {
      if (entry.name.startsWith('.') || ['dist', 'scripts', 'tests', 'node_modules', 'work', 'outputs'].includes(entry.name)) continue;
      const source = path.join(dir, entry.name);
      if (entry.isDirectory()) { await walk(source); continue; }
      const relative = path.relative(root, source);
      if (privateFiles.has(entry.name) || !/\.(html|css|js|json|txt|xml|svg|jpe?g|png|webp|avif|gif|ico|woff2?|ttf|pdf)$/i.test(relative)) continue;
      const before = await fs.readFile(source);
      const target = aliases.get(relative) || relative;
      if (/^images[\\/]/i.test(relative) && /\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(relative) && !requiredImages.has(relative)) {
        await assert.rejects(fs.access(path.join(output, relative)), relative + ': unreferenced image was deployed');
        continue;
      }
      if (aliases.has(relative)) await assert.rejects(fs.access(path.join(output, relative)), relative + ': duplicate image was deployed');
      const after = await fs.readFile(path.join(output, target));
      if (!counted.has(target)) { totalBytes += after.length; counted.add(target); }
      if (/\.html$/i.test(relative)) {
        const normalized = normalize(before.toString(), relative);
        assert.equal(after.toString(), normalized?.html ?? before.toString(), relative + ': page content changed');
        pages++;
      } else if (/^sitemap.*\.xml$/i.test(relative)) {
        assert.equal(after.toString(), normalizeSitemap(before.toString(), relative).xml);
      } else if (relative === 'robots.txt') {
        assert.equal(after.toString(), normalizeRobots(before.toString()));
      } else if (/\.(jpe?g|png|webp|avif)$/i.test(relative)) {
        const a = await sharp(before).metadata(), b = await sharp(after).metadata();
        assert.equal(b.format, aliases.has(relative) ? 'webp' : a.format, relative + ': unexpected format');
        if (b.hasAlpha !== a.hasAlpha) {
          assert.ok(aliases.has(relative) && (await sharp(before).stats()).isOpaque &&
            (await sharp(after).stats()).isOpaque, relative + ': transparency changed');
        }
        assert.ok(after.length <= before.length, relative + ': grew in size');
        const rotated = [5, 6, 7, 8].includes(a.orientation);
        const ratio = rotated ? a.height / a.width : a.width / a.height;
        assert.ok(Math.abs(b.width / b.height - ratio) < 0.01, relative + ': aspect ratio changed');
        await sharp(after).stats();
        images++;
      } else {
        assert.ok(after.equals(before), relative + ': static asset changed');
      }
    }
  }
  await walk(root);
  for (const [source, destination] of aliases) {
    await assert.rejects(fs.access(path.join(output, source)), source + ': duplicate image was deployed');
    if (requiredImages.has(destination)) await fs.access(path.join(output, destination));
  }
  for (const name of ['.git', 'node_modules', 'scripts', 'work', 'outputs', 'package.json', 'package-lock.json', 'vercel.json', 'README.md', 'CLONE_NOTES.txt']) {
    await assert.rejects(fs.access(path.join(output, name)), name + ': private build file leaked');
  }
  assert.ok(totalBytes < 40 * 1024 * 1024, 'Deployment output exceeds the 40 MiB budget');
  console.log(JSON.stringify({pages, images, imageAliases: aliases.size, referencedImages: referencedImages.size, totalBytes, checks: 'content, URLs, referenced assets, aliases, image hashes, formats, transparency, aspect ratios, image decoding, private files, size budget'}));
}
verify().catch(error => { console.error(error); process.exitCode = 1; });
