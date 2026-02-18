// MapControls is not needed on web (no native map to control)
export function MapControls(_props: { onLocationFound: (lat: number, lng: number) => void }) {
  return null;
}
