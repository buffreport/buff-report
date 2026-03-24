/**
 * Buff Report — Cloudflare Worker
 * ─────────────────────────────────────────────────────────────────────────
 * Routes:
 *   GET  /?q=...           → RSS proxy (Google News → JSON)
 *   GET  /?url=...         → Raw RSS URL proxy
 *   GET  /?og=...          → og:image scraper (returns { image: url | null })
 *   GET  /?cfbd=...        → College Football Data API proxy
 *   POST /subscribe        → Beehiiv subscription API proxy
 *
 * Environment variables (set in CF dashboard → Worker → Settings → Variables):
 *   BEEHIIV_API_KEY        → Your Beehiiv API key (mark as secret/encrypted)
 *   BEEHIIV_PUB_ID         → 1dbc9ea7-e231-4c4e-a25c-bcc96b6a0dab
 *   CFBD_API_KEY           → College Football Data API key (mark as secret/encrypted)
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

    // ── ROUTE: GET /?og= (og:image scraper) ────────────────────────────
    if (url.searchParams.has('og')) {
      return handleOgImage(request);
    }

    // ── ROUTE: GET /?cfbd= (College Football Data API proxy) ───────────
    if (url.searchParams.has('cfbd')) {
      return handleCFBD(request, env);
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

// ── OG:IMAGE SCRAPER ─────────────────────────────────────────────────────
async function handleOgImage(request) {
  const url = new URL(request.url);
  const articleUrl = url.searchParams.get('og');
  const jsonResp = (data, extra = {}) =>
    new Response(JSON.stringify(data), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', ...extra },
    });

  if (!articleUrl) return jsonResp({ image: null });

  try {
    const resp = await fetch(articleUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BuffReport/1.0; +https://buffreport.com)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return jsonResp({ image: null });

    // Only read the first 20KB — og:image is always in <head>
    const reader = resp.body.getReader();
    let html = '';
    while (html.length < 20000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += new TextDecoder().decode(value);
    }
    reader.cancel();

    // Match og:image in either attribute order
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    const image = match ? match[1].trim() : null;
    if (!image) return jsonResp({ image: null });

    // Reject portrait/square images (headshots, author photos, staff pics)
    // Card slots need landscape images — anything taller than wide falls back to a filler
    const isLandscape = await checkImageLandscape(image);
    if (!isLandscape) return jsonResp({ image: null });

    return jsonResp({ image }, { 'Cache-Control': 'public, max-age=300' });
  } catch {
    return jsonResp({ image: null });
  }
}

// Returns true if the image is wider than tall (landscape), false if portrait/square.
// Falls back to true on any error so valid images are never accidentally blocked.
async function checkImageLandscape(imageUrl) {
  try {
    const resp = await fetch(imageUrl, {
      headers: { 'Range': 'bytes=0-32767' },
      signal: AbortSignal.timeout(3000),
    });
    if (!resp.ok) return true;
    const buf = await resp.arrayBuffer();
    const b = new Uint8Array(buf);
    const dims = parseImageDimensions(b);
    if (!dims) return true; // unrecognised format — allow it
    return dims.width / dims.height >= 1.3; // require at least 4:3 landscape ratio
  } catch {
    return true;
  }
}

// Parses width/height from the binary header of JPEG, PNG, or WebP files.
function parseImageDimensions(b) {
  // PNG — fixed header: 8-byte sig + 4-byte length + "IHDR" + 4W + 4H
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
    if (b.length < 24) return null;
    const w = (b[16] << 24) | (b[17] << 16) | (b[18] << 8) | b[19];
    const h = (b[20] << 24) | (b[21] << 16) | (b[22] << 8) | b[23];
    return { width: w >>> 0, height: h >>> 0 };
  }

  // JPEG — scan for SOF markers (0xFF 0xCx)
  if (b[0] === 0xFF && b[1] === 0xD8) {
    let i = 2;
    while (i < b.length - 8) {
      if (b[i] !== 0xFF) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
        const h = (b[i + 5] << 8) | b[i + 6];
        const w = (b[i + 7] << 8) | b[i + 8];
        if (w > 0 && h > 0) return { width: w, height: h };
      }
      if (i + 3 >= b.length) break;
      i += 2 + ((b[i + 2] << 8) | b[i + 3]);
    }
    return null;
  }

  // WebP — RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    // VP8 lossy
    if (b[12] === 0x56 && b[13] === 0x50 && b[14] === 0x38 && b[15] === 0x20 && b.length >= 30) {
      const w = ((b[26] | (b[27] << 8)) & 0x3FFF) + 1;
      const h = ((b[28] | (b[29] << 8)) & 0x3FFF) + 1;
      return { width: w, height: h };
    }
    // VP8L lossless
    if (b[12] === 0x56 && b[13] === 0x50 && b[14] === 0x38 && b[15] === 0x4C && b.length >= 25 && b[20] === 0x2F) {
      const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
      const w = (bits & 0x3FFF) + 1;
      const h = ((bits >> 14) & 0x3FFF) + 1;
      return { width: w, height: h };
    }
    return null;
  }

  return null;
}

// ── CFBD API PROXY ────────────────────────────────────────────────────────
async function handleCFBD(request, env) {
  const json = (data, status = 200, extra = {}) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', ...extra },
    });

  const apiKey = env.CFBD_API_KEY;
  if (!apiKey) return json({ error: 'CFBD API key not configured' }, 503);

  const url = new URL(request.url);
  const path = url.searchParams.get('cfbd'); // e.g. /recruiting/players

  // Forward all params except 'cfbd' itself
  const params = new URLSearchParams();
  for (const [k, v] of url.searchParams) {
    if (k !== 'cfbd') params.append(k, v);
  }

  const cfbdUrl = `https://api.collegefootballdata.com${path}${params.toString() ? '?' + params.toString() : ''}`;

  try {
    const resp = await fetch(cfbdUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return json({ error: `CFBD returned ${resp.status}`, detail: text }, resp.status);
    }

    const data = await resp.json();
    return json(data, 200, { 'Cache-Control': 'public, max-age=3600' });
  } catch (err) {
    return json({ error: err.message }, 502);
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
