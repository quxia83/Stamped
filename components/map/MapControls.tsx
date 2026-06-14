import { View, Text, Pressable, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  onLocationFound: (latitude: number, longitude: number) => void;
  placeCount: number;
  noLocationCount: number;
};

export function MapControls({ onLocationFound, placeCount, noLocationCount }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();

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
          <FontAwesome name="location-arrow" size={20} color={theme.colors.accent} />
        </Pressable>
      </View>
    </>
  );
}

const useStyles = makeStyles((t) => ({
  badge: {
    position: "absolute",
    top: t.spacing.md,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  badgeText: {
    backgroundColor: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    borderRadius: t.spacing.md,
    overflow: "hidden",
    paddingHorizontal: t.spacing.md,
    paddingVertical: 5,
  },
  container: {
    position: "absolute",
    right: t.spacing.lg,
    bottom: t.spacing.xl,
  },
  button: {
    backgroundColor: t.colors.surface,
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
}));
