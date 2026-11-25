'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');

const excluded = new Set(['dist', 'node_modules', 'scripts', 'tests', 'work', 'outputs']);
const textTypes = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg']);

function addUrl(set, value) {
  if (!value) return;
  for (const part of value.split(',')) {
    const raw = part.trim().split(/\s+/)[0].replace(/^['"]|['"]$/g, '');
    if (!raw.startsWith('/images/')) continue;
    try {
      set.add(decodeURIComponent(raw.split(/[?#]/)[0]).slice(1).replaceAll('/', path.sep));
    } catch {}
  }
}

async function loadReferencedImages(root) {
  const images = new Set();
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || excluded.has(entry.name) || entry.isSymbolicLink()) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { await walk(file); continue; }
      if (!textTypes.has(path.extname(entry.name).toLowerCase())) continue;
      const text = await fs.readFile(file, 'utf8');
      for (const match of text.matchAll(/(?:src|href|content|srcset)=["']([^"']+)["']/gi)) addUrl(images, match[1]);
      for (const match of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) addUrl(images, match[1]);
      for (const match of text.matchAll(/["'](\/images\/[^"']+)["']/gi)) addUrl(images, match[1]);
    }
  }
  await walk(root);
  return images;
}

module.exports = { loadReferencedImages };
