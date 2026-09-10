export interface FeedSource {
  id: string;
  name: string;
  url: string;
}

export const feeds: FeedSource[] = [
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { id: 'theverge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { id: 'arstechnica', name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { id: 'nytimes-tech', name: 'NYTimes Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' },
  { id: 'verge-ai', name: 'The Verge AI', url: 'https://www.theverge.com/ai/rss/index.xml' }
];
