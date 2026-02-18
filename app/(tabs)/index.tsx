import { View, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { StampedMap, type StampedMapHandle } from "@/components/map/StampedMap";
import { MapControls } from "@/components/map/MapControls";
import { usePlaces } from "@/hooks/usePlaces";
import { useMapStore } from "@/stores/useMapStore";
import { useFilterStore } from "@/stores/useFilterStore";

export default function MapTab() {
  const router = useRouter();
  const mapRef = useRef<StampedMapHandle>(null);
  const { data: places } = usePlaces();
  const { setRegion, pendingRegion, clearPendingRegion, searchPin, clearSearchPin } = useMapStore();
  const categoryId = useFilterStore((s) => s.categoryId);

  useFocusEffect(
    useCallback(() => {
      if (pendingRegion) {
        mapRef.current?.animateToRegion(pendingRegion, 600);
        clearPendingRegion();
      }
    }, [pendingRegion, clearPendingRegion])
  );

  const filteredPlaces = categoryId
    ? places.filter((p) => p.categoryId === categoryId)
    : places;

  const handleLongPress = useCallback(
    (latitude: number, longitude: number) => {
      clearSearchPin();
      router.push({
        pathname: "/visit/new",
        params: { lat: latitude.toString(), lng: longitude.toString() },
      });
    },
    [router, clearSearchPin]
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
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion);
    },
    [setRegion]
  );

  return (
    <View style={styles.container}>
      <StampedMap
        ref={mapRef}
        places={filteredPlaces}
        searchPin={searchPin}
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
