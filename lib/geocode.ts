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
  const params: Record<string, string> = {
    q: query,
    format: "json",
    limit: "8",
  };

  if (bias) {
    // viewbox = lon1,lat1,lon2,lat2 (left,top,right,bottom)
    const lonDelta = Math.max(bias.longitudeDelta, 0.5);
    const latDelta = Math.max(bias.latitudeDelta, 0.5);
    params.viewbox = [
      (bias.longitude - lonDelta).toFixed(6),
      (bias.latitude + latDelta).toFixed(6),
      (bias.longitude + lonDelta).toFixed(6),
      (bias.latitude - latDelta).toFixed(6),
    ].join(",");
    params.bounded = "0"; // prefer results in viewbox but don't exclude others
  }

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
}
