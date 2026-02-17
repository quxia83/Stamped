import { Marker, Callout } from "react-native-maps";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/lib/constants";

type Props = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  categoryIcon: string | null;
  categoryIndex: number;
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
  onPress,
  onCalloutPress,
}: Props) {
  const pinColor = colors.categoryColors[categoryIndex % colors.categoryColors.length];

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(id)}
      pinColor={pinColor}
    >
      <Callout onPress={() => onCalloutPress(id)}>
        <View style={styles.callout}>
          <Text style={styles.calloutIcon}>{categoryIcon ?? "📍"}</Text>
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
  calloutText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
