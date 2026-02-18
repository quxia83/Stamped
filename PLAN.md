# Stamped — Implementation Plan

## Context

Build a cross-platform (iOS + Android) personal visit tracker app using **Expo (React Native) + TypeScript**. Users record places they visit (restaurants, shops, events, etc.), pin them on a map, rate them, attach photos, tags, cost details, and notes. Extensible to any category beyond restaurants.

**Decisions**: Google Maps, local-only SQLite storage (sync-friendly schema), no auth, clean & minimal UI.

---

## Tech Stack

- **Expo SDK 52+** with Expo Router (file-based routing)
- **expo-sqlite** + **drizzle-orm** for type-safe local DB
- **react-native-maps** (Google Maps provider) + **react-native-map-clustering**
- **expo-image-picker** + **expo-file-system** for photos
- **Zustand** for UI state (filters, map region)
- **date-fns** for date formatting
- **TypeScript** throughout

---

## Directory Structure

```
stamped/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout (migrations + providers)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator (Map, List, Settings)
│   │   ├── index.tsx             # Map tab
│   │   ├── list.tsx              # List tab
│   │   └── settings.tsx          # Settings tab
│   ├── place/[id].tsx            # Place detail
│   ├── visit/[id].tsx            # Visit detail
│   ├── visit/new.tsx             # Add/edit visit form
│   └── search.tsx                # Search screen
├── db/
│   ├── schema.ts                 # Drizzle table definitions
│   ├── client.ts                 # Database instance
│   ├── seed.ts                   # Default categories
│   └── queries/                  # CRUD per entity
├── drizzle/                      # Generated migrations
├── components/
│   ├── map/                      # MapView, PlaceMarker, MapControls
│   ├── visit/                    # VisitForm, VisitCard, RatingInput, PhotoPicker, TagPicker, CostInput
│   ├── place/                    # PlaceCard
│   ├── common/                   # FilterBar, SearchBar, CategoryPicker, PersonPicker, DatePicker, EmptyState
│   └── ui/                       # Button, Card, Chip, BottomSheet, IconButton
├── stores/                       # Zustand stores (filter, map)
├── hooks/                        # useDatabase, usePlaces, useVisits, usePhotos
├── lib/                          # constants, types, utils
└── assets/
```

---

## Database Schema (7 tables)

- **categories** — id, name, icon
- **places** — id, name, address, latitude, longitude, categoryId, createdAt
- **people** — id, name
- **visits** — id, placeId, date, rating (1-5), cost, currency, whoPaidId, notes, createdAt, updatedAt
- **tags** — id, label, color
- **visit_tags** — visitId, tagId (junction table)
- **photos** — id, visitId, uri, createdAt

Dates stored as ISO 8601 text for readability and sync-friendliness.

---

## Phase 0: Project Scaffolding & Database ✅

**Goal**: Running Expo app with SQLite + drizzle-orm, migrations, and seeded categories.

1. `npx create-expo-app@latest stamped --template tabs`
2. Install deps: `expo-sqlite`, `react-native-maps`, `expo-image-picker`, `expo-file-system`, `expo-location`, `drizzle-orm`, `zustand`, `date-fns`, `drizzle-kit`
3. Configure Metro for `.sql` files (`metro.config.js`)
4. Create `drizzle.config.ts`
5. Create `db/schema.ts` with all 7 tables
6. Generate initial migration with `npx drizzle-kit generate`
7. Create `db/client.ts` — open DB + wrap with drizzle
8. Create `hooks/useDatabase.ts` — runs migrations on app start
9. Create `db/seed.ts` — seed 7 default categories (Restaurant, Cafe, Bar, Shopping, Event, Travel, Other)
10. Update `app/_layout.tsx` — run migrations + seed before rendering

---

## Phase 1: Map View + Basic Visit Creation ✅

**Goal**: Google Map on main tab. Long-press to drop pin and create a visit with name, category, rating, date.

1. Configure Google Maps API key in `app.json` (iOS + Android)
2. Install `react-native-map-clustering`
3. Create `stores/useMapStore.ts` (region, selected place)
4. Create `db/queries/places.ts` — getAllPlaces, insertPlace
5. Create `db/queries/visits.ts` — insertVisit
6. Create `db/queries/categories.ts` — getAllCategories
7. Create `components/map/StampedMap.tsx` — clustered Google Map with markers
8. Create `components/map/PlaceMarker.tsx` — colored pin by category
9. Create `app/visit/new.tsx` — minimal form (name, category, rating, date)
10. Create `components/visit/RatingInput.tsx` — tappable star row
11. Create `components/common/CategoryPicker.tsx` — horizontal chip list
12. Create `hooks/usePlaces.ts` — reactive places query
13. Wire up `app/(tabs)/index.tsx` with MapView

---

## Phase 2: List View + Visit/Place Detail ✅

**Goal**: Second tab shows all visits. Tap visit for detail. Tap place name for place detail with stats.

1. Create `components/visit/VisitCard.tsx` — card with name, date, rating, cost
2. Create `app/(tabs)/list.tsx` — FlatList of VisitCards, sorted by date desc
3. Add `getAllVisitsWithPlace` query (joins visits + places + categories)
4. Create `app/visit/[id].tsx` — full visit detail with edit/delete
5. Create `app/place/[id].tsx` — place detail with stats (avg rating, total visits, total spent) + visit list
6. Add `getPlaceWithStats` query
7. Support edit mode in `app/visit/new.tsx` (via `editId` route param)
8. Configure tabs in `app/(tabs)/_layout.tsx`

---

## Phase 3: Photos, Tags, Cost, Who Paid ✅

**Goal**: Complete the visit form with all fields.

1. Create `components/visit/PhotoPicker.tsx` — multi-photo from gallery/camera, copies to document dir
2. Create `db/queries/photos.ts` — insert, get by visit, delete (+ cleanup file)
3. Create `components/visit/TagPicker.tsx` — multi-select chips + inline create with color
4. Create `db/queries/tags.ts` — CRUD + setVisitTags (manages junction table)
5. Create `components/visit/CostInput.tsx` — numeric input + currency picker
6. Create `components/common/PersonPicker.tsx` — dropdown + "add new" option
7. Create `db/queries/people.ts` — getAllPeople, insertPerson
8. Update `app/visit/new.tsx` with all new fields
9. Update `app/visit/[id].tsx` to display photos, tags, cost, who paid
10. Update `VisitCard.tsx` to show thumbnail, tags, cost

---

## Phase 4: Filtering, Sorting, and Search ✅

**Goal**: List view gets filter/sort controls. Search screen for full-text search.

1. Create `stores/useFilterStore.ts` — sort field/order, filters for category, tags, rating, who paid, date range
2. Create `components/common/FilterBar.tsx` — horizontal filter chips + sort toggle
3. Create `components/common/DatePicker.tsx`
4. Update `db/queries/visits.ts` — `getFilteredVisits(filters)` with dynamic where/orderBy
5. Update `app/(tabs)/list.tsx` to use filter store
6. Create `app/search.tsx` — debounced search across place names, tags, notes
7. Create `components/common/SearchBar.tsx`
8. Add search icon to tab headers

---

## Phase 5: Map Enhancements & Polish ✅

**Goal**: Clustering, current location, map-filter sync, settings, visual polish.

1. Enable marker clustering with category-based cluster colors
2. Create `components/map/MapControls.tsx` — "My Location" button via expo-location
3. Sync `useFilterStore` with map view (filter pins too)
4. Create `components/ui/BottomSheet.tsx` — marker tap preview
5. Create `app/(tabs)/settings.tsx` — manage categories, tags, people
6. Create `components/common/EmptyState.tsx`
7. Define color scheme in `lib/constants.ts`, add haptic feedback (expo-haptics)
8. Handle edge cases: permission denial, empty states, photo cleanup on delete

---

## Future (Phase 6, not built now)

- Cloud sync via Supabase (add `syncId` UUID + `lastSyncedAt` + soft deletes)
- Google Places autocomplete
- Full-screen photo viewer
- Statistics dashboard (spending trends, most visited)
- Data export (JSON/CSV)
- Home screen widget
- Share visit as image card
