# Static AI & Tech News Scraper

This repo branch contains a fully static frontend that aggregates RSS feeds client-side using a CORS proxy. No server is required — you can host the `public/` directory on GitHub Pages, Netlify, Vercel (static), or any static host.

How it works
- The frontend (public/index.html + public/app.js) fetches RSS/Atom feeds directly from configured sources using a CORS proxy, parses the XML in the browser, filters by your search terms, and displays results.
- A default public CORS proxy (https://api.allorigins.win/raw?url=) is set in `public/app.js`, but public proxies may be rate-limited or unreliable.

Important notes
- CORS: Many RSS endpoints do not set CORS headers. To fetch them from a browser you need a CORS proxy. Options:
  - Use the default: https://api.allorigins.win/raw?url= (no API key needed but may be rate-limited)
  - Run your own simple CORS proxy (small server) or use a serverless function.
  - Use a provider or your own server to host a proxy if you plan to run this in production.
- Hosting: GitHub Pages works well for hosting the static files. Once hosted, the browser will fetch feeds via the configured proxy.

How to use locally
- For local testing, serve the `public/` directory with a static server (e.g., `npx serve public` or `python -m http.server` from the `public/` folder) — opening index.html directly with the `file://` protocol will not allow fetch requests.

How to publish to GitHub Pages
1. Push this branch to GitHub (it's already on `add-news-scraper`).
2. In the repository settings -> Pages, set the source to the `add-news-scraper` branch and `/public` folder (or main branch and /public if you merge).
3. Save and wait a minute — your site will be available on the GitHub Pages URL.

Customization
- Replace the PROXY constant at the top of `public/app.js` with a different proxy URL if needed.
- Edit the FEEDS array in `public/app.js` to add/remove sources.
- If you prefer TypeScript, a sample `public/app.ts` can be added and compiled during a build step; this branch keeps the runtime purely static and dependency-free.

If you'd like, I can:
- Add a small GitHub Actions workflow to automatically build and publish the `public/` directory to GitHub Pages on push.
- Add a Dockerized CORS proxy or a serverless proxy function you can deploy for reliable scraping.
