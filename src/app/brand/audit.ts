// Audit report data — rendered in-app and exported as AUDIT.md
import {
  BRAND_RELEASE, BRAND_VERSION, BUSINESS_FILE_COUNT, ICON_FILE_COUNT, LOGO_FILE_COUNT,
  SOCIAL_COVERS, SOCIAL_PROFILE_COUNT, TOTAL_EXPORTABLE_FILES,
} from "./meta";

export type Severity = "critical" | "high" | "medium" | "low";
export type Finding = { area: string; severity: Severity; issue: string; fix: string };

export const FINDINGS: Finding[] = [
  { area: "Geometry", severity: "critical", issue: "Logo paths and style tables were copied into 10 places (components, AI guide snippets, favicon).", fix: "There is now one definition, in src/app/brand/logo.ts. The React components, SVG strings and AI-guide snippets are all generated from it." },
  { area: "Geometry", severity: "high", issue: "There were three different optical stroke rules, so exported files did not match the on-screen previews.", fix: "One canonical strokeFor(size) rule: 3 at 32px or below, 2.5 at 64px or below, otherwise 2." },
  { area: "Geometry", severity: "medium", issue: "The favicon used stroke 2 at 32px, which is too thin, on a non-canonical #0A0B0F tile.", fix: "favicon.svg regenerated with stroke 3 on the #08090D tile." },
  { area: "Color", severity: "high", issue: "No brand tokens existed in CSS. Stock shadcn values were active and more than 125 hex codes were inlined.", fix: "Brand tokens added to the theme CSS and mapped onto the token contract (--background, --primary, --ring and so on). They are also available as Tailwind brand-* utilities." },
  { area: "Color", severity: "high", issue: "'Deep navy' had three definitions (#0D1B3E, #0C1A4A, #0A0B0F), and the canvas had two (#08090D, #0A0B0F).", fix: "Unified to #0D1B3E (deep navy) and #08090D (canvas)." },
  { area: "Color", severity: "medium", issue: "Two error reds were used without a rule.", fix: "#DC2626 on light surfaces, #EF4444 on dark." },
  { area: "Accessibility", severity: "critical", issue: "About 150 readable text instances used white at 15–40% opacity, roughly 1.6–3.2:1 contrast.", fix: "Readable text raised to white/60 or higher (at least 5.9:1). Lower opacities are kept only for decorative elements." },
  { area: "Accessibility", severity: "high", issue: "Icon-only buttons had no accessible names, SVGs had no titles, and there was no focus indicator (outline-none).", fix: "Added aria-labels, role=img with <title>, a global :focus-visible ring and a skip link." },
  { area: "Accessibility", severity: "medium", issue: "Smooth scrolling and animations ignored prefers-reduced-motion.", fix: "Added a global reduced-motion override, and JS smooth scrolling is now gated." },
  { area: "Typography", severity: "high", issue: "Inter, the wordmark typeface, was never loaded, so it fell back to SF Pro or a system font. Other fonts were injected late via <link> tags inside components.", fix: "Inter, Space Grotesk and JetBrains Mono are now loaded once in fonts.css. The canvas exporter waits for document.fonts before drawing." },
  { area: "Export", severity: "critical", issue: "Raster wordmarks were drawn from SVG <text>, which cannot use web fonts, so the wordmark rendered in the wrong typeface with guessed widths.", fix: "The wordmark is now drawn natively on the canvas with the loaded Inter, using the locked weights, tracking and opacity." },
  { area: "Export", severity: "high", issue: "The renderer was copy-pasted three times with differing JPEG quality. It used toDataURL and an early revokeObjectURL.", fix: "One pipeline in brand/export.ts: toBlob, JPEG quality 0.95, deferred revoke, toast feedback." },
  { area: "Export", severity: "high", issue: "Batch exports fired dozens of separate downloads in timed loops, which browsers block.", fix: "Every batch now downloads as a single ZIP (a built-in writer, no dependency) with a structured folder tree." },
  { area: "Export", severity: "medium", issue: "There was no .ico file, no 1×/2×/3× scales and no SVG logo package.", fix: "Added a favicon.ico generator (16/32/48), plus SVG and PNG at 1×, 2× and 3× for every variant and lockup." },
  { area: "Naming", severity: "medium", issue: "Stale counts (120+, 28 profiles, 50 sections, 32 checkpoints) and versions hardcoded in more than 6 places.", fix: "All counts and versions now come from brand/meta.ts." },
  { area: "Naming", severity: "low", issue: "Section numbers in the navigation disagreed with the headings (qa-audit, roadmap, final-qa).", fix: "Navigation and headings reconciled." },
  { area: "Naming", severity: "low", issue: "Export filenames followed no convention.", fix: "Canonical sysmoai_{category}_{variant}_{w}x{h}[@Nx].{ext}." },
  { area: "Business", severity: "high", issue: "The business card, signature and proposal existed only as previews. There was no OG image, pitch deck, letterhead, invoice, docs headers or downloadable tokens.", fix: "Added the Brand OS Asset Center with real exports for web, proposal, docs and operations." },
];

export const APPROVALS = [
  { id: 1, item: "Canonical optical stroke rule", detail: "Three rules existed. The adopted rule (≤32 → 3, ≤64 → 2.5, else 2) matched 7 of the 10 copies. It changes the 64–128px exports from stroke 2.5 to 2." },
  { id: 2, item: "Wordmark 'mo' at 65% opacity", detail: "This is roughly 3.9:1 at small sizes on #08090D. Proposal: a solid-'mo' micro variant below 24px. Not applied, because the wordmark is locked." },
  { id: 3, item: "Canonical deep navy and canvas", detail: "#0D1B3E and #08090D were adopted. Confirm that the retired #0C1A4A and #0A0B0F are not used in any printed collateral." },
  { id: 4, item: "Minimum size and clear space", detail: "Set at 16px minimum and 25% of mark height clear space. Confirm against legal and print requirements." },
  { id: 5, item: "Contact details and legal lines", detail: "hello@sysmoai.com and sysmoai.com are placeholders. A trademark line and the 'CONFIDENTIAL' label policy need sign-off before marketplace release." },
  { id: 6, item: "Tagline weight", detail: "Exports set Space Grotesk at weight 400. The on-screen spec uses 300, which falls below WCAG at 12px and smaller. Confirm 400 as the production floor." },
];

export const ASSET_INVENTORY = [
  { group: "Logo package", count: LOGO_FILE_COUNT, detail: "4 variants × SVG + PNG at 1×/2×/3×, plus horizontal and stacked lockups" },
  { group: "Icon Export Center", count: ICON_FILE_COUNT, detail: `Favicon (including .ico), Apple (dark and light), Android, Desktop, Windows, PWA, Email, plus ${SOCIAL_PROFILE_COUNT} social profiles (14 platforms × 4 variants)` },
  { group: "Social covers", count: SOCIAL_COVERS.length, detail: SOCIAL_COVERS.join(", ") },
  { group: "Business assets", count: BUSINESS_FILE_COUNT, detail: "Web, proposal and pitch, docs, operations (PNG + HTML + tokens)" },
];

export function auditMarkdown() {
  const sev = (s: Severity) => s.toUpperCase();
  return `# SYSmoAI Brand OS — Audit Report
Version ${BRAND_VERSION} · ${BRAND_RELEASE}

## Summary
${FINDINGS.length} findings: ${FINDINGS.filter((f) => f.severity === "critical").length} critical, ${FINDINGS.filter((f) => f.severity === "high").length} high. All resolved, except for the items awaiting approval below. The logo geometry, wordmark and colour identity are unchanged.

## Findings & fixes
| Area | Severity | Issue | Fix |
|---|---|---|---|
${FINDINGS.map((f) => `| ${f.area} | ${sev(f.severity)} | ${f.issue} | ${f.fix} |`).join("\n")}

## Asset inventory (${TOTAL_EXPORTABLE_FILES} exportable files)
${ASSET_INVENTORY.map((a) => `- **${a.group}** — ${a.count} files: ${a.detail}`).join("\n")}

## Unresolved approval items
${APPROVALS.map((a) => `${a.id}. **${a.item}** — ${a.detail}`).join("\n")}

## Locked (do not modify)
- Hexagon paths and viewBox in \`src/app/brand/logo.ts\`
- Layer fill and stroke colours and opacities per variant
- Wordmark: Inter, SYS 700 / mo 400 @ 65% / AI 700, tracking -0.02 / -0.04 / 0.02em
`;
}
