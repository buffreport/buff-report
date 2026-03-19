/**
 * Buff Report — Beehiiv Draft Creator (Item 13)
 * ─────────────────────────────────────────────────────────────────────────
 * Reads output/weekly-digest.html and pushes it to Beehiiv as a draft post.
 * You can then review and send from the Beehiiv dashboard — no copy-paste needed.
 *
 * Prerequisites:
 *   1. Run: node digest.js (generates the HTML)
 *   2. Set BEEHIIV_API_KEY and BEEHIIV_PUB_ID in .env
 *   3. Run: node create-draft.js
 *
 * Beehiiv docs: https://developers.beehiiv.com/docs/v2/posts-create
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dir = dirname(fileURLToPath(import.meta.url));

// Load .env manually (avoid needing dotenv import if not installed yet)
try {
  const env = readFileSync(resolve(__dir, '.env'), 'utf8');
  env.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#')) process.env[key.trim()] = rest.join('=').trim();
  });
} catch { /* .env not found — rely on system env */ }

const API_KEY = process.env.BEEHIIV_API_KEY;
const PUB_ID  = process.env.BEEHIIV_PUB_ID || '1dbc9ea7-e231-4c4e-a25c-bcc96b6a0dab';

if (!API_KEY) {
  console.error('❌ BEEHIIV_API_KEY not set. Copy .env.example to .env and add your key.');
  process.exit(1);
}

// Read the generated digest
let htmlContent;
try {
  htmlContent = readFileSync(resolve(__dir, 'output/weekly-digest.html'), 'utf8');
} catch {
  console.error('❌ output/weekly-digest.html not found. Run: node digest.js first.');
  process.exit(1);
}

// Read stories.json for the subject line
let stories;
try {
  stories = JSON.parse(readFileSync(resolve(__dir, 'stories.json'), 'utf8'));
} catch {
  stories = { week_label: 'This Week', top_story: { headline: 'CU Buffs Weekly Digest' } };
}

const subject = `The Buff Brief — ${stories.week_label}`;
const previewText = stories.top_story?.headline || 'Your weekly CU Buffs news digest';

console.log(`📧 Creating draft: "${subject}"`);

const payload = {
  publication_id: PUB_ID,
  subject_line: subject,
  preview_text: previewText,
  content_tags: ['weekly-digest', 'cu-buffs'],
  status: 'draft',       // stays as draft — you review and send from dashboard
  platform: 'email',
  audience: 'free',      // send to all free subscribers
  content: {
    free: htmlContent,
  },
};

try {
  const resp = await fetch(`https://api.beehiiv.com/v2/publications/${PUB_ID}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();

  if (!resp.ok) {
    console.error('❌ Beehiiv API error:', resp.status, JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const postId  = data?.data?.id;
  const webUrl  = data?.data?.web_url || '';
  const dashUrl = `https://app.beehiiv.com/posts/${postId}`;

  console.log('✅ Draft created successfully!');
  console.log('   Post ID:', postId);
  console.log('   Review in dashboard:', dashUrl);
  if (webUrl) console.log('   Web preview:', webUrl);
  console.log('\n   → Go to Beehiiv, review the draft, then click Send when ready.');

} catch (err) {
  console.error('❌ Network error:', err.message);
  process.exit(1);
}
