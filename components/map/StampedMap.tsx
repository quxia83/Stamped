import { useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView from "react-native-map-clustering";
import { Marker, Callout, Region, LongPressEvent } from "react-native-maps";
import { PlaceMarker } from "./PlaceMarker";
import { useMapStore, type SearchPin } from "@/stores/useMapStore";
import { useThemeStore } from "@/stores/useThemeStore";

type Place = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  categoryId: number | null;
  categoryIcon: string | null;
  firstPhotoUri: string | null;
};

type Props = {
  places: Place[];
  searchPin: SearchPin | null;
  onLongPress: (latitude: number, longitude: number) => void;
  onMarkerPress: (placeId: number) => void;
  onCalloutPress: (placeId: number) => void;
  onSearchPinPress: (pin: SearchPin) => void;
};

export type StampedMapHandle = {
  animateToRegion: (region: Region, duration?: number) => void;
};

export const StampedMap = forwardRef<StampedMapHandle, Props>(function StampedMap(
  { places, searchPin, onLongPress, onMarkerPress, onCalloutPress, onSearchPinPress },
  ref
) {
  const mapRef = useRef<any>(null);
  const { region, setRegion } = useMapStore();
  const pinColor = useThemeStore((s) => s.accentColor);

  const renderCluster = useCallback(
    (cluster: any) => {
      const { id, geometry, onPress, properties } = cluster;
      const count = properties.point_count;
      const size = count < 10 ? 40 : count < 50 ? 50 : 60;
      return (
        <Marker
          key={`cluster-${id}`}
          coordinate={{ latitude: geometry.coordinates[1], longitude: geometry.coordinates[0] }}
          onPress={onPress}
        >
          <View style={[clusterStyles.bubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: pinColor }]}>
            <Text style={clusterStyles.count}>{count}</Text>
          </View>
        </Marker>
      );
    },
    [pinColor]
  );

  useImperativeHandle(ref, () => ({
    animateToRegion: (r: Region, duration = 500) => {
      mapRef.current?.animateToRegion(r, duration);
    },
  }));

  const handleLongPress = useCallback(
    (e: LongPressEvent) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      onLongPress(latitude, longitude);
    },
    [onLongPress]
  );

  const handleRegionChange = useCallback(
    (r: Region) => {
      setRegion(r);
    },
    [setRegion]
  );

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={region}
      onRegionChangeComplete={handleRegionChange}
      onLongPress={handleLongPress}
      showsUserLocation
      showsMyLocationButton={false}
      clusterColor={pinColor}
      renderCluster={renderCluster}
    >
      {searchPin && (
        <Marker
          coordinate={{ latitude: searchPin.latitude, longitude: searchPin.longitude }}
          anchor={{ x: 0.5, y: 1 }}
          zIndex={999}
        >
          <View style={searchPinStyles.container}>
            <View style={searchPinStyles.label}>
              <Text style={searchPinStyles.labelText} numberOfLines={2}>{searchPin.name}</Text>
            </View>
            <View style={searchPinStyles.pin} />
            <View style={searchPinStyles.dot} />
          </View>
          <Callout onPress={() => onSearchPinPress(searchPin)}>
            <View style={searchPinStyles.callout}>
              <Text style={searchPinStyles.calloutName} numberOfLines={2}>{searchPin.name}</Text>
              <Text style={[searchPinStyles.calloutAction, { color: pinColor }]}>+ Add Visit</Text>
            </View>
          </Callout>
        </Marker>
      )}
      {places.map((place) => (
        <PlaceMarker
          key={place.id}
          id={place.id}
          name={place.name}
          latitude={place.latitude}
          longitude={place.longitude}
          categoryIcon={place.categoryIcon}
          categoryIndex={(place.categoryId ?? 7) - 1}
          firstPhotoUri={place.firstPhotoUri}
          onPress={onMarkerPress}
          onCalloutPress={onCalloutPress}
        />
      ))}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

const searchPinStyles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  callout: {
    padding: 10,
    minWidth: 160,
    maxWidth: 220,
  },
  calloutName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  calloutAction: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  label: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 180,
    marginBottom: 4,
  },
  labelText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1a1a2e",
    borderWidth: 3,
    borderColor: "#fff",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1a1a2e",
    marginTop: 2,
  },
});

const clusterStyles = StyleSheet.create({
  bubble: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  count: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
