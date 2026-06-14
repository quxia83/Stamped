import { View, Text, Pressable, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  onLocationFound: (latitude: number, longitude: number) => void;
  onFitAll?: () => void;
  placeCount: number;
  noLocationCount: number;
};

export function MapControls({ onLocationFound, onFitAll, placeCount, noLocationCount }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();

  const goToMyLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      <View style={styles.badge} pointerEvents="none">
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>
            {t("map.placeCount", { count: placeCount })}
            {noLocationCount > 0 ? ` · ${t("map.noLocation", { count: noLocationCount })}` : ""}
          </Text>
        </View>
      </View>
      <View style={styles.container}>
        {onFitAll && placeCount > 0 && (
          <Pressable
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onFitAll();
            }}
            accessibilityLabel={t("map.fitAll", { defaultValue: "Show all pins" })}
            accessibilityRole="button"
          >
            <FontAwesome name="compress" size={18} color={theme.colors.accent} />
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
          onPress={goToMyLocation}
          accessibilityLabel={t("map.myLocation", { defaultValue: "My location" })}
          accessibilityRole="button"
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
  badgePill: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.full,
    paddingHorizontal: t.spacing.md,
    paddingVertical: 6,
    ...t.shadow.level1,
  },
  badgeText: {
    color: t.colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  container: {
    position: "absolute",
    right: t.spacing.lg,
    bottom: t.spacing.xl,
    gap: t.spacing.sm,
  },
  button: {
    backgroundColor: t.colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    ...t.shadow.level2,
  },
}));
