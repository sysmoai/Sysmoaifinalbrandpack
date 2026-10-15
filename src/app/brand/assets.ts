// ============================================================================
// SYSmoAI — business asset compositions (web, proposal, docs, operations)
// Every composition is built from locked logo data + tokens only.
// ============================================================================
import { LOGO_VARIANTS, logoSVG, VARIANT_BG, type LogoVariant } from "./logo";
import { palette } from "./tokens";
import { BRAND_RELEASE, BRAND_VERSION } from "./meta";
import type { Layer } from "./export";

export const TAGLINE = "Systems in Motion.";

export type Composition = { w: number; h: number; bg: string; layers: Layer[] };
export type AssetGroup = "web" | "proposal" | "docs" | "ops";

export type AssetSpec = {
  id: string;
  group: AssetGroup;
  label: string;
  usage: string;
  w: number;
  h: number;
  /** Print assets expose physical size */
  print?: string;
  compose: () => Composition;
};

const W60 = "rgba(255,255,255,0.60)";
const W72 = "rgba(255,255,255,0.72)";
const W10 = "rgba(255,255,255,0.10)";

const mark = (variant: LogoVariant, x: number, y: number, s: number): Layer => ({
  kind: "svg", svg: logoSVG(variant, s), x, y, w: s, h: s,
});

/** Centered hero: mark + wordmark + tagline over a soft brand glow. */
function centered(w: number, h: number, opts: { tagline?: string; scale?: number; light?: boolean } = {}): Composition {
  const u = Math.min(w, h) * (opts.scale ?? 1);
  const markSize = u * 0.26;
  const word = u * 0.11;
  const total = markSize + word * 1.1 + (opts.tagline ? word * 0.9 : 0);
  const top = (h - total) / 2;
  const light = opts.light;
  const layers: Layer[] = [
    { kind: "glow", x: w / 2, y: h * 0.42, r: Math.max(w, h) * 0.55, color: light ? "rgba(37,99,235,0.08)" : "rgba(37,99,235,0.22)" },
    mark(light ? "brand-light" : "brand-dark", (w - markSize) / 2, top, markSize),
    { kind: "wordmark", x: w / 2, y: top + markSize + word * 1.05, size: word, color: light ? palette.ink : "#FFFFFF", align: "center" },
  ];
  if (opts.tagline)
    layers.push({
      kind: "text", text: opts.tagline, x: w / 2, y: top + markSize + word * 2, size: word * 0.36,
      color: light ? "#334155" : palette.slate400, family: "'Space Grotesk', Inter, sans-serif", align: "center", weight: 400,
    });
  return { w, h, bg: light ? "#FFFFFF" : palette.bg, layers };
}

/** Editorial left-aligned layout for covers, slides and banners. */
function editorial(
  w: number, h: number,
  t: { eyebrow: string; title: string; sub?: string; footer?: string; light?: boolean },
): Composition {
  const u = h;
  const pad = Math.round(Math.min(w, h) * 0.09);
  const light = t.light;
  const fg = light ? palette.ink : "#FFFFFF";
  const sub = light ? "#334155" : W72;
  const mute = light ? "#64748B" : W60;
  const ms = Math.round(u * 0.07);
  const layers: Layer[] = [
    { kind: "glow", x: w * 0.88, y: h * 0.12, r: Math.max(w, h) * 0.6, color: light ? "rgba(37,99,235,0.07)" : "rgba(37,99,235,0.2)" },
    mark(light ? "brand-light" : "brand-dark", pad, pad, ms),
    { kind: "wordmark", x: pad + ms * 1.25, y: pad + ms * 0.68, size: ms * 0.5, color: fg },
    { kind: "text", text: t.eyebrow.toUpperCase(), x: pad, y: h * 0.48, size: u * 0.022, color: light ? palette.blue600 : palette.blue400, family: "'JetBrains Mono', monospace", weight: 500, tracking: u * 0.004 },
    { kind: "text", text: t.title, x: pad, y: h * 0.48 + u * 0.085, size: u * 0.068, color: fg, weight: 700, tracking: -u * 0.0015 },
  ];
  if (t.sub) layers.push({ kind: "text", text: t.sub, x: pad, y: h * 0.48 + u * 0.15, size: u * 0.028, color: sub, weight: 400 });
  layers.push({ kind: "rect", x: pad, y: h - pad - u * 0.04, w: w - pad * 2, h: Math.max(1, u * 0.0015), color: light ? "rgba(10,15,30,0.12)" : W10 });
  layers.push({ kind: "text", text: t.footer ?? `SYSmoAI · ${TAGLINE}`, x: pad, y: h - pad, size: u * 0.018, color: mute, family: "'JetBrains Mono', monospace" });
  layers.push({ kind: "text", text: `v${BRAND_VERSION}`, x: w - pad, y: h - pad, size: u * 0.018, color: mute, family: "'JetBrains Mono', monospace", align: "right" });
  return { w, h, bg: light ? "#FFFFFF" : palette.bg, layers };
}

// Print: 300 dpi
const DPI = 300;
const inch = (n: number) => Math.round(n * DPI);
const BLEED = 0.125;

export const ASSETS: AssetSpec[] = [
  // — WEBSITE —
  { id: "og-image", group: "web", label: "Open Graph image", usage: "<meta property=og:image>", w: 1200, h: 630, compose: () => centered(1200, 630, { tagline: TAGLINE, scale: 1.05 }) },
  { id: "twitter-card", group: "web", label: "X / Twitter card", usage: "summary_large_image", w: 1600, h: 900, compose: () => centered(1600, 900, { tagline: TAGLINE }) },
  { id: "hero-bg", group: "web", label: "Website hero", usage: "Landing page hero, 2× retina", w: 2560, h: 1440, compose: () => centered(2560, 1440, { tagline: TAGLINE, scale: 0.9 }) },

  // — PROPOSAL —
  { id: "proposal-cover", group: "proposal", label: "Proposal cover (A4)", usage: "Client proposals, 300 dpi", w: 2480, h: 3508, print: "210 × 297 mm",
    compose: () => editorial(2480, 3508, { eyebrow: "Proposal · Confidential", title: "Client Name", sub: "Systems architecture & AI integration", footer: `Prepared ${BRAND_RELEASE}` }) },
  { id: "proposal-divider", group: "proposal", label: "Section divider (A4)", usage: "Between proposal chapters", w: 2480, h: 3508, print: "210 × 297 mm",
    compose: () => editorial(2480, 3508, { eyebrow: "Section 02", title: "Approach", sub: "How we build systems in motion" }) },
  { id: "slide-title", group: "proposal", label: "Pitch slide — title", usage: "Keynote / Slides / PowerPoint 16:9", w: 1920, h: 1080,
    compose: () => editorial(1920, 1080, { eyebrow: "Pitch deck", title: "Intelligent systems, shipped.", sub: TAGLINE }) },
  { id: "slide-content", group: "proposal", label: "Pitch slide — content", usage: "Content master, light", w: 1920, h: 1080,
    compose: () => editorial(1920, 1080, { eyebrow: "01 — Problem", title: "Headline goes here", sub: "Supporting line, max 80 characters.", light: true }) },
  { id: "slide-closing", group: "proposal", label: "Pitch slide — closing", usage: "Final slide", w: 1920, h: 1080, compose: () => centered(1920, 1080, { tagline: "Thank you." }) },
  { id: "letterhead", group: "proposal", label: "Letterhead (A4)", usage: "Letters & statements of work", w: 2480, h: 3508, print: "210 × 297 mm",
    compose: () => {
      const w = 2480, h = 3508, pad = 236;
      return { w, h, bg: "#FFFFFF", layers: [
        mark("brand-light", pad, pad, 150),
        { kind: "wordmark", x: pad + 190, y: pad + 102, size: 74, color: palette.ink },
        { kind: "rect", x: pad, y: pad + 230, w: w - pad * 2, h: 3, color: "rgba(10,15,30,0.12)" },
        { kind: "rect", x: pad, y: pad + 230, w: 240, h: 6, color: palette.blue600 },
        { kind: "text", text: "hello@sysmoai.com  ·  sysmoai.com", x: pad, y: h - pad, size: 40, color: "#64748B", family: "'JetBrains Mono', monospace" },
      ] };
    } },

  // — DOCS —
  { id: "github-banner", group: "docs", label: "GitHub / README banner", usage: "Social preview & README header", w: 1280, h: 640, compose: () => centered(1280, 640, { tagline: TAGLINE, scale: 1.05 }) },
  { id: "notion-cover", group: "docs", label: "Notion cover", usage: "Workspace & wiki pages", w: 1500, h: 600, compose: () => centered(1500, 600, { tagline: TAGLINE, scale: 1.05 }) },
  { id: "docs-header", group: "docs", label: "Docs header", usage: "Documentation site, Confluence", w: 2400, h: 480,
    compose: () => editorial(2400, 480, { eyebrow: "Documentation", title: "SYSmoAI Developer Docs" }) },

  // — OPERATIONS —
  { id: "card-front", group: "ops", label: "Business card — front", usage: "3.5 × 2 in + 0.125 in bleed", w: inch(3.5 + BLEED * 2), h: inch(2 + BLEED * 2), print: "3.75 × 2.25 in (incl. bleed)",
    compose: () => { const w = inch(3.75), h = inch(2.25); return centered(w, h, { scale: 1.15 }); } },
  { id: "card-back", group: "ops", label: "Business card — back", usage: "Safe zone 0.125 in inside trim", w: inch(3.75), h: inch(2.25), print: "3.75 × 2.25 in (incl. bleed)",
    compose: () => {
      const w = inch(3.75), h = inch(2.25), safe = inch(BLEED * 2 + 0.05);
      return { w, h, bg: "#FFFFFF", layers: [
        mark("brand-light", safe, safe, 90),
        { kind: "text", text: "Full Name", x: safe, y: h * 0.62, size: 64, color: palette.ink, weight: 700 },
        { kind: "text", text: "Role / Title", x: safe, y: h * 0.62 + 64, size: 38, color: "#334155" },
        { kind: "text", text: "name@sysmoai.com", x: safe, y: h - safe, size: 32, color: palette.blue600, family: "'JetBrains Mono', monospace" },
      ] };
    } },
  { id: "signature", group: "ops", label: "Email signature image", usage: "Pair with the HTML signature", w: 600, h: 160,
    compose: () => ({ w: 600, h: 160, bg: "#FFFFFF", layers: [
      mark("brand-light", 24, 32, 96),
      { kind: "rect", x: 140, y: 36, w: 2, h: 88, color: "rgba(10,15,30,0.12)" },
      { kind: "wordmark", x: 164, y: 80, size: 36, color: palette.ink },
      { kind: "text", text: TAGLINE, x: 164, y: 112, size: 16, color: "#334155", family: "'Space Grotesk', Inter, sans-serif" },
    ] }) },
  { id: "meeting-bg", group: "ops", label: "Zoom / Meet background", usage: "Brand kept top-right, clear of face zone", w: 1920, h: 1080,
    compose: () => ({ w: 1920, h: 1080, bg: palette.bg, layers: [
      { kind: "glow", x: 1700, y: 120, r: 1200, color: "rgba(37,99,235,0.18)" },
      mark("brand-dark", 1752, 72, 96),
      { kind: "wordmark", x: 1520, y: 136, size: 40, color: "#FFFFFF" },
    ] }) },
];

export const GROUP_LABEL: Record<AssetGroup, string> = {
  web: "Website",
  proposal: "Proposal & Pitch",
  docs: "Docs",
  ops: "Operations",
};

// ---------------------------------------------------------------------------
// Logo package compositions
// ---------------------------------------------------------------------------
export function lockupComposition(variant: LogoVariant, kind: "horizontal" | "stacked", transparent = false): Composition {
  const color = variant === "brand-light" || variant === "mono-black" ? palette.ink : "#FFFFFF";
  if (kind === "horizontal") {
    const w = 1200, h = 360, ms = 220;
    return { w, h, bg: transparent ? "" : VARIANT_BG[variant], layers: [
      mark(variant, 90, (h - ms) / 2, ms),
      { kind: "wordmark", x: 90 + ms + 50, y: h / 2 + 46, size: 128, color },
    ] };
  }
  const w = 800, h = 800, ms = 340;
  return { w, h, bg: transparent ? "" : VARIANT_BG[variant], layers: [
    mark(variant, (w - ms) / 2, 150, ms),
    { kind: "wordmark", x: w / 2, y: 150 + ms + 140, size: 120, color, align: "center" },
  ] };
}

export { LOGO_VARIANTS };

// ---------------------------------------------------------------------------
// HTML templates (copy-paste / print-to-PDF)
// ---------------------------------------------------------------------------
const markInline = (v: LogoVariant, s: number) => logoSVG(v, s);

export function signatureHTML(name = "Full Name", role = "Role / Title", email = "name@sysmoai.com") {
  // Table-based + inline styles for Gmail / Outlook compatibility.
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Inter,Arial,sans-serif;color:#0A0F1E">
  <tr>
    <td style="padding-right:16px;border-right:2px solid #E2E8F0;vertical-align:middle">
      <img src="https://sysmoai.com/brand/sysmoai_icons_email_brand-light_96x96.png" width="48" height="48" alt="SYSmoAI" style="display:block"/>
    </td>
    <td style="padding-left:16px;vertical-align:middle">
      <div style="font-size:15px;font-weight:700;line-height:20px">${name}</div>
      <div style="font-size:13px;color:#334155;line-height:18px">${role} · SYSmoAI</div>
      <div style="font-size:13px;line-height:18px"><a href="mailto:${email}" style="color:#2563EB;text-decoration:none">${email}</a></div>
    </td>
  </tr>
</table>`;
}

const docShell = (title: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: Inter, system-ui, sans-serif; color: #0A0F1E; margin: 0; padding: 20mm; max-width: 170mm; }
  .head { display:flex; align-items:center; gap:14px; border-bottom:1px solid #E2E8F0; padding-bottom:18px; margin-bottom:32px; }
  .wm { font-size:22px; letter-spacing:-0.5px } .wm b{font-weight:700} .wm i{font-style:normal;font-weight:400;opacity:.65}
  .mono { font-family:'JetBrains Mono',monospace; font-size:11px; color:#64748B; letter-spacing:.08em; text-transform:uppercase }
  table.items { width:100%; border-collapse:collapse; margin-top:24px; font-size:13px }
  table.items th { text-align:left; border-bottom:2px solid #0A0F1E; padding:8px 0 }
  table.items td { border-bottom:1px solid #E2E8F0; padding:10px 0 }
  .r { text-align:right } .total { font-size:18px; font-weight:700 }
  .accent { color:#2563EB }
</style></head><body>
<div class="head">${markInline("brand-light", 40)}<span class="wm"><b>SYS</b><i>mo</i><b>AI</b></span></div>
${body}
</body></html>`;

export const letterheadHTML = () => docShell("SYSmoAI Letterhead", `
<p class="mono">${BRAND_RELEASE}</p>
<p>Dear [Recipient],</p>
<p>[Body copy — Inter 11pt, 1.5 line height. Keep letters to a single page where possible.]</p>
<p>Kind regards,<br><b>[Name]</b><br>[Role], SYSmoAI</p>
<p class="mono" style="margin-top:80px">hello@sysmoai.com · sysmoai.com</p>`);

export const invoiceHTML = () => docShell("SYSmoAI Invoice", `
<div style="display:flex;justify-content:space-between">
  <div><p class="mono">Invoice</p><h1 style="margin:4px 0 0;font-size:32px">INV-0001</h1></div>
  <div class="r"><p class="mono">Issued</p><p>[DD Mon YYYY]</p><p class="mono">Due</p><p>[DD Mon YYYY]</p></div>
</div>
<p class="mono" style="margin-top:32px">Bill to</p><p>[Client name]<br>[Address]</p>
<table class="items"><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
<tbody>
<tr><td>Systems architecture sprint</td><td class="r">1</td><td class="r">0.00</td><td class="r">0.00</td></tr>
<tr><td>AI integration</td><td class="r">1</td><td class="r">0.00</td><td class="r">0.00</td></tr>
</tbody></table>
<p class="r total" style="margin-top:24px">Total <span class="accent">0.00</span></p>
<p class="mono" style="margin-top:64px">Payment details · [Bank / IBAN] · Thank you</p>`);

export const webManifest = () => JSON.stringify({
  name: "SYSmoAI", short_name: "SYSmoAI", theme_color: palette.blue600, background_color: palette.bg, display: "standalone",
  icons: [192, 512].map((s) => ({ src: `/icons/pwa/sysmoai_icons_pwa_${s}x${s}.png`, sizes: `${s}x${s}`, type: "image/png" }))
    .concat([{ src: "/icons/pwa/sysmoai_icons_pwa-maskable_512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" } as never]),
}, null, 2);

export const headSnippet = () => `<!-- SYSmoAI — paste into <head> -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${palette.bg}">
<meta property="og:image" content="/sysmoai_web_og-image_1200x630.png">
<meta name="twitter:card" content="summary_large_image">
`;

export { LOGO_VARIANTS as ALL_LOGO_VARIANTS };
export type { LogoVariant };
