import { useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { StyleSheet } from "react-native";
import MapView from "react-native-map-clustering";
import { Region, LongPressEvent } from "react-native-maps";
import { PlaceMarker } from "./PlaceMarker";
import { useMapStore } from "@/stores/useMapStore";

type Place = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  categoryId: number | null;
  categoryIcon: string | null;
};

type Props = {
  places: Place[];
  onLongPress: (latitude: number, longitude: number) => void;
  onMarkerPress: (placeId: number) => void;
  onCalloutPress: (placeId: number) => void;
};

export type StampedMapHandle = {
  animateToRegion: (region: Region, duration?: number) => void;
};

export const StampedMap = forwardRef<StampedMapHandle, Props>(function StampedMap(
  { places, onLongPress, onMarkerPress, onCalloutPress },
  ref
) {
  const mapRef = useRef<any>(null);
  const { region, setRegion } = useMapStore();

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
      clusterColor="#e94560"
    >
      {places.map((place) => (
        <PlaceMarker
          key={place.id}
          id={place.id}
          name={place.name}
          latitude={place.latitude}
          longitude={place.longitude}
          categoryIcon={place.categoryIcon}
          categoryIndex={(place.categoryId ?? 7) - 1}
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
