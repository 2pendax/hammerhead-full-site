'use strict';
const assert = require('node:assert/strict');
const {canonicalFor, normalize} = require('./normalize-canonicals.cjs');
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
console.log('Canonical guard tests passed: routes, encoding, missing/wrong/duplicate tags, preservation, idempotence, verification file, invalid HTML.');

