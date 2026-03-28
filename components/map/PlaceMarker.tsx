import { Marker, Callout } from "react-native-maps";
import { View, Text, Image, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useThemeStore } from "@/stores/useThemeStore";
import { resolvePhotoUri } from "@/lib/photoUtils";

type Props = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  categoryIcon: string | null;
  categoryIndex: number;
  firstPhotoUri: string | null;
  onPress: (id: number) => void;
  onCalloutPress: (id: number) => void;
};

export function PlaceMarker({
  id,
  name,
  latitude,
  longitude,
  categoryIcon,
  firstPhotoUri,
  onPress,
  onCalloutPress,
}: Props) {
  const pinColor = useThemeStore((s) => s.accentColor);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(id)}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={tracksViewChanges}
    >
      {/* Apple Maps–style teardrop pin */}
      <View style={styles.pinWrapper}>
        <View style={styles.label}>
          <Text style={styles.labelText} numberOfLines={1}>{name}</Text>
        </View>
        <View style={styles.pinContainer}>
          <View style={[styles.pinHead, { backgroundColor: pinColor }]}>
            <Text style={styles.emoji}>{categoryIcon ?? "📍"}</Text>
          </View>
          <View style={[styles.pinTail, { backgroundColor: pinColor }]} />
          <View style={styles.pinDot} />
        </View>
      </View>

      <Callout onPress={() => onCalloutPress(id)}>
        <View style={styles.callout}>
          {firstPhotoUri ? (
            <Image source={{ uri: resolvePhotoUri(firstPhotoUri) }} style={styles.calloutImage} />
          ) : (
            <Text style={styles.calloutIcon}>{categoryIcon ?? "📍"}</Text>
          )}
          <Text style={styles.calloutText} numberOfLines={2}>
            {name}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
}

const PIN_SIZE = 36;
const TAIL_SIZE = 14;

const styles = StyleSheet.create({
  pinWrapper: {
    alignItems: "center",
  },
  label: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 4,
    maxWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  labelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1a1a2e",
    textAlign: "center",
  },
  pinContainer: {
    alignItems: "center",
    width: PIN_SIZE + 4,
    height: PIN_SIZE + TAIL_SIZE + 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 8,
  },
  pinHead: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
    zIndex: 2,
  },
  emoji: {
    fontSize: 17,
  },
  pinTail: {
    width: TAIL_SIZE,
    height: TAIL_SIZE,
    transform: [{ rotate: "45deg" }],
    borderRadius: 2,
    marginTop: -(TAIL_SIZE / 2) - 1,
    zIndex: 1,
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginTop: 2,
    zIndex: 0,
  },
  callout: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    maxWidth: 200,
    gap: 6,
  },
  calloutIcon: {
    fontSize: 18,
  },
  calloutImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  calloutText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
