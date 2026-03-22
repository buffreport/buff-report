# REDESIGN PACKAGE FOR http://BUFFREPORT.COM – READY TO BUILD

**Prepared by:** Lead Designer / Brand Strategist
**Date:** March 2026
**Status:** Implementation-Ready

---

## SITE ANALYSIS (Current State)

After reviewing the live codebase in full, here is the honest current-state audit:

**What's working:**
- Solid tab-based navigation (Latest / Football / Basketball / Recruiting / Portal/NIL / Campus / Around Town / Podcasts / Live)
- Auto-refreshing content sections with live score integration
- Clean typography stack (Merriweather + Playfair Display)
- Black/gold color system already partially implemented (`#E0BA51`, `#000000`)
- Two-column grid layout (main + 320px sidebar) on desktop
- Breaking news bar at top
- Service worker for offline/PWA capability
- CU Scoreboard sidebar widget
- Newsletter subscribe popup

**What's broken or missing:**
- No hero images — pure text feed, visually flat
- Header is modest/understated — logo doesn't command attention
- No sticky navigation — tabs disappear on scroll
- `--primary-dark: #c9a43a` still used in hover states (slightly off-brand)
- No dark mode toggle
- Mobile layout collapses sidebar but still text-heavy
- No social proof indicators (subscriber count, trust line)
- Subscribe CTA is buried — no floating button
- No thumbnail images on article cards
- Podcast section has no embedded player
- Sections have no visual dividers or icons — walls of text
- Ad slot is a single static image, not a real ad network

---

## 1. UPDATED SLOGAN

**Recommendation: "ATHLETICS. ACADEMICS. EVERY HEADLINE. ONE PAGE."**

This is already in your header and it wins for three reasons:

1. **SEO value** — "athletics academics headlines" are high-intent search terms for CU fans
2. **Positioning clarity** — it tells a first-time visitor exactly what they get in one breath
3. **Differentiation** — "ONE FEED." is too generic; the Boulder version is too local-only

**Exact header text to use:**

```
THE BUFF REPORT
Athletics. Academics. Every Headline. One Page.
```

Secondary option for mobile (shorter):
```
THE BUFF REPORT
Every CU Headline. One Page.
```

---

## 2. WIREFRAMES

### 2A — New Header

```
┌─────────────────────────────────────────────────────────────────┐
│  [BREAKING] Colorado lands 5-star WR commit — Sources           │  ← Black bar, red LIVE badge, gold text
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ████  THE BUFF REPORT           [🌙 Dark]  [Subscribe Free →]  │
│  ████  ─────────────────                                         │
│  ████  Athletics. Academics.     Saturday, March 21, 2026        │
│  ████  Every Headline. One Page. 10:42 AM MT                     │
│                                                                   │
│  (Buffalo logo left-anchored, 120×120px, gold on black bg)       │
│  (Header bg: white, bottom border: 2px solid #E0BA51)            │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  LATEST · FOOTBALL · BASKETBALL · RECRUITING · PORTAL · CAMPUS · BOULDER · PODCASTS · 🔴 LIVE  │
│  ─────────                                                        │  ← Active tab gold underline
└─────────────────────────────────────────────────────────────────┘
```

**Header spec:**
- Background: `#FFFFFF` with `border-bottom: 3px solid #E0BA51`
- Logo: 120×120px minimum, `mix-blend-mode: multiply` removed — use white circle backing instead
- "THE BUFF REPORT" — Playfair Display 900, 48px desktop / 28px mobile
- Tagline — Merriweather Sans 400, 13px, `#666`, letter-spacing 0.5px
- Dateline — right-aligned, Merriweather Sans 400, 12px, `#999`
- Dark mode toggle — top right, moon/sun icon, 32px
- Subscribe button — top right, black bg, gold text, pill shape

---

### 2B — Sticky Tab Nav

```
┌─────────────────────────────────────────────────────────────────┐
│ LATEST  FOOTBALL  BASKETBALL  RECRUITING  PORTAL  CAMPUS  BOULDER  PODCASTS  🔴LIVE │
│ ──────                                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Sticky nav spec:**
- `position: sticky; top: 0; z-index: 100`
- Background: `#FFFFFF`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)` on scroll
- Active tab: `border-bottom: 3px solid #E0BA51`, bold weight
- Inactive: `color: #999`, 700 weight, letter-spacing 0.8px
- LIVE tab: red dot pulse animation, always visible
- Mobile: horizontally scrollable, no wrapping, `-webkit-overflow-scrolling: touch`

---

### 2C — Hero Image Rotator

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│   ░░░  HERO IMAGE (16:9 or 3:1 cinematic crop, CU photo)  ░░░░  │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                   │
│   ████████████████████████████████▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░  │  ← gradient overlay
│                                                                   │
│   🏈 FOOTBALL                                                     │  ← category pill
│   Colorado Beats #5 Utah 31–28 in Overtime Thriller              │  ← headline, Playfair 900 32px white
│   Shedeur Sanders throws for 387 yards in career performance     │  ← subhead, white 85% opacity
│                                                                   │
│   [Read Full Story →]          ● ● ○ ○ ○                        │  ← CTA + dots nav
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Hero spec:**
- Height: 420px desktop, 220px mobile
- Gradient overlay: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)`
- Auto-advance: 6s interval, pause on hover
- 4–5 slides pulled from top stories
- Transition: crossfade 400ms ease

---

### 2D — Overall Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  BREAKING BAR                                                    │
├─────────────────────────────────────────────────────────────────┤
│  HEADER (logo + title + controls)                                │
├─────────────────────────────────────────────────────────────────┤
│  STICKY TAB NAV [LATEST · FOOTBALL · BASKETBALL …]              │
├─────────────────────────────────────────────────────────────────┤
│  HERO IMAGE ROTATOR (full-width)                                 │
├──────────────────────────────────┬──────────────────────────────┤
│                                  │                               │
│  MAIN CONTENT (flex: 1)          │  SIDEBAR (320px)              │
│                                  │                               │
│  ── ⚡ LATEST NEWS ──────────    │  ┌─ CU SCOREBOARD ─────────┐ │
│  [thumb] Headline text here      │  │  #10 Colorado 42         │ │
│  [thumb] Headline text here      │  │  Utah         17  FINAL  │ │
│  [thumb] Headline text here      │  └─────────────────────────┘ │
│                                  │                               │
│  ── 🏈 FOOTBALL ───────────────  │  ┌─ UPCOMING ──────────────┐ │
│  [thumb] Headline text here      │  │  vs Oregon  Sat 7pm      │ │
│  [thumb] Headline text here      │  └─────────────────────────┘ │
│                                  │                               │
│  ── 🏀 BASKETBALL ─────────────  │  ┌─ AD SLOT ───────────────┐ │
│  [thumb] Headline text here      │  │  [Sponsor Image]         │ │
│                                  │  └─────────────────────────┘ │
│  ── 🎓 CAMPUS ─────────────────  │                               │
│  [thumb] Headline text here      │  ┌─ SUBSCRIBE ─────────────┐ │
│                                  │  │  Join 4,800+ Buffs       │ │
│  ── 🏔️ BOULDER ────────────────  │  │  [email input]           │ │
│  [thumb] Headline text here      │  │  [Subscribe Free →]      │ │
│                                  │  └─────────────────────────┘ │
└──────────────────────────────────┴──────────────────────────────┘
│  FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘

[Floating Subscribe Button — fixed bottom-right]
```

**Section dividers:**
- `border-top: 2px solid #E0BA51` + icon + label
- Label: Merriweather Sans 800, 11px, letter-spacing 2px, uppercase
- Background accent: `rgba(224, 186, 81, 0.06)` behind section header row

---

## 3. FIGMA-STYLE REDESIGN BRIEF / STYLE GUIDE

### Color Palette

```css
:root {
  /* Core Brand */
  --gold:          #E0BA51;   /* Official logo gold — PRIMARY */
  --gold-dark:     #C9A43A;   /* Hover states only */
  --gold-light:    #F5E9B8;   /* Tint backgrounds, badges */
  --gold-subtle:   rgba(224, 186, 81, 0.08); /* Section wash */
  --black:         #000000;   /* Pure brand black */
  --black-soft:    #111111;   /* Body text */
  --black-card:    #1A1A1A;   /* Dark mode cards */
  --black-border:  #2A2A2A;   /* Dark mode borders */

  /* UI Neutrals */
  --bg:            #FAFAF7;   /* Warm off-white body bg */
  --bg-card:       #FFFFFF;   /* Card backgrounds */
  --border:        #E8E8E4;   /* Dividers */
  --text:          #111111;   /* Primary text */
  --text-secondary:#666666;   /* Subheads, meta */
  --text-muted:    #999999;   /* Timestamps, labels */

  /* Accent Colors */
  --blue:          #2563EB;   /* Academic / Campus */
  --red:           #DC2626;   /* Breaking / Live */
  --green:         #16A34A;   /* Recruiting wins */
  --orange:        #EA580C;   /* Alerts */

  /* Dark Mode Overrides (applied via [data-theme="dark"]) */
  --dm-bg:         #0D0D0D;
  --dm-card:       #1A1A1A;
  --dm-border:     #2A2A2A;
  --dm-text:       #F0F0EC;
  --dm-text-sec:   #AAAAAA;
  --dm-text-muted: #666666;

  /* Spacing */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;

  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'Merriweather Sans', system-ui, sans-serif;
  --font-serif:   'Merriweather', Georgia, serif;

  /* Radii */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-pill:9999px;

  /* Shadows */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.12);
  --shadow-gold:0 4px 20px rgba(224,186,81,0.25);
}
```

### Typography Scale

| Element              | Font              | Size (desktop) | Size (mobile) | Weight | Color          |
|----------------------|-------------------|----------------|---------------|--------|----------------|
| Site name            | Playfair Display  | 48px           | 28px          | 900    | `#000000`      |
| Hero headline        | Playfair Display  | 32px           | 22px          | 700    | `#FFFFFF`      |
| Section label        | Merriweather Sans | 11px           | 10px          | 800    | `#E0BA51`      |
| Article headline     | Merriweather      | 16px           | 15px          | 700    | `#111111`      |
| Article sub          | Merriweather Sans | 13px           | 13px          | 400    | `#666666`      |
| Nav tabs             | Merriweather Sans | 12px           | 11px          | 700    | `#999` / `#000`|
| Meta / timestamp     | Merriweather Sans | 11px           | 11px          | 400    | `#999999`      |
| Button               | Merriweather Sans | 13px           | 13px          | 800    | varies         |

### Button Styles

```css
/* Primary CTA — gold fill */
.btn-primary {
  background: #E0BA51;
  color: #000000;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  border: none;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.btn-primary:hover {
  background: #C9A43A;
  transform: translateY(-1px);
}

/* Secondary — black fill */
.btn-secondary {
  background: #000000;
  color: #E0BA51;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  border: 2px solid #000000;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary:hover {
  background: transparent;
  color: #000000;
}

/* Ghost — outlined gold */
.btn-ghost {
  background: transparent;
  color: #E0BA51;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  border: 1.5px solid #E0BA51;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover {
  background: #E0BA51;
  color: #000000;
}
```

### Dark Mode Color Mapping

| Light Token        | Dark Value  | Usage                |
|--------------------|-------------|----------------------|
| `#FAFAF7` (bg)     | `#0D0D0D`   | Page background      |
| `#FFFFFF` (card)   | `#1A1A1A`   | Card backgrounds     |
| `#111111` (text)   | `#F0F0EC`   | Primary text         |
| `#666666` (sec)    | `#AAAAAA`   | Secondary text       |
| `#E8E8E4` (border) | `#2A2A2A`   | Dividers             |
| `#E0BA51` (gold)   | `#E0BA51`   | **Stays the same**   |
| `#000000` (black)  | `#F0F0EC`   | Inverted for headers |

---

## 4. FULL COPY DECK

### Header / Brand

```
Site name:    THE BUFF REPORT
Tagline:      Athletics. Academics. Every Headline. One Page.
Mobile tag:   Every CU Headline. One Page.
Alt tagline:  Boulder's Fastest Fan Feed.
```

### Section Headings

```
⚡ LATEST                    — Top stories, auto-refreshed
🏈 FOOTBALL                  — Buffs on the gridiron
🏀 BASKETBALL                — Men's & Women's Hoops
🎯 RECRUITING                — Pipeline & commitments
🔄 PORTAL / NIL              — Transfer news & deals
🎓 CAMPUS                    — CU Boulder life & academics
🏔️ AROUND BOULDER            — City news, nightlife, culture
🎙️ PODCASTS                  — Audio from the Buff universe
🔴 LIVE SCORES               — Real-time scoreboard
```

### Social Proof Line

```
Primary:   Join 5,200+ Buffs who read this every morning.
Alt A:     4,800+ CU fans get this in their inbox daily.
Alt B:     The fastest-growing CU fan newsletter. Free, forever.
Alt C:     Your fellow Buffs already know. Now you do too.
```
*(Use whichever number is closest to your real subscriber count — round down, never up)*

### CTA Buttons

```
Primary subscribe:    Subscribe Free →
Floating button:      📬 Daily Buff — Free
Popup headline:       Start Your Day Buff.
Popup sub:            Free daily email. CU athletics + campus + Boulder. 60 seconds to read.
Popup CTA:            Get My Free Daily Buff →
Popup legal:          No spam. Unsubscribe instantly. Join 5,200+ readers.
Already subscribed:   See Today's Issue →
```

### Breaking Bar

```
Template:   🔴 [LIVE] [HEADLINE TEXT] — [Source], [X] min ago
Example:    🔴 [LIVE] Colorado commits to 5-star WR Marcus Allen — On3, 12 min ago
```

### Footer

```
© 2026 The Buff Report · buffreport.com
Independent fan media. Not affiliated with the University of Colorado.
Made in Boulder. Go Buffs. 🦬

Links: Subscribe · Archive · About · Advertise · Contact
```

---

## 5. QUICK-WIN CODE SNIPPETS

### 5A — Sticky Tab Nav

```html
<!-- Replace your existing <nav> with this -->
<nav id="main-nav" class="sticky-nav">
  <div class="nav-bar">
    <a class="nav-link active" data-tab="latest">Latest</a>
    <a class="nav-link" data-tab="football">Football</a>
    <a class="nav-link" data-tab="basketball">Basketball</a>
    <a class="nav-link" data-tab="recruiting">Recruiting</a>
    <a class="nav-link" data-tab="portal">Portal/NIL</a>
    <a class="nav-link" data-tab="campus">Campus</a>
    <a class="nav-link" data-tab="town">Boulder</a>
    <a class="nav-link" data-tab="podcasts">Podcasts</a>
    <a class="nav-link live" data-tab="live">
      <span class="live-pulse"></span>Live
    </a>
  </div>
</nav>
```

```css
/* Sticky nav */
.sticky-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  background: #fff;
  border-bottom: 1px solid #e8e8e4;
  transition: box-shadow 0.2s;
}
.sticky-nav.scrolled {
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.nav-bar {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 16px;
  max-width: 1200px;
  margin: 0 auto;
}
.nav-bar::-webkit-scrollbar { display: none; }
.nav-link {
  flex-shrink: 0;
  padding: 14px 16px;
  font-family: 'Merriweather Sans', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #999;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.nav-link:hover { color: #111; }
.nav-link.active {
  color: #111;
  border-bottom-color: #E0BA51;
}
.nav-link.live { color: #DC2626; }
.live-pulse {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #DC2626;
  margin-right: 5px;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.3); }
}
```

```js
// Add scrolled class to nav
window.addEventListener('scroll', () => {
  document.getElementById('main-nav')
    .classList.toggle('scrolled', window.scrollY > 60);
});
```

---

### 5B — Dark Mode Toggle

```html
<!-- Add to header, next to subscribe button -->
<button id="dark-toggle" class="dark-toggle" aria-label="Toggle dark mode">
  <span class="icon-sun">☀️</span>
  <span class="icon-moon">🌙</span>
</button>
```

```css
/* Dark mode variables — added to :root override */
[data-theme="dark"] {
  --bg:            #0D0D0D;
  --bg-card:       #1A1A1A;
  --text:          #F0F0EC;
  --text-secondary:#AAAAAA;
  --text-muted:    #666666;
  --border:        #2A2A2A;
  --border-light:  #222222;
  --link:          #F0F0EC;
  --secondary:     #F0F0EC;
  --secondary-light:#1A1A1A;
}
[data-theme="dark"] body         { background: #0D0D0D; color: #F0F0EC; }
[data-theme="dark"] .site-header { background: #111; border-color: #2A2A2A; }
[data-theme="dark"] nav          { background: #111; border-color: #2A2A2A; }
[data-theme="dark"] .hl-card     { background: #1A1A1A; border-color: #2A2A2A; }
[data-theme="dark"] .widget      { background: #1A1A1A; }

/* Toggle button */
.dark-toggle {
  background: none;
  border: 1.5px solid #e8e8e4;
  border-radius: 9999px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: border-color 0.15s;
  line-height: 1;
}
.dark-toggle:hover { border-color: #E0BA51; }
[data-theme="dark"] .icon-sun  { display: inline; }
[data-theme="dark"] .icon-moon { display: none; }
[data-theme="light"] .icon-sun  { display: none; }
[data-theme="light"] .icon-moon { display: inline; }
```

```js
// Dark mode toggle — add to your script block
(function() {
  const toggle = document.getElementById('dark-toggle');
  const root   = document.documentElement;
  const saved  = localStorage.getItem('theme') || 'light';
  root.setAttribute('data-theme', saved);

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();
```

---

### 5C — Floating "Subscribe Free" Button

```html
<!-- Add just before </body> -->
<button id="float-sub" class="float-sub" onclick="document.getElementById('nl-overlay').style.display='flex'">
  📬 Daily Buff — Free
</button>
```

```css
.float-sub {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 500;
  background: #000000;
  color: #E0BA51;
  font-family: 'Merriweather Sans', sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 14px 22px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  transition: transform 0.2s, box-shadow 0.2s;
  animation: float-in 0.5s ease 3s both;
}
.float-sub:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.3);
}
@keyframes float-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Hide on mobile if subscribe popup already shows */
@media (max-width: 480px) {
  .float-sub { bottom: 16px; right: 16px; font-size: 12px; padding: 12px 18px; }
}
```

---

### 5D — Hero Image Rotator

```html
<!-- Replace your current hero section with this -->
<section class="hero-rotator" id="hero">
  <div class="hero-slides">
    <!-- Slide 1 — populated dynamically or manually -->
    <div class="hero-slide active" style="background-image: url('hero-football.jpg')">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="hero-pill">🏈 Football</span>
        <h2 class="hero-headline">Colorado's Season Preview: Can the Buffs Make the Playoff?</h2>
        <p class="hero-sub">Everything you need to know heading into fall camp.</p>
        <a href="#" class="btn-hero">Read Full Story →</a>
      </div>
    </div>
    <!-- Add more .hero-slide divs for additional stories -->
  </div>
  <div class="hero-dots" id="hero-dots"></div>
</section>
```

```css
.hero-rotator {
  position: relative;
  width: 100%;
  height: 420px;
  overflow: hidden;
  background: #111;
}
.hero-slides { position: relative; width: 100%; height: 100%; }
.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.hero-slide.active { opacity: 1; }
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top,
    rgba(0,0,0,0.88) 0%,
    rgba(0,0,0,0.4) 50%,
    rgba(0,0,0,0.1) 100%);
}
.hero-content {
  position: absolute;
  bottom: 48px;
  left: 40px;
  right: 40px;
  color: white;
}
.hero-pill {
  display: inline-block;
  background: #E0BA51;
  color: #000;
  font-family: 'Merriweather Sans', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}
.hero-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.25;
  color: white;
  margin-bottom: 10px;
  max-width: 640px;
}
.hero-sub {
  font-family: 'Merriweather Sans', sans-serif;
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  margin-bottom: 18px;
  max-width: 520px;
}
.btn-hero {
  display: inline-block;
  background: #E0BA51;
  color: #000;
  font-family: 'Merriweather Sans', sans-serif;
  font-size: 13px;
  font-weight: 800;
  padding: 10px 22px;
  border-radius: 9999px;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-hero:hover { background: #C9A43A; color: #000; }
.hero-dots {
  position: absolute;
  bottom: 18px;
  right: 40px;
  display: flex;
  gap: 6px;
}
.hero-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.hero-dot.active {
  background: #E0BA51;
  transform: scale(1.3);
}
@media (max-width: 640px) {
  .hero-rotator    { height: 240px; }
  .hero-headline   { font-size: 20px; }
  .hero-content    { bottom: 24px; left: 20px; right: 20px; }
  .hero-dots       { right: 20px; }
}
```

```js
// Hero rotator JS
(function() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('hero-dots');
  if (!slides.length) return;

  let current = 0;
  let timer;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'hero-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(d);
  });

  function goTo(n) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function startTimer() { timer = setInterval(next, 6000); }
  function stopTimer()  { clearInterval(timer); }

  document.querySelector('.hero-rotator')
    .addEventListener('mouseenter', stopTimer);
  document.querySelector('.hero-rotator')
    .addEventListener('mouseleave', startTimer);

  startTimer();
})();
```

---

### 5E — Thumbnail Placeholder (Article Cards)

```css
/* Add to your .hl-card style */
.hl-card {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: start;
  padding: 12px;
  border-radius: var(--radius);
  background: var(--bg-card);
  transition: background 0.15s;
}
.hl-card:hover { background: #f5f5f0; }

.hl-thumb {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  object-fit: cover;
  background: #e8e8e4;
  flex-shrink: 0;
}
.hl-thumb-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background: linear-gradient(135deg, #1a1a1a, #333);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
```

---

### 5F — Social Proof Badge

```html
<!-- Add to sidebar or below subscribe form -->
<div class="social-proof">
  <div class="sp-avatars">
    <div class="sp-av" style="background:#E0BA51;color:#000">R</div>
    <div class="sp-av" style="background:#2563EB;color:#fff">M</div>
    <div class="sp-av" style="background:#111;color:#E0BA51">K</div>
  </div>
  <div class="sp-text">
    <strong>5,200+ Buffs</strong> read this daily
    <span class="sp-stars">★★★★★</span>
  </div>
</div>
```

```css
.social-proof {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(224, 186, 81, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(224, 186, 81, 0.2);
  margin-top: 12px;
}
.sp-avatars { display: flex; }
.sp-av {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}
.sp-av:first-child { margin-left: 0; }
.sp-text {
  font-family: 'Merriweather Sans', sans-serif;
  font-size: 12px;
  color: #666;
}
.sp-text strong { color: #111; }
.sp-stars { color: #E0BA51; font-size: 11px; margin-left: 4px; }
```

---

## 6. ROLLOUT & TESTING PLAN

### Week 1 — Foundation (Do This First)

**Day 1–2: Sticky Nav + Dark Mode**
- Make the existing tab nav sticky (`position: sticky; top: 0; z-index: 200`)
- Add dark mode toggle + CSS variables (5B above)
- Commit, push, verify on mobile

**Day 3–4: Floating Subscribe Button**
- Drop in the floating button (5C above)
- Wire it to your existing `#nl-overlay` popup
- Add social proof badge below email input in popup

**Day 5–7: Visual Polish**
- Add `border-bottom: 3px solid #E0BA51` to site header
- Update section labels to use emoji icons (5 above)
- Add gold section dividers between content blocks
- Make `.hl-card` use the thumbnail grid layout (even if no image, use emoji placeholder)

---

### Week 2 — Impact Features

**Day 8–10: Hero Rotator**
- Add 3–4 static hero images (CU Athletics official photos are free for fan use)
- Implement the hero rotator (5D above)
- Place it above the main content grid

**Day 11–12: Mobile Audit**
- Test on iPhone SE, iPhone 14, Android (use browser DevTools)
- Verify horizontal scroll on nav, hero height on small screens, font sizes
- Fix any overflow issues

**Day 13–14: SEO & Performance**
- Update `<title>` to include current date or season: "The Buff Report | CU Buffs News — March 2026"
- Add `<meta name="theme-color" content="#E0BA51">`
- Add `loading="lazy"` to all images below the fold
- Add structured data (SiteNavigationElement schema)
- Run Lighthouse audit — target 90+ on mobile

---

### A/B Test Suggestions

| Test | Variant A | Variant B | Goal |
|------|-----------|-----------|------|
| CTA button | "Subscribe Free →" | "Get The Daily Buff" | Email signups |
| Floating button timing | Shows immediately | Delays 8s | Click rate |
| Hero height | 420px | 320px | Bounce rate |
| Dark mode default | Light default | Auto (prefers-color-scheme) | Retention |
| Section icons | No emoji | Emoji icons | Scroll depth |

---

### Performance / SEO Checklist

- [ ] Lighthouse Mobile score ≥ 90
- [ ] All images have `alt` text
- [ ] `<meta name="description">` under 160 characters
- [ ] Open Graph image is 1200×630px minimum
- [ ] `rel="noopener noreferrer"` on all external links
- [ ] `loading="lazy"` on all below-fold images
- [ ] Service worker caches critical assets
- [ ] No console errors
- [ ] Mobile tap targets ≥ 44×44px
- [ ] Contrast ratio ≥ 4.5:1 on all text
- [ ] HTTPS enforced (Cloudflare handles this ✓)
- [ ] `sitemap.xml` up to date ✓
- [ ] `robots.txt` allows indexing ✓

---

## 7. BONUS VISUAL ASSET PROMPTS

### Buffalo Logo Treatment

```
Midjourney / Flux prompt:
"A powerful charging bison rendered in a bold, graphic poster art style.
Gold metallic tones (#E0BA51) on pure black background. Sharp vector-style
linework, minimal detail, high contrast. The bison faces right, mid-charge,
front hooves raised. Rocky Mountain silhouette faintly visible in background.
No text. Square format. Style: modern sports logo, emblem, collegiate brand.
--ar 1:1 --style raw --stylize 750"
```

### Hero Photo — Football

```
"Aerial cinematic shot of Folsom Field stadium at golden hour, packed with
fans in black and gold. CU Buffaloes logo at midfield. Dramatic long shadows,
warm amber sky. Real photograph style, ultra high resolution.
--ar 16:9 --style raw"
```

### Hero Photo — Campus

```
"Wide angle view of CU Boulder campus with the Flatirons in the background
at sunrise. Gothic sandstone buildings, warm golden light, green lawns.
Students walking. Cinematic, editorial photography style.
--ar 16:9 --style raw"
```

### Hero Photo — Basketball

```
"CU Buffaloes basketball player mid-dunk in a packed arena, crowd on feet.
Motion blur on ball, sharp on player. Black and gold jersey. Dramatic
spotlight lighting. Sports photography style, shallow depth of field.
--ar 16:9 --style raw"
```

### Section Icons (for Figma)

```
DALL-E prompt for custom icons:
"A set of 8 minimal flat icons in black and gold: football helmet, basketball,
megaphone (recruiting), graduation cap (campus), mountains (Boulder),
microphone (podcasts), transfer arrows (portal), live broadcast signal (live).
Clean vector style, #E0BA51 gold on white. Icon sheet layout. No shadows."
```

### Background Texture

```
"Subtle repeating pattern of tiny buffalo silhouettes arranged in a grid,
very low opacity, warm off-white background. For use as a CSS background
texture on a sports news website. Seamless tile, 400×400px.
--tile --ar 1:1"
```

---

*Package complete. Every item above is implementation-ready. Start with Week 1 Day 1 (sticky nav + dark mode) — those two changes alone will transform the user experience in under 2 hours of work.*
