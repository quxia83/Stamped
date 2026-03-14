import Constants from "expo-constants";

export type PlaceResult = {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
};

type LocationBias = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const GOOGLE_PLACES_API_KEY =
  Constants.expoConfig?.extra?.googlePlacesApiKey ?? "";

export type SearchResult = {
  places: PlaceResult[];
  error?: string;
};

export async function searchPlaces(
  query: string,
  bias?: LocationBias
): Promise<PlaceResult[]> {
  // Try Google Places first (best business/POI search)
  if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== "REPLACE_WITH_YOUR_GOOGLE_PLACES_API_KEY") {
    const googleResults = await searchGooglePlaces(query, bias);
    if (googleResults.length > 0) return googleResults;
  }

  // Fall back to Nominatim
  return searchNominatim(query, bias);
}

async function searchGooglePlaces(
  query: string,
  bias?: LocationBias
): Promise<PlaceResult[]> {
  const body: Record<string, any> = {
    textQuery: query,
    maxResultCount: 8,
  };

  if (bias) {
    // Convert map deltas to approximate radius in meters
    const radiusMeters = Math.max(
      bias.latitudeDelta * 111_320,
      bias.longitudeDelta * 111_320 * Math.cos(bias.latitude * (Math.PI / 180))
    );
    body.locationBias = {
      circle: {
        center: { latitude: bias.latitude, longitude: bias.longitude },
        radius: Math.min(radiusMeters, 50_000), // cap at 50km
      },
    };
  }

  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.location",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.places ?? []).map((place: any) => ({
      name: place.displayName?.text ?? "Unknown",
      displayName: place.formattedAddress ?? place.displayName?.text ?? "Unknown",
      latitude: place.location?.latitude ?? 0,
      longitude: place.location?.longitude ?? 0,
    }));
  } catch {
    return [];
  }
}

async function searchNominatim(
  query: string,
  bias?: LocationBias
): Promise<PlaceResult[]> {
  const params: Record<string, string> = {
    q: query,
    format: "json",
    limit: "8",
  };

  if (bias) {
    const lonDelta = Math.max(bias.longitudeDelta, 2.0);
    const latDelta = Math.max(bias.latitudeDelta, 2.0);
    params.viewbox = [
      (bias.longitude - lonDelta).toFixed(6),
      (bias.latitude + latDelta).toFixed(6),
      (bias.longitude + lonDelta).toFixed(6),
      (bias.latitude - latDelta).toFixed(6),
    ].join(",");
    params.bounded = "0";
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(params)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "StampedApp/1.0" },
    });
    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => ({
      name: item.name || item.display_name.split(",")[0],
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  } catch {
    return [];
  }
}
