// Single source for version strings & asset counts. Never hardcode these in components.

export const BRAND_VERSION = "3.0.0";
export const BRAND_RELEASE = "October 2026";

/** Icon Export Center manifest (counts per category). */
export const SOCIAL_PLATFORMS = 14;
export const SOCIAL_VARIANTS = 4;
export const SOCIAL_PROFILE_COUNT = SOCIAL_PLATFORMS * SOCIAL_VARIANTS; // 56
export const SOCIAL_COVERS = ["Facebook", "LinkedIn", "YouTube", "Discord"] as const;

export const ICON_MANIFEST = {
  favicon: 5, // 16, 32, 48, 64 PNG + favicon.ico
  apple: 18, // 9 dark + 9 light
  android: 14,
  desktop: 14,
  windows: 4,
  pwa: 2,
  email: 8,
  social: SOCIAL_PROFILE_COUNT,
} as const;

export const ICON_FILE_COUNT =
  Object.values(ICON_MANIFEST).reduce((a, b) => a + b, 0); // 121

/** Logo package: 4 variants × (SVG + PNG 1x/2x/3x) + 2 lockups × 4 variants × (SVG + PNG@2x). */
export const LOGO_FILE_COUNT = 4 * 4 + 2 * 4 * 2; // 32

export const BUSINESS_ASSETS = {
  web: 6, // og, twitter, hero, tokens.css, tokens.json, tailwind preset
  proposal: 6, // cover, divider, 3 slides, letterhead png
  docs: 3, // github banner, notion cover, docs header
  ops: 7, // signature html+png, card front/back, invoice html, letterhead html, meeting bg
} as const;
export const BUSINESS_FILE_COUNT = Object.values(BUSINESS_ASSETS).reduce((a, b) => a + b, 0); // 22

// Social profiles are counted once (inside ICON_MANIFEST.social).
export const TOTAL_EXPORTABLE_FILES =
  ICON_FILE_COUNT + SOCIAL_COVERS.length + LOGO_FILE_COUNT + BUSINESS_FILE_COUNT;
