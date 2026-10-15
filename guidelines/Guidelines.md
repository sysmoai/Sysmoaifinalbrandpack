# SYSmoAI Brand OS — System Guidelines (for AI agents & developers)

## Locked identity — never modify
- The mark geometry, viewBox, variant colours and opacities live only in `src/app/brand/logo.ts`.
- The wordmark is Inter: **SYS** 700 / **mo** 400 at 65% opacity / **AI** 700. Tracking is −0.02 / −0.04 / 0.02em.
- The name is always written "SYSmoAI": never "Sysmo AI", "SYSMOAI" or "SysmoAI".

## Single sources of truth
| Concern | File |
|---|---|
| Logo paths, variants, stroke rule, clear space | `src/app/brand/logo.ts` |
| React `<Logo>` / `<Wordmark>` | `src/app/brand/Logo.tsx` |
| Colour, type, spacing tokens + CSS/JSON/Tailwind generators | `src/app/brand/tokens.ts` (mirrored in `src/styles/globals.css`) |
| Version, release, asset counts | `src/app/brand/meta.ts` |
| Raster/ICO/ZIP export pipeline | `src/app/brand/export.ts` |
| Business asset compositions & HTML templates | `src/app/brand/assets.ts` |
| Audit findings & approval items | `src/app/brand/audit.ts` |

Never paste logo paths, hex codes, counts or version strings into components. Import them.

## Tokens
- Canvas `#08090D`, surface `#111218`, deep navy `#0D1B3E`, primary `#2563EB`, accent-on-dark `#60A5FA`.
- Error: `#DC2626` on light surfaces, `#EF4444` on dark.
- Spacing uses a 4pt base on an 8pt rhythm: 4 8 12 16 24 32 48 64 96 128.
- Type scale is a major third (1.25) on a 16px base.

## Accessibility rules
- Readable text on dark must be at least `white/60` (5.9:1). Below 18px, prefer `white/70` or higher.
- `white/10–45` is for decorative borders and backgrounds only.
- Icon-only controls require an `aria-label`. SVG logos use `role="img"` with a `<title>`, and decorative ones use `aria-hidden`.
- Never remove focus outlines. The global `:focus-visible` ring uses `--ring`.
- All motion must respect `prefers-reduced-motion`.
- Minimum logo size is 16px. Clear space is 25% of the mark height.

## Export rules
- Always go through `renderBlob` / `renderMark`. They wait for fonts and draw the wordmark natively. Never put SVG `<text>` into a canvas.
- Multi-file exports must be built with `ZipBuilder`. Never trigger a loop of downloads.
- Filenames follow `sysmoai_{category}_{variant}_{w}x{h}[@Nx].{ext}` (lowercase, hyphenated slugs), via `assetName()`.
- JPEG quality is 0.95. JPEGs always get a solid background.

## Adding a new asset
1. Add an `AssetSpec` to `ASSETS` in `assets.ts`, using `centered()` or `editorial()` for the layout.
2. Bump `BUSINESS_ASSETS` in `meta.ts`.
3. It then appears automatically in the Brand OS Asset Center and in the ZIP packages.

## Approved brand facts vs implementation suggestions
**Approved facts (locked — founder approval required to change):** mark geometry and viewBox, the 4 variant colour/opacity sets, the wordmark construction above, the "SYSmoAI" spelling, the brand palette in `tokens.ts`.
**Implementation suggestions (may evolve without founder approval):** layout, spacing scale usage, export filenames, ZIP structure, component code, responsive behaviour.
**Pending founder decisions:** see the approval items in `src/app/brand/audit.ts` (stroke rule, "mo" opacity at small sizes, canonical navy/background, min size and clear space, legal line).

## SVG asset selection
- Dark backgrounds → `brand-dark`; light backgrounds → `brand-light`; single-colour print/emboss → `mono-black` / `mono-white`.
- App icons and favicons use the tile form (`logoSVG(v, size, { tile: true })`). Never hand-edit exported SVGs.

## Responsive rules
- Section padding `px-5 md:px-8 lg:px-12`. Grids collapse to 1 column below `sm`/`md`.
- Wide specimens/tables scroll horizontally (`overflow-x-auto`) and are never clipped. No horizontal page scroll at 320px.
- The logo never scales below 16px; wordmark lockups scroll rather than shrink below legibility.

## Incorrect usage (never)
Recolour, stretch, rotate, outline, add effects or shadows to the mark; re-typeset the wordmark in another font; change "mo" weight/opacity; place the mark on busy imagery without the tile; use AI-generated recreations of the logo.

## Change approval procedure
1. Open a change request describing the asset, the reason and a before/after render.
2. Locked items (above) need written founder approval before merge.
3. On approval: change only the source module, bump `BRAND_VERSION` in `meta.ts`, add a version-history entry, then re-export packages from the Brand OS section.

## Version history
| Version | Date | Change |
|---|---|---|
| 3.0.0 | October 2026 | Single source of truth (`src/app/brand/`), tokens in CSS, shared export pipeline (ZIP/ICO), Brand OS asset center, accessibility and responsive hardening. Mark geometry unchanged. |
| 2.1.0 | — | Prior release (pre-audit). |
