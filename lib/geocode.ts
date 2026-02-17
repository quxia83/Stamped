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

export async function searchPlaces(
  query: string,
  bias?: LocationBias
): Promise<PlaceResult[]> {
  // Try Photon first (better fuzzy matching & native proximity ranking)
  const photonResults = await searchPhoton(query, bias);
  if (photonResults.length > 0) return photonResults;

  // Fall back to Nominatim if Photon returns nothing
  return searchNominatim(query, bias);
}

async function searchPhoton(
  query: string,
  bias?: LocationBias
): Promise<PlaceResult[]> {
  const params: Record<string, string> = {
    q: query,
    limit: "8",
  };

  if (bias) {
    params.lat = bias.latitude.toFixed(6);
    params.lon = bias.longitude.toFixed(6);
    params.zoom = "10"; // city-level bias (~50-100 mile radius)
  }

  const url = `https://photon.komoot.io/api?${new URLSearchParams(params)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.features ?? []).map((f: any) => {
      const props = f.properties ?? {};
      const [lng, lat] = f.geometry?.coordinates ?? [0, 0];
      const parts = [props.street, props.city, props.state, props.country].filter(Boolean);
      return {
        name: props.name || parts[0] || "Unknown",
        displayName: parts.join(", ") || props.name || "Unknown",
        latitude: lat,
        longitude: lng,
      };
    });
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
