# AI & Tech News Scraper

This adds a simple server-side RSS aggregator and a small frontend to search aggregated technology and AI news.

What I added
- TypeScript Express server (src/server.ts) that fetches and parses RSS feeds and exposes /api/search and /api/sources
- A list of RSS feed sources (src/rssFeeds.ts)
- Basic frontend in public/ (index.html, styles.css, app.js)
- package.json and tsconfig.json with build/dev scripts

How to run

1. Install dependencies:

   npm install

2. Run in development (requires ts-node-dev):

   npm run dev

   The server will run on http://localhost:3000 and the frontend will be served from there.

3. Or build and run:

   npm run build
   npm start

Notes & next steps
- This server aggregates public RSS feeds and filters by keywords; it avoids direct cross-origin scraping in the browser by doing server-side fetches.
- For production use, consider caching feed responses, respecting rate limits, adding error handling, and honoring site terms of service.
- If you want to use full-text scraping beyond RSS, add targeted scrapers per domain (cheerio) and cache responses.
