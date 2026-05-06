# zhengdarack Static Frontend Mirror

Source: https://www.hammerheadllc.com/

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
