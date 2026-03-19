/**
 * Buff Report — Sponsor Slot Injector (Item 15)
 * ─────────────────────────────────────────────────────────────────────────
 * Swaps the house ad in output/weekly-digest.html with a paying advertiser's HTML.
 * Run AFTER digest.js, BEFORE create-draft.js.
 *
 * Usage:
 *   node inject-sponsor.js                    ← interactive prompt
 *   node inject-sponsor.js --preview          ← show what will be injected without saving
 *
 * Or call injectSponsor() programmatically (see bottom of file for examples).
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir  = dirname(fileURLToPath(import.meta.url));
const inPath = resolve(__dir, 'output/weekly-digest.html');

/**
 * injectSponsor(slotHtml, options)
 * ─────────────────────────────────
 * @param {string} slotHtml   - Full HTML of the sponsor's creative (banner, CTA, etc.)
 * @param {object} options
 *   @param {boolean} options.preview     - If true, logs result but doesn't save
 *   @param {string}  options.inputFile   - Override input file path
 *   @param {string}  options.outputFile  - Override output file path (defaults to same file)
 *
 * The function finds the element with id="sponsor-slot" in the digest HTML
 * and replaces its contents with slotHtml. The outer <td> wrapper is preserved
 * so email padding/layout stays intact.
 */
export function injectSponsor(slotHtml, options = {}) {
  const src = options.inputFile || inPath;
  const dst = options.outputFile || src;

  let html;
  try {
    html = readFileSync(src, 'utf8');
  } catch {
    throw new Error(`Could not read ${src}. Run: node digest.js first.`);
  }

  // Match the <td id="sponsor-slot" ...>...</td> block
  const tdOpenRegex = /<td\s+id="sponsor-slot"[^>]*>/i;
  const match = html.match(tdOpenRegex);

  if (!match) {
    throw new Error('sponsor-slot element not found in digest HTML. Has digest.js been run?');
  }

  // Find the opening tag, then locate the matching closing </td>
  const startIdx = html.indexOf(match[0]);
  const afterOpen = startIdx + match[0].length;

  // Walk forward to find the matching </td>
  let depth = 1;
  let i = afterOpen;
  while (i < html.length && depth > 0) {
    if (html.slice(i, i + 4).toLowerCase() === '<td>') { depth++; i += 4; }
    else if (html.slice(i, i + 3).toLowerCase() === '<td') { depth++; i += 3; }
    else if (html.slice(i, i + 5).toLowerCase() === '</td>') {
      depth--;
      if (depth === 0) break;
      i += 5;
    } else { i++; }
  }

  if (depth !== 0) {
    throw new Error('Could not find matching </td> for sponsor-slot. Malformed HTML?');
  }

  // Replace the inner content, preserving the outer <td> wrapper attributes
  const wrappedSponsor = `${match[0]}\n${slotHtml}\n</td>`;
  const newHtml = html.slice(0, startIdx) + wrappedSponsor + html.slice(i + 5);

  if (options.preview) {
    console.log('─── PREVIEW (not saved) ───────────────────────────────────────────────');
    console.log('Sponsor slot will be replaced with:\n');
    console.log(slotHtml.slice(0, 500) + (slotHtml.length > 500 ? '\n...(truncated)' : ''));
    console.log('───────────────────────────────────────────────────────────────────────');
    return newHtml;
  }

  writeFileSync(dst, newHtml, 'utf8');
  console.log('✅ Sponsor injected into:', dst);
  console.log('   Review in browser, then run: node create-draft.js');
  return newHtml;
}

// ── BUILT-IN SPONSOR TEMPLATES ────────────────────────────────────────────

/**
 * buildImageBannerSponsor({ imageUrl, linkUrl, altText, label })
 * Simple image banner with optional text label above.
 */
export function buildImageBannerSponsor({ imageUrl, linkUrl, altText = 'Advertisement', label = 'Sponsored' }) {
  return `
    <p style="margin:0 0 6px; font-family:Arial,sans-serif; font-size:9px; color:#999999; text-transform:uppercase; letter-spacing:1px; text-align:center;">${label}</p>
    <a href="${linkUrl}" target="_blank" rel="noopener sponsored" style="display:block;">
      <img src="${imageUrl}" alt="${altText}" width="536" style="width:100%; max-width:536px; height:auto; display:block; border-radius:6px;">
    </a>`;
}

/**
 * buildTextSponsor({ name, headline, body, ctaText, ctaUrl, label })
 * Text-based sponsor block matching the house-ad style.
 */
export function buildTextSponsor({ name, headline, body, ctaText, ctaUrl, label = 'Sponsored' }) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111111; border-radius:8px; overflow:hidden;">
      <tr>
        <td style="padding:24px; text-align:center;">
          <p style="margin:0 0 4px; font-family:Arial,sans-serif; font-size:9px; color:#888888; text-transform:uppercase; letter-spacing:1px;">${label}</p>
          <p style="margin:0 0 4px; font-family:Arial,sans-serif; font-size:11px; font-weight:bold; color:#CFA82C; text-transform:uppercase; letter-spacing:1.5px;">${name}</p>
          <p style="margin:0 0 8px; font-family:Georgia,serif; font-size:18px; color:#ffffff; font-weight:bold;">${headline}</p>
          <p style="margin:0 0 14px; font-family:Arial,sans-serif; font-size:13px; color:#aaaaaa;">${body}</p>
          <a href="${ctaUrl}" style="background:#CFA82C; color:#000000; font-family:Arial,sans-serif; font-size:12px; font-weight:bold; text-decoration:none; padding:10px 24px; border-radius:5px; display:inline-block; text-transform:uppercase; letter-spacing:0.5px;">${ctaText}</a>
        </td>
      </tr>
    </table>`;
}

// ── CLI / EXAMPLE USAGE ───────────────────────────────────────────────────
// Run directly to see example output
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');

  console.log('─── Buff Report Sponsor Injector ──────────────────────────────────────');
  console.log('');
  console.log('To use programmatically in your workflow, call:');
  console.log('');
  console.log('  import { injectSponsor, buildTextSponsor, buildImageBannerSponsor } from "./inject-sponsor.js";');
  console.log('');
  console.log('  // Text sponsor:');
  console.log('  injectSponsor(buildTextSponsor({');
  console.log('    name: "Acme Co",');
  console.log('    headline: "The Best CU Fan Gear",');
  console.log('    body: "20% off for Buff Report subscribers.",');
  console.log('    ctaText: "Shop Now",');
  console.log('    ctaUrl: "https://acme.com/?ref=buffreport"');
  console.log('  }));');
  console.log('');
  console.log('  // Image banner sponsor:');
  console.log('  injectSponsor(buildImageBannerSponsor({');
  console.log('    imageUrl: "https://cdn.sponsor.com/banner.jpg",');
  console.log('    linkUrl:  "https://sponsor.com/?ref=buffreport",');
  console.log('    altText:  "Sponsor Name"');
  console.log('  }));');
  console.log('');

  if (preview) {
    // Demo injection with the house ad style (won't change the file)
    try {
      injectSponsor(buildTextSponsor({
        name: 'Demo Sponsor',
        headline: 'This is a preview of a paid sponsor slot',
        body: 'Replace this with your advertiser\'s copy.',
        ctaText: 'Learn More',
        ctaUrl: 'https://buffreport.com',
      }), { preview: true });
    } catch (e) { console.log('(No digest found to preview against — run node digest.js first)'); }
  }
}
