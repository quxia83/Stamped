import { createContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { useThemeStore } from "@/stores/useThemeStore";
import { spacing, radius, typography, shadow, palette, withAlpha } from "./tokens";
import type { Theme, ColorTokens } from "./types";

export const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const accent = useThemeStore((s) => s.accentColor);
  const scheme: "light" | "dark" = systemScheme === "dark" ? "dark" : "light";

  const theme = useMemo<Theme>(
    () => ({
      scheme,
      colors: {
        ...palette[scheme],
        accent,
        accentMuted: withAlpha(accent, scheme === "dark" ? 0.24 : 0.14),
      } as ColorTokens,
      spacing,
      radius,
      typography,
      shadow,
    }),
    [scheme, accent]
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
