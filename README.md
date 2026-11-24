# zheng Static Frontend 



This directory is a local static mirror of the current `www` site frontend.

- Pages fetched: 87 attempted, 80 `index.html` pages written locally
- Image/assets files: 328
- Size: about 203 MB
- Removed/replaced matched third-party analytics and HubSpot embed scripts with static form markup where possible
- The Leaflet map section is still frontend-only, but it loads its map library/tiles from external CDNs when viewed online

To preview source pages locally (before production image compression):

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

One non-real template link from the source, `/${n}`, returned 404 during crawl. No image asset downloads failed.

## Automatic canonical protection

Vercel runs `npm ci` and `npm run build` before each deployment. Only the generated
`dist/` directory is deployed; source images remain unchanged in Git.

- Production canonical origin is fixed to https://www.zhengdarack.com, including preview builds.
- `index.html` maps to `/`; `products/example/index.html` and `products/example.html`
  map to `/products/example/` under the current clean URL / trailing-slash routing.
- Every HTML page gets exactly one canonical in its head. Missing, duplicate,
  wrong-domain and wrong-path canonicals are repaired automatically in build output.
- Google verification text files remain unchanged. Comments and raw-text script/style
  content are not treated as link metadata.
- Malformed pages without explicit head tags, duplicate routes and incompatible
  routing configuration fail the build, preventing that deployment from replacing production.
- This changes deployment output, not GitHub source files. Authors should still write
  correct self-referencing canonicals in source. Run `npm run build` locally to generate output.
- Keep these build settings when adding pages. If migrating hosting, adding rewrites,
  changing the preferred domain, or intentionally canonicalizing one page to another,
  update the route policy and tests as part of that change.
- Every root `sitemap*.xml` file and `robots.txt` sitemap reference is normalized to the preferred `www` origin during the build. Foreign hosts, empty sitemaps and duplicate sitemap URLs fail the deployment.
- Vercel permanently redirects every request for `zhengdarack.com` to the same path on `www.zhengdarack.com`.


## Deployment size

Run `npm ci`, `npm run build`, then `npm test`. Preview the production routing
with `npx vercel dev`; a plain static server does not apply the image aliases.

The build resizes JPEG/PNG files over 200 KiB to fit within 1920 × 1920 pixels,
without cropping or enlarging, and encodes JPEGs at quality 76. It retains the
original when encoding would increase its size. Existing WebP/AVIF responsive
variants, small icons, image URLs, and source originals are preserved.

69 reviewed JPG/PNG URLs reuse an existing matching WebP through exact Vercel
rewrites. The original files stay in Git; only the redundant deployed copies are
omitted. This reduces the current output from 57.48 MB to 36.33 MB (36.8%) without
re-encoding those WebP files. Rewrites preserve the requested URL and serve the
destination's `image/webp` content type. No HTML, canonical, or sitemap route is
rewritten. Modern browsers support WebP; legacy browsers without WebP support
will not be able to display these aliased images.

`scripts/image-aliases.json` pins both source and destination hashes so replacing
either image cannot silently serve an outdated or unrelated variant. When editing
one of these images, review both versions and update the hashes, or remove the
entry **and** its matching `vercel.json` rewrite to restore the original URL/file.
New images are deployed normally until explicitly reviewed for aliasing.

Only public website assets are copied into `dist/`; Git metadata, scripts, package
files, clone notes, and dependencies are excluded. Add any new public file type
to the build allowlist before deploying it. The verification checks all pages and
images, verifies every alias and its source hashes, preserves SEO normalization,
and enforces a 40 MiB deployment budget. Scratch work and output folders are
excluded from deployment along with development files.

Publish a new guide, its directory link, and its sitemap entries in one commit
and one push. Each separate push can retain another full deployment. Avoid
repeated empty commits or redeploys while a Vercel rate limit is active.

Vercel deployment retention is configured separately in the project dashboard:
production and pre-production history are retained for one week (previously
30 days). Vercel's current-production and recent-deployment exceptions still
apply. Historical recorded Usage does not reset immediately after optimization.
