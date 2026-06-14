import { spacing, radius, typography, shadow, palette } from "./tokens";

export type ColorTokens = (typeof palette)["light"] & {
  accent: string;
  accentMuted: string;
};

export type Theme = {
  scheme: "light" | "dark";
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadow: typeof shadow;
};
