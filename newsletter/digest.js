/**
 * Buff Report — Weekly Digest Generator (Item 12)
 * ─────────────────────────────────────────────────────────────────────────
 * Reads stories.json, generates a branded HTML email, saves to output/weekly-digest.html
 * Run: node digest.js
 * Then review output/weekly-digest.html in your browser before sending.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const stories = JSON.parse(readFileSync(resolve(__dir, 'stories.json'), 'utf8'));

// ── HELPERS ───────────────────────────────────────────────────────────────
const esc = s => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function storyRow(item) {
  return `
  <tr>
    <td style="padding:0 0 18px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-left:12px; border-left:3px solid #CFA82C;">
            <a href="${esc(item.url)}" style="font-family:Georgia,serif; font-size:15px; font-weight:bold; color:#111111; text-decoration:none; line-height:1.3; display:block; margin-bottom:5px;">${esc(item.headline)}</a>
            <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#555555; line-height:1.5;">${esc(item.summary)}</p>
            <p style="margin:5px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#999999; text-transform:uppercase; letter-spacing:0.5px;">${esc(item.source)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function sectionBlock(label, color, items) {
  if (!items?.length) return '';
  return `
  <!-- Section: ${label} -->
  <tr>
    <td style="padding:0 0 6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:${color}; padding:6px 14px; border-radius:4px;">
            <span style="font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#ffffff; text-transform:uppercase; letter-spacing:1.5px;">${esc(label)}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr><td style="padding:10px 0 20px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${items.map(storyRow).join('')}
    </table>
  </td></tr>`;
}

function sponsorBlock(s) {
  if (s.is_house_ad) {
    return `
  <!-- Sponsor: House Ad -->
  <tr>
    <td id="sponsor-slot" data-sponsor="house" style="background:#111111; border-radius:8px; padding:24px; text-align:center;">
      <p style="margin:0 0 6px; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#CFA82C; text-transform:uppercase; letter-spacing:2px;">The Buff Report</p>
      <p style="margin:0 0 8px; font-family:Georgia,serif; font-size:18px; font-weight:bold; color:#ffffff;">${esc(s.headline)}</p>
      <p style="margin:0 0 14px; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#aaaaaa;">${esc(s.body)}</p>
      <a href="${esc(s.cta_url)}" style="background:#CFA82C; color:#000000; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; text-decoration:none; padding:10px 24px; border-radius:5px; display:inline-block; text-transform:uppercase; letter-spacing:0.5px;">${esc(s.cta_text)}</a>
    </td>
  </tr>`;
  }
  // Paid sponsor
  return `
  <!-- Sponsor: Paid -->
  <tr>
    <td id="sponsor-slot" data-sponsor="paid" style="border:2px solid #CFA82C; border-radius:8px; padding:20px; text-align:center;">
      <p style="margin:0 0 4px; font-family:Arial,Helvetica,sans-serif; font-size:9px; color:#999999; text-transform:uppercase; letter-spacing:1px;">Sponsored</p>
      ${s.custom_html || `<p style="color:#555">[Sponsor creative here]</p>`}
    </td>
  </tr>`;
}

// ── BUILD HTML ────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Buff Brief — ${esc(stories.week_label)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f4f4f0; font-family:Arial,Helvetica,sans-serif;">

<!-- Preheader (hidden preview text) -->
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
  ${esc(stories.top_story.headline)} · Plus: football, basketball, and Boulder news — ${esc(stories.week_label)}
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f0;">
<tr><td align="center" style="padding:20px 10px;">

  <!-- Main container -->
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td style="background:#111111; padding:28px 32px 22px; text-align:center;">
        <p style="margin:0 0 2px; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#CFA82C; text-transform:uppercase; letter-spacing:3px;">The Buff Brief</p>
        <h1 style="margin:0 0 4px; font-family:Georgia,serif; font-size:28px; font-weight:bold; color:#ffffff; line-height:1.1;">The Buff Report</h1>
        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#888888; text-transform:uppercase; letter-spacing:1.5px;">Athletics · Academics · Every Headline</p>
        <p style="margin:12px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#666666;">${esc(stories.week_label)}</p>
      </td>
    </tr>

    <!-- Divider -->
    <tr><td style="height:3px; background:linear-gradient(90deg,#CFA82C,#b8932a);"></td></tr>

    <!-- Body -->
    <tr>
      <td style="padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">

          <!-- Top Story -->
          <tr>
            <td style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#111111; padding:6px 14px; border-radius:4px 4px 0 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#CFA82C; text-transform:uppercase; letter-spacing:1.5px;">⭐ Top Story</span>
                  </td>
                </tr>
                <tr>
                  <td style="background:#fafaf7; border:1px solid #e8e8e4; border-top:none; border-radius:0 0 4px 4px; padding:18px 16px;">
                    <a href="${esc(stories.top_story.url)}" style="font-family:Georgia,serif; font-size:18px; font-weight:bold; color:#111111; text-decoration:none; line-height:1.3; display:block; margin-bottom:8px;">${esc(stories.top_story.headline)}</a>
                    <p style="margin:0 0 10px; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#444444; line-height:1.6;">${esc(stories.top_story.summary)}</p>
                    <a href="${esc(stories.top_story.url)}" style="font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; color:#CFA82C; text-decoration:none;">Read full story →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${sectionBlock('🏈 Football', '#1a1a1a', stories.football)}
          ${sectionBlock('🏀 Basketball', '#1d4a8a', stories.basketball)}
          ${sectionBlock('🏙 Around Town', '#2d4a2d', stories.around_town)}

          <!-- Divider -->
          <tr><td style="height:1px; background:#e8e8e4; margin:10px 0;"></td></tr>
          <tr><td style="padding:20px 0;">${sponsorBlock(stories.sponsor)}</td></tr>

        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#111111; padding:20px 32px; text-align:center;">
        <p style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#888888;">
          <a href="https://buffreport.com" style="color:#CFA82C; text-decoration:none; font-weight:bold;">buffreport.com</a>
          &nbsp;·&nbsp;
          <a href="https://buffreport.com/schedule" style="color:#888888; text-decoration:none;">Schedule</a>
          &nbsp;·&nbsp;
          <a href="https://buffreport.com/recruiting" style="color:#888888; text-decoration:none;">Recruiting</a>
          &nbsp;·&nbsp;
          <a href="https://buffreport.com/transfer-portal" style="color:#888888; text-decoration:none;">Transfer Portal</a>
        </p>
        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#555555; line-height:1.5;">
          You're receiving this because you subscribed at buffreport.com.<br>
          Not affiliated with the University of Colorado.<br>
          <a href="{{unsubscribe_url}}" style="color:#555555;">Unsubscribe</a>
        </p>
      </td>
    </tr>

  </table>
  <!-- /Main container -->

</td></tr>
</table>

</body>
</html>`;

// ── SAVE ──────────────────────────────────────────────────────────────────
mkdirSync(resolve(__dir, 'output'), { recursive: true });
const outPath = resolve(__dir, 'output/weekly-digest.html');
writeFileSync(outPath, html, 'utf8');

console.log('✅ Digest generated:', outPath);
console.log('   Open in browser to review, then run: node create-draft.js');
