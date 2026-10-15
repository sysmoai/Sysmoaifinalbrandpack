# SYSmoAI® Brand Identity System — v3.0.0

A complete, interactive brand identity system built with React 18 + TypeScript + Tailwind CSS. Every section is export-ready: download logos, icons, social media assets, and design tokens directly from the browser.

## What's inside

| Section | Coverage |
|---------|----------|
| **Logo System** | 4 variants × horizontal + stacked lockups, construction grid, clear space, misuse rules |
| **Color System** | 11-stop brand blue ramp, 11-stop neutral ramp, semantic colors, 6 gradients, WCAG contrast audit |
| **Typography** | 11-step scale (Display XL → Overline), Inter + JetBrains Mono, wordmark construction |
| **Spacing & Layout** | 4px base grid, 16 tokens, 6 breakpoints, 4–12 column grid |
| **Social Media** | 14 platforms, 4 variants each = 56 profile PNGs + cover photos for FB/LinkedIn/YouTube/Discord |
| **Icon Export Center** | 121 files: Favicon (4 + .ico), Apple/iOS (18), Android (14), Desktop (14), Windows Tiles (4), PWA (2), Email (8), Social (56) |
| **Brand Voice** | Voice & tone pillars, writing guidelines, approved terminology |
| **UI Components** | Buttons, cards, forms, badges — all styled to brand spec |
| **Motion** | 4 easing curves, 5 duration tokens, transition patterns |
| **Applications** | Business card, LinkedIn banner, email signature, social post, proposal cover, brand pattern |
| **Design Tokens** | DTCG W3C format JSON, CSS custom properties, Tailwind config extension |
| **AI & Developer Guide** | Copy-ready CSS/React/Tailwind code, AI image prompts, brand brief, DTCG JSON |
| **Brand OS Asset Center** | OG/Twitter/hero, proposal cover + divider, 3 pitch slides, letterhead, GitHub/Notion/docs banners, business card (300 dpi + bleed), email signature, meeting background, invoice/letterhead HTML, tokens.css/json, Tailwind preset, favicon.ico, one-click ZIP |
| **System Audit Report** | Findings, fixes, asset inventory, approval items — also exported as `AUDIT.md` |

> Asset counts and version strings are generated from `src/app/brand/meta.ts`. The figures in this table are indicative only.

## Brand OS package structure

```
sysmoai_brand-os_v3.0.0.zip
  logo/{svg,png,lockups}/   4 variants · SVG + PNG at 1×/2×/3× · horizontal + stacked lockups
  icons/favicon/            favicon.ico (16/32/48) + favicon.svg
  web/  proposal/  docs/  ops/
  tokens/                   tokens.css · tokens.json (DTCG) · tailwind.preset.js
  AUDIT.md  README.txt
```
Filenames follow `sysmoai_{category}_{variant}_{w}x{h}[@Nx].{ext}`. See `guidelines/Guidelines.md` for every system rule.

## Getting started

```bash
# Install dependencies
pnpm install
# or: npm install

# Start dev server
pnpm dev
# or: npm run dev
# → http://localhost:5173
```

## Usage

**Navigation** — Collapsible sidebar on the right (56 sections, grouped by category). Search with the input box. Keyboard: `Cmd+\` collapses/expands, `Ctrl+↑/↓` moves between sections.

**Exporting assets** — Every section has individual export buttons (PNG/JPEG/SVG). Use Batch Export buttons for full sets. "Export All Assets" in the nav footer downloads 53 brand files at once.

**Copy tokens** — Click any hex swatch to copy the value. All code blocks have a COPY button.

## Stack

- React 18 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Vite 6
- Lucide React icons
- Canvas API for PNG/JPEG rasterization

## Structure

```
src/
  app/
    App.tsx                    # Root component
    brand/                     # SINGLE SOURCE OF TRUTH
      logo.ts  Logo.tsx        # Locked geometry + React components
      tokens.ts  meta.ts       # Tokens + versions/counts
      export.ts                # Canvas → PNG/JPEG, ICO + ZIP writers
      assets.ts  audit.ts      # Business compositions, audit data
    components/
      MarketplaceBrandSystem.tsx  # Orchestrator + IntersectionObserver + keyboard nav
      NavigationSystem.tsx        # Collapsible sidebar (56 sections)
      FinalBrandSystem.tsx        # Sections 01–13 (logo, color, social, QA)
      TaglineSystem.tsx           # Tagline variants + lockup presentations
      SocialMediaAssets.tsx       # 14 platforms, 4 variants, cover photos
      HighResIcons.tsx            # 120+ icon exports across 8 categories
      BrandSystemExpanded.tsx     # Sections 14–30 (extended system)
      BrandExtensions.tsx         # Applications (business card, email sig, etc.)
      BrandStyleGuide.tsx         # Quick-reference tear sheet
      AIAgentGuide.tsx            # System manual for AI agents & developers
  styles/
    index.css                  # Tailwind entry
    theme.css                  # Design tokens (CSS custom properties)
    fonts.css                  # Google Fonts imports
```

## License

© 2026 SYSmoAI. All rights reserved. Confidential — do not distribute without authorization.
