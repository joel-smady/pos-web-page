(function(){
  async function init(){
    const sourcesResp = await fetch('/api/sources');
    const sources = await sourcesResp.json();
    const container = document.getElementById('sources');
    if(container){
      container.innerHTML = sources.map(s=>`<label class="source-item"><input type="checkbox" value="${s.id}" checked /> ${s.name}</label>`).join(' ');
    }

    document.getElementById('search')!.addEventListener('click', doSearch);
    document.getElementById('q')!.addEventListener('keydown', (e)=>{ if((e as KeyboardEvent).key==='Enter') doSearch(); });
    // run an initial search for AI news
    (document.getElementById('q') as HTMLInputElement).value = 'ai OR artificial intelligence OR machine learning';
    doSearch();
  }

  async function doSearch(){
    const q = (document.getElementById('q') as HTMLInputElement).value || '';
    const checked = Array.from(document.querySelectorAll('#sources input:checked')).map((i:any)=>i.value);
    const params = new URLSearchParams();
    params.set('q', q);
    if(checked.length) params.set('sources', checked.join(','));
    params.set('limit','50');

    const res = await fetch('/api/search?'+params.toString());
    const data = await res.json();
    renderResults(data.items || []);
  }

  function renderResults(items){
    const el = document.getElementById('results');
    if(!el) return;
    if(!items.length){ el.innerHTML = '<p>No results.</p>'; return; }
    el.innerHTML = items.map(it=>{
      const date = it.pubDate ? new Date(it.pubDate).toLocaleString() : '';
      return `
        <div class="article">
          <h3><a href="${it.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.title)}</a></h3>
          <p>${escapeHtml(it.contentSnippet || '')}</p>
          <div class="meta">${it.source} ${date ? '• ' + date : ''}</div>
        </div>
      `;
    }).join('\n');
  }

  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  init();
})();
