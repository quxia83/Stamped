import { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";
import type { Theme } from "./types";

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return theme;
}
