/**
 * Buff Report — RSS Proxy (Cloudflare Worker)
 * ─────────────────────────────────────────────
 * Free serverless proxy that fetches Google News RSS and returns clean JSON.
 * No API key needed. No rate limits on Cloudflare free tier (100k req/day).
 *
 * DEPLOY INSTRUCTIONS:
 * 1. Go to https://workers.cloudflare.com and create a free account
 * 2. Click "Create Worker"
 * 3. Paste this entire file into the editor
 * 4. Click "Save and Deploy"
 * 5. Copy your worker URL (e.g. https://rss-proxy.YOUR-NAME.workers.dev)
 * 6. In index.html, replace PROXY_URL with your worker URL (see bottom of file)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const count = parseInt(url.searchParams.get('count') || '15');
    const rssUrl = url.searchParams.get('url'); // allow raw RSS URL passthrough

    if (!query && !rssUrl) {
      return new Response(JSON.stringify({ error: 'Missing ?q= or ?url= parameter' }), {
        status: 400, headers: CORS_HEADERS
      });
    }

    // Build the RSS URL
    const feedUrl = rssUrl
      ? rssUrl
      : `https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US:en&q=${encodeURIComponent(query)}`;

    let xml;
    try {
      const resp = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BuffReport/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      if (!resp.ok) throw new Error(`Upstream returned ${resp.status}`);
      xml = await resp.text();
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502, headers: CORS_HEADERS
      });
    }

    // Parse RSS XML into JSON items
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < count) {
      const block = match[1];
      const get = (tag) => {
        const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
        return m ? (m[1] || m[2] || '').trim() : '';
      };
      const title   = get('title');
      const link    = get('link') || block.match(/<link[^>]*>(.*?)<\/link>/)?.[1]?.trim() || '';
      const pubDate = get('pubDate');
      const source  = block.match(/<source[^>]*>([^<]*)<\/source>/)?.[1]?.trim() || '';
      if (title) items.push({ title, link, pubDate, author: source });
    }

    return new Response(JSON.stringify({ status: 'ok', items }), {
      headers: { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=300' }
    });
  }
};

/**
 * USAGE IN index.html — after deploying, update the fetch calls:
 *
 * const PROXY = 'https://rss-proxy.YOUR-NAME.workers.dev';
 *
 * Replace:
 *   fetchRSS(GN('Colorado Buffs football ...'))
 * With:
 *   fetchViaProxy(PROXY, 'Colorado Buffs football ...')
 *
 * Add this helper function to index.html JS:
 *
 * async function fetchViaProxy(proxyBase, query, count = 15) {
 *   const url = `${proxyBase}?q=${encodeURIComponent(query)}&count=${count}`;
 *   try {
 *     const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
 *     if (!r.ok) return null;
 *     const d = await r.json();
 *     return (d.status === 'ok' && d.items?.length) ? d.items : null;
 *   } catch(e) { return null; }
 * }
 */
