'use strict';
const assert = require('node:assert/strict');
const {isImageRewrite} = require('./image-aliases.cjs');
const {APEX_REDIRECT, canonicalFor, normalize, normalizeSitemap, normalizeRobots, sameRedirect} = require('./normalize-canonicals.cjs');
assert.equal(canonicalFor('index.html'), 'https://www.zhengdarack.com/');
assert.equal(canonicalFor('new-product/index.html'), 'https://www.zhengdarack.com/new-product/');
assert.equal(canonicalFor('new-product.html'), 'https://www.zhengdarack.com/new-product/');
assert.equal(canonicalFor('projects/Example Project/index.html'), 'https://www.zhengdarack.com/projects/Example%20Project/');
for (const metadata of ['', '<link rel="canonical" href="https://wrong.example/">', "<LINK HREF='https://wrong.example/' REL='canonical'><link rel=canonical href=/wrong/>"]) {
  const source = '<!doctype html><html><head>' + metadata + '<title>Product</title></head><body>Product body</body></html>';
  const result = normalize(source, 'new-product/index.html');
  assert.equal((result.html.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(result.html.includes('<link rel="canonical" href="https://www.zhengdarack.com/new-product/">'));
  assert.ok(result.html.includes('<body>Product body</body>'));
  assert.equal(normalize(result.html, 'new-product/index.html').html, result.html);
}
const example = '<!-- <link rel="canonical" href="example"> --><script>const example = \'<link rel="canonical" href="example">\';</script>';
assert.ok(normalize('<html><head>'+example+'</head><body></body></html>', 'index.html').html.includes(example));
assert.equal(normalize('google-site-verification: google871c71f70cb3980f.html\n', 'google871c71f70cb3980f.html'), null);
assert.throws(() => normalize('<html><body>Missing head</body></html>', 'broken.html'));
const sitemap = normalizeSitemap('<?xml version="1.0"?><urlset><url><loc>https://zhengdarack.com/a/</loc></url><url><loc>https://www.zhengdarack.com/b/</loc></url></urlset>', 'sitemap.xml');
assert.ok(sitemap.xml.includes('<loc>https://www.zhengdarack.com/a/</loc>'));
assert.ok(sitemap.xml.includes('<loc>https://www.zhengdarack.com/b/</loc>'));
assert.equal(normalizeSitemap(sitemap.xml, 'sitemap.xml').xml, sitemap.xml);
assert.throws(() => normalizeSitemap('<urlset><url><loc>https://example.com/a/</loc></url></urlset>', 'sitemap.xml'));
assert.throws(() => normalizeSitemap('<urlset><url><loc>https://www.zhengdarack.com/a/</loc></url><url><loc>https://www.zhengdarack.com/a/</loc></url></urlset>', 'sitemap.xml'));
assert.equal(normalizeRobots('Sitemap: https://zhengdarack.com/sitemap.xml'), 'Sitemap: https://www.zhengdarack.com/sitemap.xml');
assert.ok(sameRedirect(APEX_REDIRECT));
assert.ok(!sameRedirect({...APEX_REDIRECT, permanent: false}));
assert.ok(isImageRewrite({source:'/images/homepage/heroImage.png',destination:'/images/homepage/heroImage.webp'}));
for (const rule of [
  {source:'/racking-guides/:path*',destination:'/index.html'},
  {source:'/images/:path*.jpg',destination:'/images/:path*.webp'},
  {source:'/images/../index.png',destination:'/images/../index.webp'},
  {source:'/images/a.jpg',destination:'https://example.com/a.webp'},
  {source:'/images/a.jpg',destination:'/images/b.webp'},
  {source:'/images/a.jpg',destination:'/images/a.webp',has:[]}
]) assert.ok(!isImageRewrite(rule), 'Non-image or non-exact rewrite must fail the SEO guard');
console.log('SEO guard tests passed: canonicals, sitemap origin and duplicates, robots sitemap origin, apex redirect, idempotence and invalid HTML.');

