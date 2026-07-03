# Marco Soto — Portfolio / CV

Personal CV-style portfolio focused on DevOps & Infrastructure. Static site
(HTML/CSS/JS, no build step) served by nginx, self-hosted on a Kubernetes home
lab behind Cloudflare DNS.

## Project map

```
portfolio/
├── index.html            # Single-page CV: Profile, Education, Experience, Skills, Projects
├── css/
│   └── styles.css        # All styles (dark terminal theme, JetBrains Mono)
├── js/
│   └── main.js           # Tab navigation, copy buttons, reveal animations
├── assets/
│   ├── cv/               # CV in PDF (marco-soto-cv.pdf) — linked by the Download CV button
│   └── img/              # Diagrams and screenshots (home lab architecture, etc.)
├── favicon/              # Favicons and web manifest
├── Dockerfile            # Bakes the static site into nginx:alpine
├── .dockerignore
├── .gitignore
└── README.md
```

## Run locally

No build step — open the file or serve the folder:

```bash
# Quick preview
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

### Option A — Docker image (recommended, reproducible)

```bash
docker build -t marco-portfolio .
docker run -d -p 8081:80 --name portfolio marco-portfolio
```

### Option B — Volume mount (edit files without rebuilding)

```bash
docker run -d -p 8081:80 \
  -v "$(pwd)":/usr/share/nginx/html:ro \
  --name portfolio nginx:alpine
```

## Updating styles / scripts

When you change `css/styles.css` or `js/main.js`:

1. Make sure the **new file actually reaches the server** (rebuild the image, or
   confirm the mounted volume has the updated file). A common gotcha is the HTML
   updating but the CSS staying on an old version.
2. Bump the cache-busting version in `index.html` so browsers and the Cloudflare
   edge fetch the fresh file:

   ```html
   <link rel="stylesheet" href="css/styles.css?v=2" />
   ```

   Change `v=2` → `v=3` on each deploy.

3. If it's served through Cloudflare and still looks stale, purge the cache for
   the CSS/JS URLs (Cloudflare dashboard → Caching → Purge).

## Notes

- Icons: [Lucide](https://lucide.dev) (loaded via CDN, rendered by `main.js`).
- Font: JetBrains Mono (Google Fonts).
- Theme tokens live at the top of `styles.css` under `:root`.
