import express from 'express';
import cors from 'cors';
import RSSParser from 'rss-parser';
import { feeds } from './rssFeeds';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.static('public'));

const parser = new RSSParser();

type NewsItem = {
  title: string;
  link: string;
  pubDate?: string;
  isoDate?: string | null;
  contentSnippet?: string;
  source: string;
};

function matchesQuery(text: string | undefined, terms: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return terms.some(t => lower.includes(t));
}

app.get('/api/sources', (_req, res) => {
  res.json(feeds.map(f => ({ id: f.id, name: f.name, url: f.url })));
});

app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q as string) || 'ai technology';
    const sources = (req.query.sources as string) ? (req.query.sources as string).split(',') : feeds.map(f => f.id);
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const terms = q
      .split(/\s+/)
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => t.toLowerCase());

    const selectedFeeds = feeds.filter(f => sources.includes(f.id));

    // Fetch all feeds in parallel
    const feedPromises = selectedFeeds.map(async f => {
      try {
        const feed = await parser.parseURL(f.url);
        const items: NewsItem[] = (feed.items || [])
          .map(i => ({
            title: i.title || '',
            link: i.link || i.guid || '',
            pubDate: i.pubDate,
            isoDate: i.isoDate || null,
            contentSnippet: (i.contentSnippet || i.content || '').slice(0, 1000),
            source: f.name
          }))
          .filter(item => {
            // if no query terms, include everything
            if (terms.length === 0) return true;
            return (
              matchesQuery(item.title, terms) ||
              matchesQuery(item.contentSnippet, terms) ||
              matchesQuery(item.source, terms)
            );
          });
        return items;
      } catch (err) {
        console.warn('Failed to fetch', f.url, err);
        return [] as NewsItem[];
      }
    });

    const resultsArrays = await Promise.all(feedPromises);
    let all = resultsArrays.flat();

    // sort by date if available
    all = all.sort((a, b) => {
      const da = a.isoDate ? new Date(a.isoDate).getTime() : a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.isoDate ? new Date(b.isoDate).getTime() : b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });

    all = all.slice(0, limit);

    res.json({ query: q, count: all.length, items: all });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

app.listen(port, () => {
  console.log(`News scraper listening at http://localhost:${port}`);
});
