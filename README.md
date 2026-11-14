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

Vercel runs `node scripts/test-canonicals.cjs && node scripts/normalize-canonicals.cjs`
before each deployment. The static output remains the project root.

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
  correct self-referencing canonicals in source. Locally run the same command to normalize.
- Keep these build settings when adding pages. If migrating hosting, adding rewrites,
  changing the preferred domain, or intentionally canonicalizing one page to another,
  update the route policy and tests as part of that change.
- Sitemap maintenance is separate; keep its URLs aligned with these canonical URLs.
