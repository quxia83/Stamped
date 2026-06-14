import { forwardRef, useImperativeHandle } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@/theme";

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
  const { t } = useTranslation();
  const styles = useStyles();

  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("map.yourPlaces")}</Text>
      {places.length === 0 && (
        <Text style={styles.empty}>{t("map.noPlaces")}</Text>
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

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { padding: t.spacing.lg },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: t.colors.text,
    marginBottom: t.spacing.md,
  },
  empty: {
    fontSize: 15,
    color: t.colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.colors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: t.spacing.sm,
    gap: t.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.colors.border,
  },
  icon: { fontSize: 22 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: "600", color: t.colors.text },
  coords: { fontSize: 12, color: t.colors.textSecondary, marginTop: 2 },
}));
