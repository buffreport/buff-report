/**
 * Buff Report — Game-Day Email Trigger (Item 14)
 * ─────────────────────────────────────────────────────────────────────────
 * Checks if there's a CU game today. If yes, generates a game-day preview
 * email (output/gameday-preview.html) and pushes it as a Beehiiv draft.
 *
 * Run manually: node gameday.js
 *
 * CRON SETUP (run every morning at 8am):
 *   Open Terminal and run: crontab -e
 *   Add this line (update the path to match where your newsletter folder is):
 *
 *   0 8 * * * cd /path/to/buff-report/newsletter && /usr/local/bin/node gameday.js >> /tmp/buff-gameday.log 2>&1
 *
 *   To find your node path: which node
 *   To find your folder path: pwd (run inside the newsletter folder)
 *
 * Before each game day: update "key_player" in schedule-data.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

// Load .env
try {
  const env = readFileSync(resolve(__dir, '.env'), 'utf8');
  env.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#')) process.env[key.trim()] = rest.join('=').trim();
  });
} catch { /* rely on system env */ }

const API_KEY = process.env.BEEHIIV_API_KEY;
const PUB_ID  = process.env.BEEHIIV_PUB_ID || '1dbc9ea7-e231-4c4e-a25c-bcc96b6a0dab';

// ── CHECK TODAY'S GAME ────────────────────────────────────────────────────
let scheduleData;
try {
  scheduleData = JSON.parse(readFileSync(resolve(__dir, 'schedule-data.json'), 'utf8'));
} catch {
  console.error('❌ schedule-data.json not found.');
  process.exit(1);
}

// Get today's date in YYYY-MM-DD (local time)
const today = new Date().toLocaleDateString('sv-SE'); // sv-SE gives YYYY-MM-DD format
const todayGame = scheduleData.games.find(g => g.date === today);

if (!todayGame) {
  console.log(`ℹ️  No CU game scheduled for today (${today}). Nothing to send.`);
  process.exit(0);
}

console.log(`🏟  Game found for today: CU vs ${todayGame.opponent} (${todayGame.sport})`);

// ── RECENT RESULTS ────────────────────────────────────────────────────────
const recentResults = (scheduleData.recent_results || [])
  .filter(r => r.sport === todayGame.sport)
  .slice(0, 3);

const resultsRows = recentResults.map(r =>
  `<tr>
    <td style="padding:5px 10px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#555;">${r.date}</td>
    <td style="padding:5px 10px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#333; font-weight:bold;">vs ${r.opponent}</td>
    <td style="padding:5px 10px; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; color:${r.result.startsWith('W') ? '#16A34A' : '#DC2626'};">${r.result}</td>
  </tr>`
).join('');

const esc = s => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const sportIcon = todayGame.sport === 'WBB' ? '🏀' : todayGame.sport === 'MBB' ? '🏀' : '🏈';
const subjectLine = `${sportIcon} Game Day — CU Buffs vs ${todayGame.opponent} | ${todayGame.time}`;

// ── BUILD EMAIL HTML ──────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(subjectLine)}</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f0;">

<!-- Preheader -->
<div style="display:none; max-height:0; overflow:hidden;">
  CU takes on ${esc(todayGame.opponent)} today at ${esc(todayGame.time)} on ${esc(todayGame.tv)}. Here's what you need to know.
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f0;">
<tr><td align="center" style="padding:20px 10px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:#111111; padding:24px 32px 18px; text-align:center;">
      <p style="margin:0 0 2px; font-family:Arial,sans-serif; font-size:10px; font-weight:bold; color:#CFA82C; text-transform:uppercase; letter-spacing:3px;">Game Day</p>
      <h1 style="margin:0; font-family:Georgia,serif; font-size:26px; color:#ffffff;">The Buff Report</h1>
    </td>
  </tr>
  <tr><td style="height:3px; background:#CFA82C;"></td></tr>

  <!-- Matchup Hero -->
  <tr>
    <td style="background:#1a1a1a; padding:30px 32px; text-align:center;">
      <p style="margin:0 0 6px; font-family:Arial,sans-serif; font-size:11px; color:#CFA82C; font-weight:bold; text-transform:uppercase; letter-spacing:2px;">${esc(todayGame.sport)} · ${esc(todayGame.series_note || 'Game Day')}</p>
      <h2 style="margin:0 0 4px; font-family:Georgia,serif; font-size:28px; color:#ffffff; font-weight:bold;">Colorado Buffaloes</h2>
      <p style="margin:0 0 4px; font-family:Arial,sans-serif; font-size:16px; color:#888888;">vs.</p>
      <h2 style="margin:0 0 16px; font-family:Georgia,serif; font-size:28px; color:#ffffff; font-weight:bold;">${esc(todayGame.opponent)}</h2>
      <table align="center" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#CFA82C; border-radius:4px; padding:8px 18px; text-align:center; margin-right:8px;">
            <span style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; color:#000000; text-transform:uppercase; letter-spacing:0.5px;">🕐 ${esc(todayGame.time)}</span>
          </td>
          <td style="width:10px;"></td>
          <td style="background:#333333; border-radius:4px; padding:8px 18px; text-align:center;">
            <span style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; color:#ffffff; text-transform:uppercase; letter-spacing:0.5px;">📺 ${esc(todayGame.tv)}</span>
          </td>
        </tr>
      </table>
      <p style="margin:12px 0 0; font-family:Arial,sans-serif; font-size:12px; color:#666666;">📍 ${esc(todayGame.location)}</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:28px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">

        <!-- Recent Results -->
        ${recentResults.length ? `
        <tr>
          <td style="padding-bottom:20px;">
            <p style="margin:0 0 10px; font-family:Arial,sans-serif; font-size:11px; font-weight:bold; color:#CFA82C; text-transform:uppercase; letter-spacing:1.5px;">Recent Form</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8e8e4; border-radius:6px; overflow:hidden;">
              ${resultsRows}
            </table>
          </td>
        </tr>` : ''}

        <!-- Key Player -->
        ${todayGame.key_player && todayGame.key_player !== 'Fill in manually before cron runs' ? `
        <tr>
          <td style="padding-bottom:20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf7; border:1px solid #e8e8e4; border-left:4px solid #CFA82C; border-radius:0 6px 6px 0; padding:14px 16px;">
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 4px; font-family:Arial,sans-serif; font-size:10px; font-weight:bold; color:#CFA82C; text-transform:uppercase; letter-spacing:1.5px;">⭐ Key Player to Watch</p>
                  <p style="margin:0; font-family:Georgia,serif; font-size:15px; color:#111111;">${esc(todayGame.key_player)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- CTA -->
        <tr>
          <td style="text-align:center; padding-top:8px;">
            <a href="https://buffreport.com" style="background:#111111; color:#CFA82C; font-family:Arial,sans-serif; font-size:13px; font-weight:bold; text-decoration:none; padding:12px 28px; border-radius:6px; display:inline-block; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #CFA82C;">
              Full Coverage at buffreport.com →
            </a>
          </td>
        </tr>

      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#111111; padding:16px 32px; text-align:center;">
      <p style="margin:0; font-family:Arial,sans-serif; font-size:11px; color:#555555; line-height:1.5;">
        <a href="https://buffreport.com" style="color:#CFA82C; text-decoration:none; font-weight:bold;">buffreport.com</a>
        &nbsp;·&nbsp; Not affiliated with the University of Colorado
        &nbsp;·&nbsp; <a href="{{unsubscribe_url}}" style="color:#555555;">Unsubscribe</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

// ── SAVE ──────────────────────────────────────────────────────────────────
mkdirSync(resolve(__dir, 'output'), { recursive: true });
const outPath = resolve(__dir, 'output/gameday-preview.html');
writeFileSync(outPath, html, 'utf8');
console.log('✅ Game-day email generated:', outPath);

// ── PUSH TO BEEHIIV AS DRAFT (if API key set) ─────────────────────────────
if (!API_KEY) {
  console.log('ℹ️  No BEEHIIV_API_KEY set — skipping draft creation. Review HTML file manually.');
  process.exit(0);
}

console.log('📤 Pushing to Beehiiv as draft...');

try {
  const resp = await fetch(`https://api.beehiiv.com/v2/publications/${PUB_ID}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publication_id: PUB_ID,
      subject_line: subjectLine,
      preview_text: `CU vs ${todayGame.opponent} — ${todayGame.time} on ${todayGame.tv}`,
      status: 'draft',
      platform: 'email',
      audience: 'free',
      content: { free: html },
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error('❌ Beehiiv error:', resp.status, JSON.stringify(data));
    process.exit(1);
  }

  console.log('✅ Draft created in Beehiiv!');
  console.log('   Review at: https://app.beehiiv.com/posts/' + data?.data?.id);
} catch (err) {
  console.error('❌ Network error pushing to Beehiiv:', err.message);
}
