# Google Places Text Search Integration

## Problem
Current search uses Photon/Nominatim (geocoding APIs) which are poor at finding businesses/restaurants by name.

## Solution
Replace with Google Places API (New) Text Search endpoint. Keep Nominatim as fallback.

## Changes

### `lib/geocode.ts`
- Replace `searchPhoton()` with `searchGooglePlaces()` using POST to `https://places.googleapis.com/v1/places:searchText`
- Request fields: `places.displayName,places.formattedAddress,places.location`
- Request body: `{ textQuery, locationBias: { circle: { center, radius } }, maxResultCount: 8 }`
- Map response to existing `PlaceResult` type (no downstream changes)
- Keep `searchNominatim()` as fallback on failure

### `app.json`
- Add `GOOGLE_PLACES_API_KEY` under `extra`

### API Key Access
- Read via `expo-constants`: `Constants.expoConfig.extra.googlePlacesApiKey`

## No changes needed
- `PlaceResult` type unchanged
- Search screen, map store, map component all work as-is
- Location bias from current map region already passed through

## Cost
$200/mo free Google Cloud credit. Text Search (Basic) = $0.032/request = ~6,250 free searches/month.
