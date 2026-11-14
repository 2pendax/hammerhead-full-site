#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ORIGIN = 'https://www.zhengdarack.com';
const SKIP = new Set(['node_modules', 'scripts', 'tests']);

function canonicalFor(file) {
  const route = file.replace(/\\/g, '/').replace(/(?:^|\/)index\.html$/i, '/').replace(/\.html$/i, '/');
  return ORIGIN + '/' + route.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/');
}

function attr(tag, name) {
  const re = /([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const m of tag.matchAll(re)) {
    if (m[1].toLowerCase() === name) return m[2] ?? m[3] ?? m[4] ?? '';
  }
  return '';
}

function normalize(html, file) {
  // Google's downloaded verification file is text, not a webpage.
  if (/^google[\da-f]+\.html$/i.test(file) && /^google-site-verification: google[\da-f]+\.html\s*$/i.test(html)) return null;
  let opens = 0, closes = 0;
  const canonical = canonicalFor(file);
  // Skip comments and raw-text contents so examples/scripts cannot be mistaken for metadata.
  const tokens = /<!--[\s\S]*?-->|<(script|style|textarea|title)\b[^>]*>[\s\S]*?<\/\1\s*>|<\/?head\b[^>]*>\s*|<link\b(?:"[^"]*"|'[^']*'|[^'">])*>\s*/gi;
  const output = html.replace(tokens, (tag) => {
    if (/^<head\b/i.test(tag)) {
      opens++;
      return tag.trimEnd() + '\n<link rel="canonical" href="' + canonical + '">\n';
    }
    if (/^<\/head\b/i.test(tag)) { closes++; return tag; }
    if (/^<link\b/i.test(tag) && attr(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical')) return '';
    return tag;
  });
  if (opens !== 1 || closes !== 1) throw new Error(file + ': expected exactly one explicit <head> and </head>');
  return {canonical, html: output};
}

function run(root) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  if (config.cleanUrls !== true || config.trailingSlash !== true || config.rewrites?.length) {
    throw new Error('Canonical route mapping requires cleanUrls=true, trailingSlash=true and no rewrites. Update the route mapper before changing routing.');
  }
  const edits = [], seen = new Set();
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (entry.name.startsWith('.') || SKIP.has(entry.name) || entry.isSymbolicLink()) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.html$/i.test(entry.name)) {
        const file = path.relative(root, full).split(path.sep).join('/');
        const before = fs.readFileSync(full, 'utf8'), result = normalize(before, file);
        if (!result) continue;
        if (seen.has(result.canonical)) throw new Error('Two files map to the same URL: ' + result.canonical);
        seen.add(result.canonical);
        edits.push({full, before, after: result.html});
      }
    }
  }
  walk(root);
  if (!edits.length) throw new Error('No HTML pages found; refusing an empty build');
  for (const edit of edits) if (edit.before !== edit.after) fs.writeFileSync(edit.full, edit.after);
  console.log('Canonical guard: ' + edits.length + ' pages checked; ' + edits.filter(e => e.before !== e.after).length + ' updated; origin=' + ORIGIN);
}

if (require.main === module) run(path.resolve(__dirname, '..'));
module.exports = {canonicalFor, normalize, run};

