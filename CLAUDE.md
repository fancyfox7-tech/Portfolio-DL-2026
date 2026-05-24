# DL_ Portfolio — Claude Code Instructions

This is the personal portfolio of Desi Lazova, Lead Product Designer.
Read this file fully before touching any code. Every decision here is intentional.

---

## Project Overview

**Designer:** Desi Lazova (`DL_`)
**Stack:** React + Tailwind CSS + Vite
**Deployment:** Netlify (via GitHub)
**Figma source:** Single Figma file, all screens on one page
**North star:** "I simplify complexity for people."

---

## File Structure

```
src/
├── components/
│   ├── ui/              # Button, Tag, Divider — primitives only
│   ├── layout/          # Nav, Footer, PageWrapper
│   ├── case-study/      # CaseStudyHero, CaseStudySection, ProcessStep
│   └── home/            # Hero, WorkIndex, HowIWork, About, Contact
├── pages/
│   ├── index.jsx        # Landing page
│   └── work/
│       ├── omniva.jsx
│       ├── vmware.jsx
│       ├── documaster.jsx
│       └── portfolio.jsx
├── data/
│   └── cases.js         # Case study metadata (title, tags, slug, summary)
├── styles/
│   └── globals.css      # Tailwind base + CSS custom properties
public/
├── images/              # All case study and hero images
└── CV_Desi_Lazova.pdf
tailwind.config.js
CLAUDE.md                # This file
```

---

## Design Tokens (locked — do not deviate)

Always use CSS custom properties. Never hardcode hex values in components.

```css
/* globals.css */
:root {
  --color-bg:       #FFFFFF;
  --color-text:     #111111;
  --color-accent:   #A63D1F;
  --color-border:   rgba(0, 0, 0, 0.1);
  --color-surface:  #F5F5F5;

  --font-mono: 'Fira Code', monospace;
  --font-sans: 'Inter', sans-serif;

  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      bg:      'var(--color-bg)',
      text:    'var(--color-text)',
      accent:  'var(--color-accent)',
      border:  'var(--color-border)',
      surface: 'var(--color-surface)',
    },
    fontFamily: {
      mono: ['Fira Code', 'monospace'],
      sans: ['Inter', 'sans-serif'],
    },
  }
}
```

---

## Color Rules

- `#A63D1F` is the ONLY accent. No other colors. No gradients.
- Terracotta is used on: "for people." hero text, active nav link, CTA hover, card bottom border on hover, contact headline "together."
- Never on: body text, decorative fills, backgrounds, more than one element per viewport.
- **All text is `#111111`.** No muted tones, no opacity-based secondary text. Hierarchy comes from size and weight only.

---

## Typography Rules

Two fonts only. Nothing else.

| Use | Font | Weights |
|-----|------|---------|
| `DL_` mark, nav links, section labels `01 /`, tags `[Tag_]`, metadata | Fira Code | 400, 500 |
| Headlines, body, cards, CTAs, everything else | Inter | 400, 600, 700, 800 |

### Type scale
```
Hero bold    72–80px   Inter 800    "for people."     #A63D1F
Hero light   64–72px   Inter 400    "I simplify complexity"  #111111
H1           48px      Inter 700    Page titles
H2           32px      Inter 600    Section headers
H3           20px      Inter 600    Card titles
Body-lg      18px      Inter 400    Case study body
Body         16px      Inter 400    Standard
Label        14px      Fira Code    Tags, metadata, nav
Caption      13px      Inter 400    Dates, secondary info
Mark         16px      Fira Code 500   DL_ in nav
```

### Typography rules
- No italic. Ever.
- Sentence case always. `DL_` is the only exception.
- Section labels: Fira Code + slash — `01 /` `02 /` `03 /`
- Tags: bracket notation — `[UX Strategy_]` `[AI Agent_]` `[Fintech_]`

---

## Button Rules

- **All buttons are pill-shaped.** `border-radius: 999px` always.
- Never square corners. Never 8px rounded. Only full pills.
- Primary: solid `#111111` fill, white text. Hover: fills with `#A63D1F`.
- Secondary: no fill, `#111111` border. Hover: border and text become `#A63D1F`.
- Transition: 300ms, `var(--ease-standard)`.

---

## Background System

### Dot grid (applied to hero section)
```css
background-image: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
background-size: 22px 22px;
mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
-webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
```

### Pulsing gradient overlay (hero only)
```css
@keyframes gradientPulse {
  0%, 100% { opacity: 0.04; transform: scale(1); }
  50%       { opacity: 0.07; transform: scale(1.04); }
}
.bg-pulse {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 70% 60% at 65% 35%, #A63D1F, transparent);
  animation: gradientPulse 10s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
@media (prefers-reduced-motion: reduce) {
  .bg-pulse { animation: none; opacity: 0.04; }
}
```

---

## Navigation (shared component)

`DL_` left (Fira Code 500, `#111111`) | `Work · About · Contact · Download CV` right (Fira Code 400, 14px)
- Active link: `#A63D1F`
- Sticky, backdrop blur on scroll
- Back button on case study pages: `← Back` left-aligned, links to homepage Work section

---

## Case Study Cards (homepage)

Images are grayscale by default. Color reveals on hover. Terracotta bottom border animates in.

```css
.card-image {
  filter: grayscale(100%) contrast(1.05);
  transition: filter 0.45s var(--ease-standard);
}
.card:hover .card-image {
  filter: grayscale(0%);
}
.card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: #A63D1F;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s var(--ease-standard);
}
.card:hover::after { transform: scaleX(1); }
```

### Card anatomy
```
[Image — grayscale, 16:9]
01                          Fira Code 400, #111111
Project · Context           Inter 600, 20px
One-line summary            Inter 400, 16px
[Tag_] [Tag_]               Fira Code 400, 13px, border box
```

---

## Pages

### Landing page (index.jsx)
Sections in order:
1. Nav
2. Hero — headline, portrait (circle crop, right-aligned), two CTAs
3. Selected Work — 4 cards
4. How I Work — 3 columns with `01 /` labels
5. About — copy block + LinkedIn link
6. Contact — "Let's work / together." + email + LinkedIn + Download CV
7. Footer — `DL_ · 2026` left, `I simplify complexity for people.` right

### Case study pages (work/*.jsx)
Sections in order:
1. Nav (shared, with back button)
2. Case study hero — title, one-liner, role/timeline/company metadata
3. Content sections — vary per case study, built from Figma
4. Footer (shared)

---

## Image Handling

- Build all pages with placeholder images first (`/images/placeholder.jpg` or grey div with correct aspect ratio)
- Swap real images after layout is confirmed
- All case study images in `/public/images/[case-study-name]/`
- Portrait: `/public/images/portrait.png` (circle crop applied via CSS, not image editing)
- Images in cards: always 16:9 ratio

---

## Motion Rules

- UI interactions: 300–450ms
- Page elements on load: 600–800ms
- Ambient/background: 10s+
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` always
- One animation focal point per viewport
- Always implement `prefers-reduced-motion: reduce` — disable or freeze animations

---

## What Not To Do

- No hardcoded hex values in JSX or Tailwind classes — use CSS variables
- No inline styles — Tailwind classes only
- No secondary text colors — all text is `#111111`, hierarchy via size/weight
- No italic type
- No drop shadows
- No square or rounded-rectangle buttons — pills only
- No other fonts — Fira Code and Inter only
- No decorative use of terracotta — it is punctuation, not decoration
- No lorem ipsum — use real placeholder text from `cases.js`
- Do not rewrite the About copy without explicit instruction

---

## Workflow

1. Read Figma frame for the section being built
2. Map to existing components where possible
3. Build new component in the correct folder if needed
4. Use tokens from CSS variables and Tailwind config
5. Build with placeholder images — never block layout on missing assets
6. Check brand consistency checklist before marking a section done

### Brand consistency checklist (run before every commit)
- [ ] Terracotta appears once per viewport, on the right element
- [ ] `DL_` mark is Fira Code, black, unmodified
- [ ] Hero: Inter 400 light + Inter 800 terracotta — never same weight
- [ ] Card images are grayscale, reveal color on hover
- [ ] No italic type anywhere
- [ ] No drop shadows anywhere
- [ ] All text is `#111111`
- [ ] All buttons are pill-shaped
- [ ] Dot grid present on hero, fades to edges
- [ ] Tags use `[bracket_]` notation
- [ ] Sections use `01 /` slash notation
- [ ] `prefers-reduced-motion` respected on all animations
