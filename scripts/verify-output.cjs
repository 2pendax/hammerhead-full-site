'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const {normalize, normalizeSitemap, normalizeRobots} = require('./normalize-canonicals.cjs');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');

async function verify() {
  let pages = 0, images = 0, totalBytes = 0;
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, {withFileTypes: true})) {
      if (entry.name.startsWith('.') || ['dist', 'scripts', 'tests', 'node_modules'].includes(entry.name)) continue;
      const source = path.join(dir, entry.name);
      if (entry.isDirectory()) { await walk(source); continue; }
      const relative = path.relative(root, source);
      if (!/\.(html|css|js|xml|svg|jpe?g|png|webp|avif|gif|ico|woff2?|ttf|pdf)$/i.test(relative) && relative !== 'robots.txt') continue;
      const before = await fs.readFile(source);
      const after = await fs.readFile(path.join(output, relative));
      totalBytes += after.length;
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
        assert.equal(b.format, a.format, relative + ': format changed');
        assert.equal(b.hasAlpha, a.hasAlpha, relative + ': transparency changed');
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
  for (const name of ['.git', 'node_modules', 'scripts', 'package.json', 'package-lock.json', 'vercel.json', 'README.md', 'CLONE_NOTES.txt']) {
    await assert.rejects(fs.access(path.join(output, name)), name + ': private build file leaked');
  }
  assert.ok(totalBytes < 72 * 1024 * 1024, 'Deployment output exceeds the 72 MiB budget');
  console.log(JSON.stringify({pages, images, totalBytes, checks: 'content, URLs, formats, transparency, aspect ratios, image decoding, private files, size budget'}));
}
verify().catch(error => { console.error(error); process.exitCode = 1; });
