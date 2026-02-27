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
  const { setRegion, searchPin, clearSearchPin } = useMapStore();
  const categoryId = useFilterStore((s) => s.categoryId);

  useFocusEffect(
    useCallback(() => {
      const { pendingRegion, clearPendingRegion } = useMapStore.getState();
      if (pendingRegion) {
        mapRef.current?.animateToRegion(pendingRegion, 600);
        clearPendingRegion();
      } else {
        const coords = places
          .filter((p) => p.latitude && p.longitude)
          .map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
        if (coords.length > 0) {
          setTimeout(() => mapRef.current?.fitToMarkers(coords), 300);
        }
      }
      return () => {
        clearSearchPin();
      };
    }, [clearSearchPin, places])
  );

  const validPlaces = places.filter((p) => p.latitude !== 0 || p.longitude !== 0);
  const noLocationCount = places.length - validPlaces.length;

  const filteredPlaces = categoryId
    ? validPlaces.filter((p) => p.categoryId === categoryId)
    : validPlaces;

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

  const handleSearchPinPress = useCallback(
    (pin: { name: string; latitude: number; longitude: number }) => {
      clearSearchPin();
      router.navigate({
        pathname: "/visit/new",
        params: {
          lat: pin.latitude.toString(),
          lng: pin.longitude.toString(),
          placeName: pin.name,
        },
      });
    },
    [router, clearSearchPin]
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
        onSearchPinPress={handleSearchPinPress}
      />
      <MapControls
        onLocationFound={handleLocationFound}
        placeCount={filteredPlaces.length}
        noLocationCount={noLocationCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
