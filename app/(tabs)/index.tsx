import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { StampedMap } from "@/components/map/StampedMap";
import { MapControls } from "@/components/map/MapControls";
import { usePlaces } from "@/hooks/usePlaces";
import { useMapStore } from "@/stores/useMapStore";
import { useFilterStore } from "@/stores/useFilterStore";

export default function MapTab() {
  const router = useRouter();
  const { data: places } = usePlaces();
  const { setRegion } = useMapStore();
  const categoryId = useFilterStore((s) => s.categoryId);

  const filteredPlaces = categoryId
    ? places.filter((p) => p.categoryId === categoryId)
    : places;

  const handleLongPress = useCallback(
    (latitude: number, longitude: number) => {
      router.push({
        pathname: "/visit/new",
        params: { lat: latitude.toString(), lng: longitude.toString() },
      });
    },
    [router]
  );

  const handleMarkerPress = useCallback(
    (placeId: number) => {
      useMapStore.getState().setSelectedPlaceId(placeId);
    },
    []
  );

  const handleCalloutPress = useCallback(
    (placeId: number) => {
      router.push(`/place/${placeId}`);
    },
    [router]
  );

  const handleLocationFound = useCallback(
    (latitude: number, longitude: number) => {
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    },
    [setRegion]
  );

  return (
    <View style={styles.container}>
      <StampedMap
        places={filteredPlaces}
        onLongPress={handleLongPress}
        onMarkerPress={handleMarkerPress}
        onCalloutPress={handleCalloutPress}
      />
      <MapControls onLocationFound={handleLocationFound} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
