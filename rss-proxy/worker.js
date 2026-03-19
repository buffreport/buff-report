/**
 * Buff Report — Cloudflare Worker
 * ─────────────────────────────────────────────────────────────────────────
 * Routes:
 *   GET  /?q=...           → RSS proxy (Google News → JSON)
 *   GET  /?url=...         → Raw RSS URL proxy
 *   POST /subscribe        → Beehiiv subscription API proxy
 *
 * Environment variables (set in CF dashboard → Worker → Settings → Variables):
 *   BEEHIIV_API_KEY        → Your Beehiiv API key (mark as secret/encrypted)
 *   BEEHIIV_PUB_ID         → 1dbc9ea7-e231-4c4e-a25c-bcc96b6a0dab
 *
 * REDEPLOY INSTRUCTIONS (update existing worker):
 *   1. Go to workers.cloudflare.com → buff-report worker → Edit code
 *   2. Replace all code with this file
 *   3. Click Deploy
 *   4. Go to Settings → Variables → add BEEHIIV_API_KEY and BEEHIIV_PUB_ID
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── CORS preflight ──────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // ── ROUTE: POST /subscribe ──────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/subscribe') {
      return handleSubscribe(request, env);
    }

    // ── ROUTE: GET /?q= or /?url= (RSS proxy) ──────────────────────────
    return handleRSS(request, env);
  }
};

// ── SUBSCRIBE HANDLER ────────────────────────────────────────────────────
async function handleSubscribe(request, env) {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const apiKey = env.BEEHIIV_API_KEY;
  const pubId  = env.BEEHIIV_PUB_ID || '1dbc9ea7-e231-4c4e-a25c-bcc96b6a0dab';

  if (!apiKey) {
    // No API key set yet — accept gracefully and note in response
    return json({ status: 'ok', message: 'Subscribed! (API key not yet configured — check CF env vars)' });
  }

  try {
    const resp = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: 'buffreport_website',
          utm_medium: 'subscribe_form',
        }),
      }
    );

    const data = await resp.json();

    // Already subscribed
    if (resp.status === 409 || data?.errors?.some(e => e.includes('already'))) {
      return json({ status: 'duplicate', message: 'You are already subscribed!' });
    }

    if (!resp.ok) {
      console.error('Beehiiv error:', resp.status, JSON.stringify(data));
      return json({ error: 'Subscription failed. Please try again.' }, 502);
    }

    return json({ status: 'ok', message: "You're in! Check your inbox for a confirmation." });

  } catch (err) {
    return json({ error: 'Network error. Please try again.' }, 502);
  }
}

// ── RSS PROXY HANDLER ────────────────────────────────────────────────────
async function handleRSS(request) {
  const json = (data, status = 200, extra = {}) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', ...extra },
    });

  const url = new URL(request.url);
  const query  = url.searchParams.get('q');
  const count  = parseInt(url.searchParams.get('count') || '15');
  const rssUrl = url.searchParams.get('url');

  if (!query && !rssUrl) {
    return json({ error: 'Missing ?q= or ?url= parameter' }, 400);
  }

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
    return json({ error: err.message }, 502);
  }

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

  return json({ status: 'ok', items }, 200, { 'Cache-Control': 'public, max-age=300' });
}
