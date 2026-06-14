# Stamped UI Foundation & Polish — Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Stamped a real theming foundation (semantic tokens + system dark mode), unify its visual language, and add loading/empty/navigation polish — without changing screen layouts or flows.

**Architecture:** A pure `theme/tokens.ts` defines scales + light/dark palettes. A `ThemeProvider` derives the active `Theme` from `useColorScheme()` + the accent-color store and exposes it via `useTheme()`. A `makeStyles((t) => …)` factory replaces module-level `StyleSheet.create` so styles react to scheme/accent changes. Every screen/component migrates off the flat `colors` import onto the theme.

**Tech Stack:** Expo Router, React Native 0.81, TypeScript, Zustand, react-native-reanimated, react-native-safe-area-context, @react-navigation/native.

**Testing note:** No Jest runner exists in this repo. The automated gate for every task is `npx tsc --noEmit` (it transitively validates token names/types across all consumers). Visual correctness is verified manually in the iOS simulator (light + dark). Where a task contains pure logic worth asserting (e.g. `withAlpha`), the plan includes a tiny inline `node` sanity check instead of a Jest test.

---

## File Structure

**New (`theme/`):**
- `theme/tokens.ts` — `spacing`, `radius`, `typography`, `shadow`, `palette.{light,dark}`, `categoryColors`, `withAlpha()`. No React.
- `theme/types.ts` — `Theme`, `ColorTokens`, `Tokens` types.
- `theme/ThemeProvider.tsx` — context + provider; derives active theme.
- `theme/useTheme.ts` — `useTheme()` hook (throws outside provider).
- `theme/makeStyles.ts` — `makeStyles(factory)` → `useStyles()` hook.
- `theme/index.ts` — barrel.

**New (components):**
- `components/ui/Skeleton.tsx` — reanimated shimmer block.
- `components/visit/VisitCardSkeleton.tsx` — list skeleton row.

**Modified (infra):** `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `lib/constants.ts`.

**Modified (migrations, mechanical):** every file importing `{ colors }` from `@/lib/constants` (see Task 12 inventory).

**Deleted:** `constants/Colors.ts` (unused Expo template).

---

## Task 1: Theme tokens (pure)

**Files:**
- Create: `theme/tokens.ts`

- [ ] **Step 1: Write `theme/tokens.ts`**

```typescript
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
    background: "#f2f2f7",     // iOS grouped background
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
```

- [ ] **Step 2: Sanity-check `withAlpha` (no Jest in repo)**

Run: `node -e "const f=(h,a)=>h+Math.round(a*255).toString(16).padStart(2,'0'); console.log(f('#e94560',0.2))"`
Expected: prints `#e94560 33` form, i.e. `#e9456033`. (Confirms alpha math; the real fn lives in tokens.ts.)

- [ ] **Step 3: Commit**

```bash
git add theme/tokens.ts
git commit -m "Add theme design tokens (scales + light/dark palettes)"
```

---

## Task 2: Theme types

**Files:**
- Create: `theme/types.ts`

- [ ] **Step 1: Write `theme/types.ts`**

```typescript
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add theme/types.ts
git commit -m "Add Theme/ColorTokens types"
```

---

## Task 3: ThemeProvider + useTheme

**Files:**
- Create: `theme/ThemeProvider.tsx`
- Create: `theme/useTheme.ts`

- [ ] **Step 1: Write `theme/ThemeProvider.tsx`**

```typescript
import { createContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { useThemeStore } from "@/stores/useThemeStore";
import { spacing, radius, typography, shadow, palette, withAlpha } from "./tokens";
import type { Theme } from "./types";

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
      },
      spacing,
      radius,
      typography,
      shadow,
    }),
    [scheme, accent]
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
```

- [ ] **Step 2: Write `theme/useTheme.ts`**

```typescript
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
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add theme/ThemeProvider.tsx theme/useTheme.ts
git commit -m "Add ThemeProvider and useTheme hook"
```

---

## Task 4: makeStyles factory + barrel

**Files:**
- Create: `theme/makeStyles.ts`
- Create: `theme/index.ts`

- [ ] **Step 1: Write `theme/makeStyles.ts`**

```typescript
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type {
  ImageStyle,
  TextStyle,
  ViewStyle,
} from "react-native";
import { useTheme } from "./useTheme";
import type { Theme } from "./types";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Define styles that depend on the theme:
 *   const useStyles = makeStyles((t) => ({ box: { backgroundColor: t.colors.surface } }));
 *   const styles = useStyles();   // memoized per theme
 */
export function makeStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T
) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
```

- [ ] **Step 2: Write `theme/index.ts`**

```typescript
export * from "./tokens";
export * from "./types";
export { ThemeProvider } from "./ThemeProvider";
export { useTheme } from "./useTheme";
export { makeStyles } from "./makeStyles";
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add theme/makeStyles.ts theme/index.ts
git commit -m "Add makeStyles factory and theme barrel export"
```

---

## Task 5: Bridge `lib/constants.ts` (keep app compiling during migration)

The flat `colors` object is imported by ~25 files. To migrate incrementally
without breaking the build, re-point `lib/constants.ts` at the light palette as a
temporary alias and re-export the non-themed constants. It is removed in Task 13.

**Files:**
- Modify: `lib/constants.ts`

- [ ] **Step 1: Replace `lib/constants.ts`**

```typescript
import { palette, categoryColors } from "@/theme/tokens";

// TEMPORARY bridge during theme migration. Removed in Task 13 once every
// consumer reads from useTheme(). Aliases the light palette so legacy
// `import { colors }` keeps compiling.
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS (existing consumers still resolve `colors.*`).

- [ ] **Step 3: Commit**

```bash
git add lib/constants.ts
git commit -m "Bridge lib/constants colors to theme palette during migration"
```

---

## Task 6: Wire providers into root layout

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Replace the body of `app/_layout.tsx`**

Keep the existing font/db loading logic. Change imports + the returned tree.
Add `SafeAreaProvider`, our `ThemeProvider`, and scheme-aware navigation theme.
Split the rendered tree into an inner component so it can call `useTheme()`
(hooks must run *inside* the provider).

```typescript
import "@/lib/i18n";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDatabase } from "@/hooks/useDatabase";
import { useTranslation } from "react-i18next";
import { ThemeProvider, useTheme } from "@/theme";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = { initialRouteName: "(tabs)" };

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const theme = useTheme();
  const navTheme = theme.scheme === "dark" ? DarkTheme : DefaultTheme;
  const navThemeWithAccent = {
    ...navTheme,
    colors: {
      ...navTheme.colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };
  return (
    <NavThemeProvider value={navThemeWithAccent}>
      <Stack
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: theme.colors.accent,
          headerStyle: { backgroundColor: theme.colors.surface },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Stamped" }} />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const { t } = useTranslation();
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const { isReady: dbReady, error: dbError } = useDatabase();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && dbReady) SplashScreen.hideAsync();
  }, [fontsLoaded, dbReady]);

  if (dbError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("error.databaseError", { message: dbError.message })}</Text>
      </View>
    );
  }

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Manual verify**

Run: `npx expo start` → open iOS simulator. App boots; toggle simulator
appearance (Features ▸ Toggle Appearance) — the root background/header should
switch between light and dark.

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx
git commit -m "Wire SafeAreaProvider + theme-aware navigation into root layout"
```

---

## Task 7: Theme the tab layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Replace `colors`/`useThemeStore` usage with `useTheme()`**

Remove `import { colors } from "@/lib/constants"` and the
`useThemeStore` accent import. Add `import { useTheme } from "@/theme"`, then
inside `TabLayout` add `const theme = useTheme();` and replace the
`screenOptions` color values:

```typescript
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.accent,
        headerBackTitleVisible: false,
      }}
```

In the three header `Pressable` icons, replace `accentColor` → `theme.colors.accent`
and `colors.text` → `theme.colors.text`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Manual verify**

Reload simulator; tab bar + headers adapt to dark mode; header icons visible in
both schemes; changing accent in Settings still recolors the active tab.

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/_layout.tsx"
git commit -m "Theme tab bar and headers via useTheme"
```

---

## Task 8: Skeleton component

**Files:**
- Create: `components/ui/Skeleton.tsx`

- [ ] **Step 1: Write `components/ui/Skeleton.tsx`**

```typescript
import { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/theme";

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = "100%", height = 16, radius, style }: Props) {
  const theme = useTheme();
  const progress = useSharedValue(0.4);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.sm,
          backgroundColor: theme.colors.separator,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Skeleton.tsx
git commit -m "Add reanimated Skeleton shimmer component"
```

---

## Task 9: VisitCardSkeleton

**Files:**
- Create: `components/visit/VisitCardSkeleton.tsx`

- [ ] **Step 1: Write `components/visit/VisitCardSkeleton.tsx`**

Mirrors `VisitCard`'s thumbnail + two-line layout, wrapped in the same `Card`.

```typescript
import { View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { makeStyles } from "@/theme";

export function VisitCardSkeleton() {
  const styles = useStyles();
  return (
    <Card>
      <View style={styles.row}>
        <Skeleton width={56} height={56} radius={8} />
        <View style={styles.content}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="35%" height={12} style={styles.gap} />
          <Skeleton width="45%" height={12} style={styles.gap} />
        </View>
      </View>
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: "row", gap: t.spacing.md },
  content: { flex: 1, justifyContent: "center", gap: t.spacing.xs },
  gap: { marginTop: t.spacing.xs },
}));
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS. (Note: `Card` is migrated in Task 11; this still compiles now.)

- [ ] **Step 3: Commit**

```bash
git add components/visit/VisitCardSkeleton.tsx
git commit -m "Add VisitCardSkeleton for list loading state"
```

---

## Task 10: Upgrade EmptyState (themed + optional action)

**Files:**
- Modify: `components/common/EmptyState.tsx`

- [ ] **Step 1: Replace `components/common/EmptyState.tsx`**

```typescript
import { View, Text, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon = "map-marker", title, message, action }: Props) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={48} color={theme.colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: t.spacing.xxl },
  title: { ...t.typography.title3, color: t.colors.textSecondary, marginTop: t.spacing.lg, textAlign: "center" },
  message: { ...t.typography.subhead, color: t.colors.textSecondary, marginTop: t.spacing.sm, textAlign: "center" },
  action: {
    marginTop: t.spacing.xl,
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.accent,
  },
  actionText: { ...t.typography.headline, color: t.colors.onAccent },
}));
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/common/EmptyState.tsx
git commit -m "Theme EmptyState and add optional action button"
```

---

## Task 11: Migrate shared UI components

Migrate the reusable building blocks first so screens that use them inherit the
theme. **Migration recipe (apply to every file in this task):**

1. Delete `import { colors } from "@/lib/constants"`.
2. Add `import { makeStyles, useTheme } from "@/theme"` (use `useTheme` only if a
   color is needed inline, e.g. icon `color=` props or dynamic style).
3. Convert the module-level `const styles = StyleSheet.create({...})` to
   `const useStyles = makeStyles((t) => ({...}))` and, inside the component, add
   `const styles = useStyles();`.
4. Apply this **color mapping** everywhere (left → right):
   - `colors.surface` → `t.colors.surface`
   - `colors.background` → `t.colors.background`
   - `colors.text` → `t.colors.text`
   - `colors.textSecondary` → `t.colors.textSecondary`
   - `colors.border` → `t.colors.border`
   - `colors.destructive` → `t.colors.destructive`
   - `colors.star` → `t.colors.star`
   - `colors.starEmpty` → `t.colors.starEmpty`
   - `colors.accent` / `accentColor` (from `useThemeStore`) → `t.colors.accent`
   - hardcoded `"#fff"` used as on-accent text → `t.colors.onAccent`
5. Replace magic numbers with tokens where they match a scale value
   (`padding: 16`→`t.spacing.lg`, `borderRadius: 12`→`t.radius.md`,
   `fontSize: 16/fontWeight` → spread a `t.typography.*` entry). Leave one-off
   numbers (e.g. `width: 56` thumbnails) as-is.
6. For inline `color={...}` on `FontAwesome`/icons, read from `const theme =
   useTheme()`.
7. If the component used `useThemeStore((s) => s.accentColor)` *only* for color,
   remove that import in favor of `t.colors.accent`.

**Files (one commit per file):**
- Modify: `components/ui/Card.tsx`
- Modify: `components/ui/Button.tsx`
- Modify: `components/ui/Chip.tsx`
- Modify: `components/ui/IconButton.tsx`
- Modify: `components/ui/BottomSheet.tsx`
- Modify: `components/visit/VisitCard.tsx`
- Modify: `components/visit/RatingInput.tsx`
- Modify: `components/visit/TagPicker.tsx`
- Modify: `components/visit/PhotoPicker.tsx`
- Modify: `components/visit/PriceLevelPicker.tsx`
- Modify: `components/visit/CostInput.tsx`
- Modify: `components/common/FilterBar.tsx`
- Modify: `components/common/SearchBar.tsx`
- Modify: `components/common/CategoryPicker.tsx`
- Modify: `components/common/PersonPicker.tsx`
- Modify: `components/common/DatePicker.tsx`
- Modify: `components/common/NativeDatePicker.tsx`
- Modify: `components/map/MapControls.tsx`
- Modify: `components/map/PlaceMarker.tsx`

**Worked example — `components/ui/Card.tsx` (use elevation token):**

```typescript
import { View, StyleProp, ViewStyle } from "react-native";
import { makeStyles } from "@/theme";

type Props = { children: React.ReactNode; style?: StyleProp<ViewStyle> };

export function Card({ children, style }: Props) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.md,
    padding: t.spacing.lg,
    marginHorizontal: t.spacing.lg,
    marginVertical: t.spacing.xs + 2,
    ...t.shadow.level1,
  },
}));
```

**Worked example — `components/ui/Button.tsx` (accent via theme, keep haptics):**

```typescript
import { Pressable, Text, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ title, onPress, variant = "primary", disabled, loading }: Props) {
  const theme = useTheme();
  const styles = useStyles();
  const bg =
    variant === "primary" ? theme.colors.accent
    : variant === "danger" ? theme.colors.destructive
    : "transparent";
  const textColor = variant === "secondary" ? theme.colors.accent : theme.colors.onAccent;
  const borderColor = variant === "secondary" ? theme.colors.accent : bg;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor, opacity: pressed || disabled ? 0.7 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} size="small" />
        : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  button: {
    paddingVertical: t.spacing.md + 2,
    paddingHorizontal: t.spacing.xl,
    borderRadius: t.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  text: { ...t.typography.headline },
}));
```

- [ ] **Step 1: Migrate each file** per the recipe above (Card and Button shown in full; apply the same transformation to the rest). For `BottomSheet`, keep its existing `useSafeAreaInsets` usage; only swap colors/tokens.

- [ ] **Step 2: After each file, type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit per file**

```bash
git add <file>
git commit -m "Theme <ComponentName> via useTheme/makeStyles"
```

---

## Task 12: Migrate screens (incl. loading states + large titles)

Apply the **same migration recipe from Task 11** to each screen, plus the
per-screen additions below.

> **DEVIATION (2026-06-13):** iOS large titles are **deferred to Phase 2**.
> `headerLargeTitle` is a native-stack-only option; Expo Router `Tabs` use
> bottom-tab headers which don't support it, so enabling it here would be a
> no-op. Adding it properly requires nesting a Stack per tab (structural, out of
> Phase 1 scope). The `FilterBar`→`ListHeaderComponent` move (which existed only
> to satisfy large titles) is therefore also dropped — `FilterBar` stays a
> sticky bar above the list. We keep the rest of the nav polish:
> `contentInsetAdjustmentBehavior="automatic"`, themed headers, safe areas.

**Files (one commit per file):**
- Modify: `app/(tabs)/index.tsx` (map) — recipe only.
- Modify: `app/(tabs)/list.tsx` — recipe + loading skeletons + large-title fix.
- Modify: `app/(tabs)/stats.tsx` — recipe + loading skeletons.
- Modify: `app/(tabs)/settings.tsx` — recipe + iOS grouped restyle.
- Modify: `app/(tabs)/visit/new.tsx` — recipe only.
- Modify: `app/(tabs)/visit/[id].tsx` — recipe only.
- Modify: `app/(tabs)/place/[id].tsx` — recipe only.
- Modify: `app/(tabs)/search.tsx` — recipe only.
- Modify: `app/+not-found.tsx` — recipe only.

### 12a — `list.tsx`: loading skeletons + large-title fix

- [ ] **Step 1: Add a `loading` state and render skeletons**

In `ListTab`, add `const [loading, setLoading] = useState(true);`. In `load()`,
set `setLoading(true)` before the fetch and `setLoading(false)` in a `finally`.
Then make the list data switch to skeletons while loading:

```typescript
import { VisitCardSkeleton } from "@/components/visit/VisitCardSkeleton";
// ...
const SKELETONS = [0, 1, 2, 3, 4, 5];
// in render:
{loading ? (
  <FlatList
    data={SKELETONS}
    keyExtractor={(i) => `sk-${i}`}
    renderItem={() => <VisitCardSkeleton />}
    ListHeaderComponent={<FilterBar />}
    contentContainerStyle={styles.list}
    contentInsetAdjustmentBehavior="automatic"
  />
) : (
  <FlatList
    data={visits}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (<VisitCard {/* same props as today */} />)}
    ListHeaderComponent={<FilterBar />}
    contentContainerStyle={visits.length === 0 ? styles.empty : styles.list}
    contentInsetAdjustmentBehavior="automatic"
    ListEmptyComponent={
      <EmptyState
        icon="bookmark"
        title={t("list.emptyTitle")}
        message={t("list.emptyMessage")}
        action={{ label: t("list.addFirst", { defaultValue: "Add a visit" }), onPress: () => router.push("/visit/new") }}
      />
    }
  />
)}
```

- [ ] **Step 2: Large-title fix** — move `<FilterBar />` from a sibling into the
  `FlatList`'s `ListHeaderComponent` (done above) so the `FlatList` is the screen's
  direct scrollable child. Remove the outer `<>...</>` wrapper and the standalone
  `<FilterBar />`. Add `useRouter` import for the empty-state action. Reference:
  `expo-router-large-title-fix` skill.

- [ ] **Step 3: Enable large title** in `app/(tabs)/_layout.tsx` for the `list`
  screen options: add `headerLargeTitle: true` to the `list` `Tabs.Screen`
  `options`. (Same for `stats` and `settings` in their tasks.)

- [ ] **Step 4: Migrate `list.tsx` styles** per recipe (the small `list`/`empty`
  styles → `makeStyles`).

- [ ] **Step 5: Type-check + manual**

Run: `npx tsc --noEmit` → PASS. In simulator: cold-load the Visits tab shows
shimmering skeletons, then real cards; large title collapses on scroll; empty
state (filter to no results) shows the action button.

- [ ] **Step 6: Commit**

```bash
git add "app/(tabs)/list.tsx" "app/(tabs)/_layout.tsx"
git commit -m "List: skeleton loading, themed styles, large-title fix"
```

### 12b — `stats.tsx`: loading skeletons

- [ ] **Step 1:** Add `const [loading, setLoading] = useState(true)`; set it
  around the `load()` in the existing `useEffect` (`true` before, `false` in
  `finally`). While `loading`, render 3 placeholder cards:

```typescript
{loading ? (
  <>
    {[0, 1, 2].map((i) => (
      <View key={i} style={styles.card}>
        <Skeleton width="40%" height={16} />
        <Skeleton width="100%" height={48} style={{ marginTop: 12 }} />
      </View>
    ))}
  </>
) : (
  /* existing overview/category/time/topPlaces blocks */
)}
```

- [ ] **Step 2:** Migrate all `colors.*`/`accentColor` in `stats.tsx` per recipe;
  convert its large `StyleSheet.create` to `makeStyles`. Add `headerLargeTitle:
  true` for `stats` in `_layout.tsx`, and `contentInsetAdjustmentBehavior=
  "automatic"` on the `ScrollView`.

- [ ] **Step 3: Type-check + manual** → PASS; stats tab shows skeleton cards
  then content; dark mode correct.

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/stats.tsx" "app/(tabs)/_layout.tsx"
git commit -m "Stats: skeleton loading and themed styles"
```

### 12c — `settings.tsx`: iOS grouped restyle

- [ ] **Step 1:** Migrate per recipe. Then restyle to iOS grouped look using
  tokens: section `item` rows become inset cards on a grouped background —
  `backgroundColor: t.colors.background` for the list container, rows use
  `t.colors.surface` with `t.radius.md` grouped corners and `t.spacing.lg` inset
  margins; `sectionTitle` uses `t.typography.footnote` uppercase
  `t.colors.textSecondary` (iOS section header style). Keep all existing add/
  edit/delete behavior and handlers unchanged. Add `headerLargeTitle: true` for
  `settings` in `_layout.tsx`.

- [ ] **Step 2: Type-check + manual** → PASS; settings reads as grouped iOS list
  in light + dark; add/edit/delete still work; accent swatches still update the
  theme live.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/settings.tsx" "app/(tabs)/_layout.tsx"
git commit -m "Settings: iOS grouped styling via theme tokens"
```

### 12d — remaining screens (recipe only)

- [ ] **Step 1:** Migrate `index.tsx`, `visit/new.tsx`, `visit/[id].tsx`,
  `place/[id].tsx`, `search.tsx`, `+not-found.tsx` per the Task 11 recipe. For
  scrollable detail screens add `contentInsetAdjustmentBehavior="automatic"`.

- [ ] **Step 2: After each, type-check**

Run: `npx tsc --noEmit` → PASS.

- [ ] **Step 3: Commit per file**

```bash
git add <file>
git commit -m "Theme <screen> via useTheme/makeStyles"
```

---

## Task 13: Remove the bridge + dead template

**Files:**
- Modify: `lib/constants.ts` (remove `colors` alias)
- Delete: `constants/Colors.ts`

- [ ] **Step 1: Confirm no remaining consumers**

Run: `grep -rn "from \"@/lib/constants\"" app components | grep colors`
Also: `grep -rn "colors\." app components | grep -v "t.colors\|theme.colors"`
Expected: no matches that reference the old flat `colors` object.

- [ ] **Step 2: Reduce `lib/constants.ts` to non-themed exports only**

```typescript
export const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"] as const;
```

(If any non-color constant was still needed from here, keep it; only the `colors`
object is removed.)

- [ ] **Step 3: Delete the unused Expo template palette**

```bash
git rm constants/Colors.ts
```

Confirm nothing imports it: `grep -rn "constants/Colors" .` → no app matches.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/constants.ts
git commit -m "Remove color bridge and unused Colors template"
```

---

## Task 14: Final verification pass

- [ ] **Step 1: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: PASS, zero errors.

- [ ] **Step 2: Grep for stragglers**

Run: `grep -rn "StyleSheet.create" app components | wc -l` — expect a low count
(only files genuinely without theme-dependent styles, if any).
Run: `grep -rn "#fff\|#000\|#1a1a2e" app components` — review each hit; any
remaining hardcoded color in a styled surface should be a token. Hardcoded
colors are acceptable only for genuinely constant brand/category values.

- [ ] **Step 3: Manual matrix (iOS simulator)**

For **light** and **dark** each, open: Map, Visits (cold load → skeletons →
cards; scroll for large title; empty state), Stats (skeletons → content), New
Visit, Visit detail, Place detail, Search, Settings (grouped; add/edit/delete;
change accent → live recolor). Confirm no unreadable text, no white flashes,
safe-area insets correct (notch + home indicator).

- [ ] **Step 4: Cross-platform smoke**

Run: `npx expo start` → press `a` (Android) and `w` (web); confirm each boots
without runtime errors and renders the Visits list.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "Final theme migration cleanup and verification fixes"
```

---

## Self-Review (author checklist — completed)

- **Spec coverage:** tokens (T1), types (T2), provider/useTheme (T3), makeStyles
  (T4), dark mode via scheme (T3/T6/T7), SafeAreaProvider (T6), nav theming
  (T6/T7), skeletons (T8/T9 + T12a/b), EmptyState upgrade (T10), large titles +
  inset behavior (T12a/b/c), settings restyle (T12c), full migration (T11/T12),
  delete `constants/Colors.ts` (T13), tsc + manual + cross-platform verify (T14).
  All spec sections mapped.
- **Placeholder scan:** the migration recipe is concrete (explicit mapping
  table + two full worked examples); no "TBD"/"handle edge cases"/"similar to".
- **Type consistency:** `Theme`/`ColorTokens` defined in T2 are used identically
  in T3/T4/T11/T12; `makeStyles((t) => …)` + `useStyles()` naming consistent
  throughout; `withAlpha`, `accentMuted`, `onAccent`, `textTertiary`, `separator`
  all defined in T1/T3 before first use.
```
