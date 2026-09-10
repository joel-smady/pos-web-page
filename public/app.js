// Client-side aggregator that fetches RSS feeds via a CORS proxy and renders filtered results.
// This is plain JavaScript to keep the site fully static. If you prefer TypeScript, see public/app.ts

(function () {
  // Default CORS proxy. Replace with your own if needed.
  // Examples: https://api.allorigins.win/raw?url= OR https://cors.bridged.cc/
  const PROXY = 'https://api.allorigins.win/raw?url=';

  const FEEDS = [
    { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { id: 'theverge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { id: 'arstechnica', name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
    { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss' },
    { id: 'nytimes-tech', name: 'NYTimes Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' },
    { id: 'verge-ai', name: 'The Verge AI', url: 'https://www.theverge.com/ai/rss/index.xml' }
  ];

  function escapeHtml(s) { return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function formatDate(s) {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString();
  }

  function matches(text, terms) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return terms.some(t => lower.includes(t));
  }

  async function fetchFeed(feedUrl) {
    const url = PROXY + encodeURIComponent(feedUrl);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response not ok ' + res.status);
      const text = await res.text();
      return text;
    } catch (err) {
      console.warn('Failed to fetch', feedUrl, err);
      return null;
    }
  }

  function parseRss(xmlText, sourceName) {
    if (!xmlText) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    // handle both RSS <item> and Atom <entry>
    const items = Array.from(doc.querySelectorAll('item, entry')).map(node => {
      const titleNode = node.querySelector('title');
      const linkNode = node.querySelector('link');
      const guidNode = node.querySelector('guid');
      const pubNode = node.querySelector('pubDate') || node.querySelector('published') || node.querySelector('updated');
      const descNode = node.querySelector('description') || node.querySelector('summary') || node.querySelector('content');

      let link = '';
      if (linkNode) {
        // Atom link can be <link href="..." />
        const href = linkNode.getAttribute && linkNode.getAttribute('href');
        link = href || linkNode.textContent || '';
      }
      if (!link && guidNode) link = guidNode.textContent || '';

      return {
        title: titleNode ? titleNode.textContent || '' : '',
        link: link || '',
        pubDate: pubNode ? pubNode.textContent || '' : '',
        contentSnippet: descNode ? (descNode.textContent || '') : '',
        source: sourceName
      };
    });

    return items;
  }

  async function doSearch() {
    const q = (document.getElementById('q') && document.getElementById('q').value) || '';
    const terms = q.split(/\s+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    const checked = Array.from(document.querySelectorAll('#sources input:checked')).map(i => i.value);
    const selected = FEEDS.filter(f => checked.includes(f.id));
    const limit = 200;

    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '<p>Searching…</p>';

    // Fetch feeds in parallel but cap concurrency for reliability
    const concurrency = 4;
    const queue = selected.slice();
    const allItems = [];

    async function worker() {
      while (queue.length) {
        const f = queue.shift();
        if (!f) break;
        const xml = await fetchFeed(f.url);
        if (!xml) continue;
        const items = parseRss(xml, f.name);
        allItems.push(...items);
      }
    }

    const workers = Array.from({length: Math.min(concurrency, selected.length)}, worker);
    await Promise.all(workers);

    // Filter
    let filtered = allItems.filter(item => {
      if (terms.length === 0) return true;
      return matches(item.title, terms) || matches(item.contentSnippet, terms) || matches(item.source, terms);
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const da = a.pubDate ? Date.parse(a.pubDate) : 0;
      const db = b.pubDate ? Date.parse(b.pubDate) : 0;
      return (db || 0) - (da || 0);
    });

    filtered = filtered.slice(0, limit);

    if (!filtered.length) {
      resultsContainer.innerHTML = '<p>No results.</p>';
      return;
    }

    resultsContainer.innerHTML = filtered.map(it => {
      const date = it.pubDate ? formatDate(it.pubDate) : '';
      return `
        <div class="article">
          <h3><a href="${escapeHtml(it.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.title)}</a></h3>
          <p>${escapeHtml(it.contentSnippet || '')}</p>
          <div class="meta">${escapeHtml(it.source)} ${date ? '• ' + escapeHtml(date) : ''}</div>
        </div>
      `;
    }).join('\n');
  }

  // init UI
  (function init(){
    const container = document.getElementById('sources');
    if (container) {
      container.innerHTML = FEEDS.map(s=>`<label class="source-item"><input type="checkbox" value="${s.id}" checked /> ${escapeHtml(s.name)}</label>`).join(' ');
    }

    const searchBtn = document.getElementById('search');
    const qInput = document.getElementById('q');
    if (searchBtn) searchBtn.addEventListener('click', doSearch);
    if (qInput) qInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

    // prefill with common AI terms
    if (qInput) qInput.value = 'ai artificial intelligence machine learning';

    // show note about proxy availability
    const note = document.createElement('div');
    note.style.margin = '8px 0';
    note.style.fontSize = '0.9rem';
    note.style.color = '#6b7280';
    note.textContent = 'This is a static site that fetches RSS through a CORS proxy. If results fail to load, set PROXY to a working CORS proxy or deploy a small proxy.';
    const containerRoot = document.querySelector('.container');
    if (containerRoot) containerRoot.insertBefore(note, containerRoot.children[3]);

    // initial search
    doSearch();
  })();

})();
