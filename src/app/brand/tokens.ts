// SYSmoAI design tokens — canonical values. Every component should import from here.

export const palette = {
  blue950: "#0D1B3E", // Deep Navy (canonical — approval item #3)
  blue900: "#1E3A8A",
  blue800: "#1E40AF",
  blue600: "#2563EB", // Primary
  blue500: "#3B82F6",
  blue400: "#60A5FA",
  slate400: "#94A3B8",
  ink: "#0A0F1E",
  bg: "#08090D", // Canonical canvas (replaces #0A0B0F)
  surface: "#111218",
  surfaceRaised: "#16171F",
  white: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  errorOnLight: "#DC2626",
  errorOnDark: "#EF4444",
} as const;

export const semantic = {
  dark: {
    background: palette.bg,
    surface: palette.surface,
    textPrimary: "rgba(255,255,255,0.92)", // 17.8:1
    textSecondary: "rgba(255,255,255,0.68)", // 8.6:1
    textTertiary: "rgba(255,255,255,0.56)", // 5.9:1 — WCAG AA floor for body text
    border: "rgba(255,255,255,0.10)",
    accent: palette.blue400, // 7.6:1 on bg
    ring: palette.blue400,
    error: palette.errorOnDark,
  },
  light: {
    background: palette.white,
    surface: "#F8FAFC",
    textPrimary: palette.ink,
    textSecondary: "#334155",
    textTertiary: "#64748B", // 4.76:1
    border: "rgba(10,15,30,0.12)",
    accent: palette.blue600, // 5.17:1
    ring: palette.blue600,
    error: palette.errorOnLight,
  },
} as const;

export const typography = {
  display: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
  text: "'Inter', 'SF Pro Text', -apple-system, system-ui, sans-serif",
  accent: "'Space Grotesk', 'Inter', sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace",
  // Major-third scale (1.25), base 16
  scale: { xs: 12, sm: 14, base: 16, lg: 20, xl: 25, "2xl": 31, "3xl": 39, "4xl": 49, "5xl": 61 },
} as const;

/** 4pt base, 8pt rhythm. */
export const spacing = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;
export const radius = { sm: 6, md: 10, lg: 16, xl: 24, icon: 18 } as const;

// ---------- Generated handoff files ----------
const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()).replace(/([a-z])(\d)/g, "$1-$2");

export function tokensCSS() {
  const lines = Object.entries(palette).map(([k, v]) => `  --brand-${kebab(k)}: ${v};`);
  const sem = Object.entries(semantic.dark).map(([k, v]) => `  --sys-${kebab(k)}: ${v};`);
  const sp = spacing.map((v, i) => `  --space-${i}: ${v}px;`);
  return `/* SYSmoAI tokens */\n:root {\n${lines.join("\n")}\n${sem.join("\n")}\n${sp.join("\n")}\n  --font-display: ${typography.display};\n  --font-mono: ${typography.mono};\n}\n`;
}

export function tokensJSON() {
  const color: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(palette)) color[k] = { $value: v, $type: "color" };
  return JSON.stringify(
    {
      color,
      semantic: Object.fromEntries(
        Object.entries(semantic).map(([mode, set]) => [
          mode,
          Object.fromEntries(Object.entries(set).map(([k, v]) => [k, { $value: v, $type: "color" }])),
        ]),
      ),
      spacing: Object.fromEntries(spacing.map((v, i) => [i, { $value: `${v}px`, $type: "dimension" }])),
      fontFamily: {
        display: { $value: typography.display, $type: "fontFamily" },
        mono: { $value: typography.mono, $type: "fontFamily" },
      },
    },
    null,
    2,
  );
}

export function tailwindPreset() {
  return `// SYSmoAI Tailwind preset\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: { brand: ${JSON.stringify(palette, null, 8).replace(/\n}/, "\n      }")} },\n      fontFamily: { display: [${JSON.stringify(typography.display)}], mono: [${JSON.stringify(typography.mono)}] },\n    },\n  },\n};\n`;
}
