import { useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
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

const PIN_SIZE = 44;

function SearchPinMarker({ pin, accentColor }: { pin: SearchPin; accentColor: string }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 850, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={pinStyles.container}>
      <View style={[pinStyles.label, { backgroundColor: accentColor }]}>
        <Text style={pinStyles.labelText} numberOfLines={1}>{pin.name}</Text>
      </View>
      <View style={pinStyles.pinArea}>
        <Animated.View
          style={[
            pinStyles.ring,
            { backgroundColor: accentColor, transform: [{ scale: pulseScale }], opacity: pulseOpacity },
          ]}
        />
        <View style={[pinStyles.circle, { backgroundColor: accentColor }]}>
          <View style={pinStyles.dot} />
        </View>
      </View>
    </View>
  );
}

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
          key={`${searchPin.latitude},${searchPin.longitude}`}
          coordinate={{ latitude: searchPin.latitude, longitude: searchPin.longitude }}
          anchor={{ x: 0.5, y: 0.78 }}
          zIndex={999}
          tracksViewChanges={false}
        >
          <SearchPinMarker pin={searchPin} accentColor={pinColor} />
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

const pinStyles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  label: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    maxWidth: 210,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  labelText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  pinArea: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
  },
  circle: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
  },
});

const searchPinStyles = StyleSheet.create({
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
