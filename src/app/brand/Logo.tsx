import { LOGO_PATHS, LOGO_STYLES, LOGO_VIEWBOX, WORDMARK, strokeFor, type LogoVariant } from "./logo";

export function Logo({
  size = 80,
  variant = "mono-white",
  showGrid = false,
  title = "SYSmoAI",
  decorative = false,
}: {
  size?: number;
  variant?: LogoVariant;
  showGrid?: boolean;
  title?: string;
  decorative?: boolean;
}) {
  const s = LOGO_STYLES[variant] ?? LOGO_STYLES["mono-white"];
  const sw = strokeFor(size);
  return (
    <svg
      width={size}
      height={size}
      viewBox={LOGO_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
    >
      {!decorative && <title>{title}</title>}
      {showGrid && (
        <g opacity={0.1}>
          <line x1="50" y1="0" x2="50" y2="100" stroke="#60A5FA" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#60A5FA" strokeWidth="0.5" />
          <rect x="22" y="22" width="56" height="56" stroke="#60A5FA" strokeWidth="0.3" strokeDasharray="2 2" />
        </g>
      )}
      {LOGO_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={s[i].fill}
          fillOpacity={s[i].fillOp}
          stroke={s[i].stroke}
          strokeOpacity={s[i].strokeOp}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function Wordmark({ size = 36, color = "white", tracking = -0.5 }: { size?: number; color?: string; tracking?: number }) {
  return (
    <span
      aria-label="SYSmoAI"
      role="img"
      style={{
        color,
        fontSize: `${size}px`,
        letterSpacing: `${tracking}px`,
        lineHeight: 1,
        fontFamily: WORDMARK.family,
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
        display: "inline-flex",
        alignItems: "baseline",
        whiteSpace: "nowrap",
      }}
    >
      {WORDMARK.parts.map((p) => (
        <span key={p.text} aria-hidden style={{ fontWeight: p.weight, letterSpacing: `${p.tracking}em`, opacity: p.opacity }}>
          {p.text}
        </span>
      ))}
    </span>
  );
}
