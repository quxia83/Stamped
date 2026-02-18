import { Marker, Callout } from "react-native-maps";
import { View, Text, Image, StyleSheet } from "react-native";
import { useThemeStore } from "@/stores/useThemeStore";

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
  categoryIndex,
  firstPhotoUri,
  onPress,
  onCalloutPress,
}: Props) {
  const pinColor = useThemeStore((s) => s.pinColor);

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(id)}
      pinColor={pinColor}
    >
      <Callout onPress={() => onCalloutPress(id)}>
        <View style={styles.callout}>
          {firstPhotoUri ? (
            <Image source={{ uri: firstPhotoUri }} style={styles.calloutImage} />
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

const styles = StyleSheet.create({
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
