import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { colors } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";

type Props = {
  onLocationFound: (latitude: number, longitude: number) => void;
  placeCount: number;
  noLocationCount: number;
};

export function MapControls({ onLocationFound, placeCount, noLocationCount }: Props) {
  const { t } = useTranslation();
  const accentColor = useThemeStore((s) => s.accentColor);
  const goToMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("map.permissionDenied"), t("map.locationPermissionNeeded"));
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    onLocationFound(location.coords.latitude, location.coords.longitude);
  };

  return (
    <>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {t("map.placeCount", { count: placeCount })}
          {noLocationCount > 0 ? ` · ${t("map.noLocation", { count: noLocationCount })}` : ""}
        </Text>
      </View>
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
          onPress={goToMyLocation}
        >
          <FontAwesome name="location-arrow" size={20} color={accentColor} />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  badgeText: {
    backgroundColor: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  container: {
    position: "absolute",
    right: 16,
    bottom: 24,
  },
  button: {
    backgroundColor: colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
