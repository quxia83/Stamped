import { forwardRef, useImperativeHandle } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { colors } from "@/lib/constants";

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
  animateToRegion: (region: any, duration?: number) => void;
};

export const StampedMap = forwardRef<StampedMapHandle, Props>(function StampedMap(
  { places, onCalloutPress },
  ref
) {
  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Places</Text>
      {places.length === 0 && (
        <Text style={styles.empty}>No places yet. Use the Visits tab to add one.</Text>
      )}
      {places.map((place) => (
        <Pressable
          key={place.id}
          style={styles.placeRow}
          onPress={() => onCalloutPress(place.id)}
        >
          <Text style={styles.icon}>{place.categoryIcon ?? "📍"}</Text>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.coords}>
              {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  empty: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  icon: { fontSize: 22 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: "600", color: colors.text },
  coords: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
