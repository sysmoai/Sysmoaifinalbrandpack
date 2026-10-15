// ============================================================================
// SYSmoAI — LOCKED LOGO GEOMETRY (single source of truth)
// Do not edit paths, opacities or colours without brand-owner approval.
// ============================================================================

export const LOGO_VIEWBOX = "0 0 100 100";

export const LOGO_PATHS = [
  "M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z", // Layer 1 — infrastructure
  "M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z", // Layer 2 — orchestration
  "M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z", // Layer 3 — intelligence core
] as const;

export type LogoVariant = "brand-dark" | "brand-light" | "mono-white" | "mono-black";
export const LOGO_VARIANTS: LogoVariant[] = ["brand-dark", "brand-light", "mono-white", "mono-black"];

type LayerStyle = { fill: string; fillOp: number; stroke: string; strokeOp: number };

export const LOGO_STYLES: Record<LogoVariant, [LayerStyle, LayerStyle, LayerStyle]> = {
  "brand-dark": [
    { fill: "#1E3A8A", fillOp: 0.3, stroke: "#2563EB", strokeOp: 0.6 },
    { fill: "#2563EB", fillOp: 0.5, stroke: "#3B82F6", strokeOp: 0.8 },
    { fill: "#3B82F6", fillOp: 1, stroke: "#60A5FA", strokeOp: 1 },
  ],
  "brand-light": [
    { fill: "#1E3A8A", fillOp: 0.08, stroke: "#1E40AF", strokeOp: 0.35 },
    { fill: "#2563EB", fillOp: 0.15, stroke: "#2563EB", strokeOp: 0.55 },
    { fill: "#1E3A8A", fillOp: 0.85, stroke: "#1E3A8A", strokeOp: 1 },
  ],
  "mono-white": [
    { fill: "#FFFFFF", fillOp: 0.12, stroke: "#FFFFFF", strokeOp: 0.5 },
    { fill: "#FFFFFF", fillOp: 0.3, stroke: "#FFFFFF", strokeOp: 0.7 },
    { fill: "#FFFFFF", fillOp: 1, stroke: "#FFFFFF", strokeOp: 1 },
  ],
  "mono-black": [
    { fill: "#000000", fillOp: 0.08, stroke: "#000000", strokeOp: 0.4 },
    { fill: "#000000", fillOp: 0.2, stroke: "#000000", strokeOp: 0.6 },
    { fill: "#000000", fillOp: 0.9, stroke: "#000000", strokeOp: 1 },
  ],
};

/** Optical stroke compensation (canonical rule — approval item #1). */
export const strokeFor = (size: number) => (size <= 32 ? 3 : size <= 64 ? 2.5 : 2);

/** Recommended background per variant. */
export const VARIANT_BG: Record<LogoVariant, string> = {
  "brand-dark": "#08090D",
  "brand-light": "#FFFFFF",
  "mono-white": "#08090D",
  "mono-black": "#FFFFFF",
};

export const MIN_SIZE_PX = 16;
/** Clear space = 25% of mark height on every side. */
export const CLEAR_SPACE_RATIO = 0.25;

/** Inner <path> markup for embedding inside another SVG. */
export function logoPathsMarkup(variant: LogoVariant, size: number) {
  const sw = strokeFor(size);
  return LOGO_PATHS.map((d, i) => {
    const s = LOGO_STYLES[variant][i];
    return `<path d="${d}" fill="${s.fill}" fill-opacity="${s.fillOp}" stroke="${s.stroke}" stroke-opacity="${s.strokeOp}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  }).join("");
}

/** Standalone mark SVG. `tile` adds a rounded background square (app-icon / favicon). */
export function logoSVG(
  variant: LogoVariant,
  size: number,
  opts: { tile?: string; radius?: number; padding?: number } = {},
): string {
  const { tile, radius = 18, padding = 0 } = opts;
  const vb = padding ? `${-padding} ${-padding} ${100 + padding * 2} ${100 + padding * 2}` : LOGO_VIEWBOX;
  const bg = tile
    ? `<rect x="${-padding}" y="${-padding}" width="${100 + padding * 2}" height="${100 + padding * 2}" rx="${radius}" fill="${tile}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${vb}" fill="none" role="img" aria-label="SYSmoAI"><title>SYSmoAI</title>${bg}${logoPathsMarkup(variant, size)}</svg>`;
}

// — Wordmark spec (locked) —
export const WORDMARK = {
  family: "'Inter', 'SF Pro Display', -apple-system, 'Segoe UI', system-ui, sans-serif",
  parts: [
    { text: "SYS", weight: 700, tracking: -0.02, opacity: 1 },
    { text: "mo", weight: 400, tracking: -0.04, opacity: 0.65 },
    { text: "AI", weight: 700, tracking: 0.02, opacity: 1 },
  ],
} as const;

export const wordmarkColorFor = (v: LogoVariant) =>
  v === "brand-light" || v === "mono-black" ? "#0A0F1E" : "#FFFFFF";
