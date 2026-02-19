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
      {/* Custom pin view */}
      <View style={styles.pinWrapper}>
        <View style={styles.label}>
          <Text style={styles.labelText} numberOfLines={1}>{name}</Text>
        </View>
        <View style={[styles.bubble, { backgroundColor: pinColor }]}>
          <Text style={styles.emoji}>{categoryIcon ?? "📍"}</Text>
        </View>
        <View style={[styles.tail, { borderTopColor: pinColor }]} />
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

const BUBBLE = 42;
const TAIL = 10;

const styles = StyleSheet.create({
  pinWrapper: {
    alignItems: "center",
  },
  label: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 5,
    maxWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 3,
  },
  labelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1a1a2e",
    textAlign: "center",
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  emoji: {
    fontSize: 20,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: TAIL / 2,
    borderRightWidth: TAIL / 2,
    borderTopWidth: TAIL,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    // borderTopColor set dynamically
    marginTop: -1,
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
