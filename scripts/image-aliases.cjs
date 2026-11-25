'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {createHash} = require('node:crypto');

// Exact image paths only: these rules must never change a page or SEO route.
function isImageRewrite(rule) {
  return rule && Object.keys(rule).sort().join(',') === 'destination,source' &&
    /^\/images\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:jpe?g|png)$/i.test(rule.source) &&
    rule.destination === rule.source.replace(/\.(?:jpe?g|png)$/i, '.webp');
}

async function loadImageAliases(root) {
  const config = JSON.parse(await fs.readFile(path.join(root, 'vercel.json'), 'utf8'));
  const entries = JSON.parse(await fs.readFile(path.join(root, 'scripts/image-aliases.json'), 'utf8'));
  const rules = config.rewrites || [];
  assert.equal(rules.length, entries.length, 'Image aliases and Vercel rewrites must stay in sync');
  const aliases = new Map();
  for (const entry of entries) {
    const {source, destination} = entry;
    assert.ok(isImageRewrite({source, destination}), 'Unsafe image alias: ' + source);
    assert.ok(!aliases.has(source.slice(1)), 'Duplicate image alias: ' + source);
    assert.ok(rules.some(rule => isImageRewrite(rule) && rule.source === source && rule.destination === destination),
      'Missing exact image rewrite: ' + source);
    const bytes = await fs.readFile(path.join(root, destination.slice(1)));
    const hash = createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash, entry.destinationSha256, destination + ': reviewed WebP changed');
    aliases.set(source.slice(1), destination.slice(1));
  }
  return aliases;
}

module.exports = {isImageRewrite, loadImageAliases};
