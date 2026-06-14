# Stamped UI Foundation & Polish — Design (Phase 1)

**Date:** 2026-06-13
**Status:** Approved (pending spec review)
**Phase:** 1 of 2 (Phase 2 = full visual redesign, later)

## Goal

Make Stamped feel like a mature, native iOS application by building a real
theming foundation, adding system-driven dark mode, and unifying the visual
language. Phase 1 keeps existing screen layouts and flows intact — it changes
*how* styling works, not *what* each screen does. Phase 2 (separate spec) will
rethink layouts on top of this foundation.

## Priorities (from user)

1. Visual consistency (colors, spacing, typography, shadows, radii)
2. Loading & empty states
3. Navigation & flow polish (large titles, safe areas, settings)

Platform priority: **iOS-first** (Apple HIG), without breaking Android/web.

## Decisions

- **Theming approach: A — `useTheme()` hook + token system.** A `ThemeProvider`
  derives a semantic palette from `useColorScheme()` + the existing accent-color
  store. Components read tokens via a hook; styles are built per-theme with a
  `makeStyles` factory. Fully reactive on iOS/Android/web and supports live
  accent-color changes.
- **Dark mode: follows the system appearance.** No manual toggle in Phase 1.
  The theme store is kept extensible so a Light/Dark/System override can be
  added later without rework.

## Architecture

### New `theme/` module

```
theme/
  tokens.ts        Raw scales + light/dark semantic palettes (no React)
  ThemeProvider.tsx  Context provider; derives active theme from scheme + accent
  useTheme.ts      Hook returning the active Theme object
  makeStyles.ts    Factory: makeStyles((t) => styles) -> useStyles() hook
  types.ts         Theme / Tokens TypeScript types
  index.ts         Barrel exports
```

**tokens.ts** defines:

- `spacing`: `{ xs:4, sm:8, md:12, lg:16, xl:24, xxl:32 }`
- `radius`: `{ sm:8, md:12, lg:16, full:999 }`
- `typography`: iOS-like scale — `largeTitle, title1, title2, title3, headline,
  body, callout, subhead, footnote, caption` each `{ fontSize, fontWeight,
  lineHeight }`. Uses relative sizing so Dynamic Type can scale it.
- `shadow`: elevation presets `level0..level3` (each combines RN
  `shadow*` props + Android `elevation`).
- `palette.light` and `palette.dark`: semantic color tokens —
  `background, surface, surfaceElevated, text, textSecondary, textTertiary,
  border, separator, destructive, star, starEmpty, overlay, onAccent`.
  Category colors stay constant across schemes (brand identity), defined once.

**ThemeProvider.tsx**: reads `useColorScheme()` and `useThemeStore` accent
color, memoizes a `Theme` = `{ scheme, colors: { ...palette[scheme], accent,
accentMuted }, spacing, radius, typography, shadow }`, and provides it via
context. `accentMuted` is derived from the accent (e.g. accent + alpha) for
subtle backgrounds.

**makeStyles.ts**: `makeStyles((theme) => ({...}))` returns a `useStyles()` hook
that memoizes a `StyleSheet.create` per theme. This replaces module-level static
`StyleSheet.create` calls so styles react to light/dark and accent changes.

### Integration points

- **`app/_layout.tsx`**: wrap the tree in `SafeAreaProvider` (currently
  missing) and our `ThemeProvider`. Switch React Navigation between
  `DefaultTheme`/`DarkTheme` based on `scheme` so nav chrome matches. Replace the
  hardcoded `colors.accent` spinner with the theme.
- **`app/(tabs)/_layout.tsx`**: derive `tabBarStyle`, `headerStyle`,
  `tabBarActiveTintColor` etc. from `useTheme()` so the tab bar and headers
  adapt to dark mode.
- **All screens & components** currently importing `{ colors }` from
  `lib/constants`: migrate to `useTheme()` + `makeStyles`. The old `colors`
  export is removed; `currencies` and `categoryColors` move into `theme/tokens`
  (or a `lib/constants` that re-exports the constant, non-themed bits).
- Delete the unused Expo-template `constants/Colors.ts`.

### Loading & empty states

- **`components/ui/Skeleton.tsx`**: a themed shimmer block animated with
  `react-native-reanimated` (already a dependency). Props: width, height,
  radius.
- **`components/visit/VisitCardSkeleton.tsx`**: skeleton matching `VisitCard`
  layout. The visits list shows N skeletons while loading instead of a blank
  screen. `list.tsx` gains an explicit `loading` state (currently it just sets
  data when ready).
- **`stats.tsx`**: skeleton cards while the four queries resolve.
- **`EmptyState.tsx`**: themed, better spacing, optional `action` (label +
  onPress) so empties can offer a next step (e.g. "Add your first visit").

### Navigation & flow polish

- **iOS large titles** on List, Stats, Settings (`headerLargeTitle: true`).
  Known pitfall (see `expo-router-large-title-fix`): the scrollable must be the
  direct child of the screen. `list.tsx` renders `<FilterBar/>` as a sibling of
  the `FlatList`, which breaks large-title collapse — fix by moving `FilterBar`
  into the `FlatList`'s `ListHeaderComponent`. Apply `contentInsetAdjustment
  Behavior="automatic"` to scroll views.
- **Safe areas**: rely on `SafeAreaProvider` + navigation insets; audit the Map
  overlay (`MapControls`) and any full-bleed views for correct inset handling.
- **Settings**: restyle into iOS-style grouped sections (inset cards, grouped
  background, cleaner add/edit rows) using the new tokens. Behavior unchanged.
- **Haptics**: ensure key interactions (already in `Button`) extend to other
  primary taps where appropriate.

## Component-by-component migration list

Screens: `_layout` (root + tabs), `index` (map), `list`, `stats`, `settings`,
`visit/new`, `visit/[id]`, `place/[id]`, `search`, `+not-found`.
Components: `ui/{Button,Card,Chip,IconButton,BottomSheet}`,
`visit/{VisitCard,RatingInput,TagPicker,PhotoPicker,PriceLevelPicker,CostInput}`,
`common/{FilterBar,SearchBar,EmptyState,CategoryPicker,PersonPicker,DatePicker,
NativeDatePicker}`, `map/{StampedMap,MapControls,PlaceMarker}`.

Each migration: remove `import { colors }`, add `useTheme()`/`makeStyles`, map
hardcoded hex/sizes to tokens. No behavioral changes.

## Error handling

Theming is pure/derived state — low failure surface. `useTheme()` throws a
clear error if used outside `ThemeProvider` (developer guard). Skeleton
animation degrades to a static block if reanimated is unavailable. No new
runtime data paths are introduced.

## Out of scope (Phase 1)

- Layout/IA redesign, new screens, new features (Phase 2).
- Manual dark-mode toggle (system-driven only).
- Custom fonts beyond what's loaded; full Dynamic Type audit (tokens are
  scalable, but exhaustive testing is Phase 2).
- Android/web visual fine-tuning beyond "not broken."

## Testing & verification

- `npx tsc --noEmit` passes (type-safe token usage is the main compile gate).
- Manual: run iOS simulator in **light and dark**; visit every tab and the
  visit/place/new/search screens; confirm colors, large titles, safe areas,
  skeletons, and empty states render correctly and accent-color changes still
  apply live.
- Spot-check Android + web builds load without regressions.

## Rollout

Migrate in dependency order: tokens/provider first, then root + tab layouts,
then shared UI components, then screens. Keep the app compiling at each step
(temporary bridge: `lib/constants` `colors` can alias the light palette until
all consumers are migrated, then removed).
