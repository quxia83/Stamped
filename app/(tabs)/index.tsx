import { View, Text, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StampedMap, type StampedMapHandle } from "@/components/map/StampedMap";
import { MapControls } from "@/components/map/MapControls";
import { usePlaces } from "@/hooks/usePlaces";
import { useMapStore } from "@/stores/useMapStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { useTheme } from "@/theme";

export default function MapTab() {
  const { t } = useTranslation();
  const theme = useTheme();
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

  const handleFitAll = useCallback(() => {
    const coords = filteredPlaces.map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));
    if (coords.length > 0) mapRef.current?.fitToMarkers(coords);
  }, [filteredPlaces]);

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
        onFitAll={handleFitAll}
        placeCount={filteredPlaces.length}
        noLocationCount={noLocationCount}
      />
      {places.length === 0 && (
        <View style={styles.hintWrap} pointerEvents="none">
          <View style={[styles.hintCard, { backgroundColor: theme.colors.surface }, theme.shadow.level2]}>
            <Text style={[styles.hintTitle, { color: theme.colors.text }]}>
              {t("map.emptyTitle", { defaultValue: "No visits yet" })}
            </Text>
            <Text style={[styles.hintMsg, { color: theme.colors.textSecondary }]}>
              {t("map.emptyMessage", { defaultValue: "Press and hold anywhere on the map to log your first visit." })}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hintWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  hintCard: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    maxWidth: 320,
  },
  hintTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  hintMsg: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
