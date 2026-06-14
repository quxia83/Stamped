import { palette, categoryColors } from "@/theme/tokens";

// TEMPORARY bridge during theme migration. Removed later once every consumer
// reads from useTheme(). Aliases the light palette so legacy `import { colors }`
// keeps compiling.
export const colors = {
  primary: "#1a1a2e",
  accent: "#e94560",
  background: palette.light.background,
  surface: palette.light.surface,
  text: palette.light.text,
  textSecondary: palette.light.textSecondary,
  border: palette.light.border,
  destructive: palette.light.destructive,
  star: palette.light.star,
  starEmpty: palette.light.starEmpty,
  categoryColors,
} as const;

export const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"] as const;
