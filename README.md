# Stamped

A personal visit tracker for iOS. Log the places you go, rate your experiences, track spending, and see your habits on a map.

## Features

- **Map View** — Browse your saved places on an interactive map with clustered pins and category filtering
- **Visit Logging** — Record visits with ratings, cost, photos, tags, notes, and who paid
- **Statistics** — View spending trends, visit frequency, top places, and category breakdowns
- **Search** — Find places via Google Places API or search your own history
- **Categories & Tags** — Organize visits with custom categories (with emoji icons) and color-coded tags
- **Multi-Currency** — Track costs in USD, EUR, GBP, JPY, CAD, AUD, or CHF
- **Bilingual** — English and Simplified Chinese, auto-detected from device language
- **Theming** — 10 accent colors to personalize the app

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 54 (TypeScript) |
| Routing | Expo Router (file-based) |
| Database | expo-sqlite + Drizzle ORM |
| State | Zustand |
| Maps | react-native-maps + react-native-map-clustering |
| i18n | i18next + react-i18next |
| Build | EAS Build & Submit |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npx expo start

# Run on iOS simulator
npx expo run:ios
```

## Project Structure

```
app/
  (tabs)/         # Tab screens: map, list, stats, settings
  visit/          # New/edit visit & visit detail screens
  place/          # Place detail screen
  search/         # Search modal
components/
  map/            # Map markers, clusters, search pins
  ui/             # Shared UI components
db/               # Drizzle schema & migrations
stores/           # Zustand stores (theme, map, filters)
locales/          # i18n translations (en, zh)
lib/              # Utilities, constants, hooks
```

## Building for App Store

```bash
# Create production build
npx eas build --platform ios --profile production

# Submit to App Store Connect
npx eas submit --platform ios
```

## License

All rights reserved.
