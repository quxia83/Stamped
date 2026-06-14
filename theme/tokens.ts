// Pure design tokens — no React, no platform calls. Safe to import anywhere.

/** Add an alpha channel to a #RRGGBB hex. alpha is 0..1. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, full: 999 } as const;

export const typography = {
  largeTitle: { fontSize: 34, fontWeight: "700", lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: "700", lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: "700", lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: "600", lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: "600", lineHeight: 22 },
  body: { fontSize: 17, fontWeight: "400", lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: "400", lineHeight: 21 },
  subhead: { fontSize: 15, fontWeight: "400", lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: "400", lineHeight: 16 },
} as const;

// Category colors are brand identity — constant across light/dark.
export const categoryColors = [
  "#e94560", "#8b5cf6", "#f59e0b", "#10b981",
  "#3b82f6", "#ec4899", "#14b8a6", "#6b7280",
] as const;

export const palette = {
  light: {
    background: "#f2f2f7",
    surface: "#ffffff",
    surfaceElevated: "#ffffff",
    text: "#1a1a2e",
    textSecondary: "#6c757d",
    textTertiary: "#9ca3af",
    border: "#dee2e6",
    separator: "#e5e7eb",
    destructive: "#FF3B30",
    star: "#fbbf24",
    starEmpty: "#d1d5db",
    overlay: "rgba(0,0,0,0.4)",
    onAccent: "#ffffff",
  },
  dark: {
    background: "#000000",
    surface: "#1c1c1e",
    surfaceElevated: "#2c2c2e",
    text: "#f5f5f7",
    textSecondary: "#a1a1aa",
    textTertiary: "#71717a",
    border: "#38383a",
    separator: "#2c2c2e",
    destructive: "#FF453A",
    star: "#fbbf24",
    starEmpty: "#3f3f46",
    overlay: "rgba(0,0,0,0.6)",
    onAccent: "#ffffff",
  },
} as const;

export const shadow = {
  level0: {},
  level1: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  level2: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  level3: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;
