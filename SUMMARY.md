# Stamped — Project Summary

## What It Is
A cross-platform (iOS + Android) personal visit tracker app. Users record places they visit, pin them on a map, rate them, attach photos, tags, cost details, and notes.

## Tech Stack
- Expo SDK 54 + Expo Router (file-based routing)
- TypeScript throughout
- expo-sqlite + drizzle-orm (local SQLite with type-safe queries)
- react-native-maps (Google Maps) + react-native-map-clustering
- Zustand for UI state
- date-fns for date formatting

## What's Built (All Phases Complete)

### Database (7 tables)
- categories, places, people, visits, tags, visit_tags, photos
- Auto-migrated on app start via drizzle-orm
- 7 default categories seeded: Restaurant, Cafe, Bar, Shopping, Event, Travel, Other

### Screens
| Screen | File | Description |
|--------|------|-------------|
| Map | `app/(tabs)/index.tsx` | Google Maps with clustered markers, long-press to add visit |
| Visits List | `app/(tabs)/list.tsx` | Sortable/filterable list of all visits |
| Settings | `app/(tabs)/settings.tsx` | Manage categories, tags, people |
| New/Edit Visit | `app/visit/new.tsx` | Full form: name, address, category, date, rating, cost, who paid, tags, photos, notes |
| Visit Detail | `app/visit/[id].tsx` | View visit with edit/delete actions |
| Place Detail | `app/place/[id].tsx` | Place stats (avg rating, visit count, total spent) + visit history |
| Search | `app/search.tsx` | Debounced search across place names and notes |

### Key Features
- **Map**: Google Maps with marker clustering, colored pins by category, "My Location" button
- **Visit Form**: Star rating, multi-photo (camera + gallery), inline tag creation, currency picker, person picker
- **Filtering**: Sort by date/rating/cost/name, filter by category/tags/min rating
- **Search**: Real-time search across place names and notes
- **Settings**: CRUD for categories, tags, and people
- **Reactive**: Live queries via drizzle-orm's `useLiveQuery` — data updates appear instantly

### File Structure
```
38 source files across:
  app/          — 8 screen files
  db/           — schema, client, seed, 5 query modules
  components/   — 14 UI components (map, visit, common, ui)
  stores/       — 2 Zustand stores (map, filters)
  hooks/        — 4 custom hooks (database, places, visits, photos)
  lib/          — constants (colors, currencies)
```

## How to Run
1. Replace `YOUR_GOOGLE_MAPS_API_KEY` in `app.json` (Android section) with your key (iOS key already set)
2. `npx expo run:ios` or `npx expo run:android`

## Known Issue
The Xcode build was failing due to `AssetCatalogSimulatorAgent` crash after installing the iOS 18.1 simulator runtime. A machine restart should fix this.

## Future Ideas
- Cloud sync (Supabase)
- Google Places autocomplete
- Statistics dashboard
- Data export (JSON/CSV)
- Home screen widget
