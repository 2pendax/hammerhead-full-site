# zheng Static Frontend 



This directory is a local static mirror of the current `www` site frontend.

- Pages fetched: 87 attempted, 80 `index.html` pages written locally
- Image/assets files: 328
- Size: about 203 MB
- Removed/replaced matched third-party analytics and HubSpot embed scripts with static form markup where possible
- The Leaflet map section is still frontend-only, but it loads its map library/tiles from external CDNs when viewed online

Run locally from this directory:

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

Run `npm ci`, `npm run build`, then `npm test`. Preview locally with
`python3 -m http.server 4173 --directory dist`.

The build resizes JPEG/PNG files over 200 KiB to fit within 1920 × 1920 pixels,
without cropping or enlarging, and encodes JPEGs at quality 76. It retains the
original when encoding would increase its size. Existing WebP/AVIF responsive
variants, small icons, image URLs, and source originals are preserved.

Only public website assets are copied into `dist/`; Git metadata, scripts, package
files, clone notes, and dependencies are excluded. Add any new public file type
to the build allowlist before deploying it. The verification checks all pages and
images, preserves SEO normalization, and enforces a 72 MiB deployment budget
(allowing modest growth beyond the approximately 64 MiB optimized baseline).

Vercel deployment retention is configured separately in the project dashboard:
production and pre-production history are retained for one week (previously
30 days). Vercel's current-production and recent-deployment exceptions still
apply. Historical recorded Usage does not reset immediately after optimization.
