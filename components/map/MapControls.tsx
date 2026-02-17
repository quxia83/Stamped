import { View, Pressable, StyleSheet, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Location from "expo-location";
import { colors } from "@/lib/constants";

type Props = {
  onLocationFound: (latitude: number, longitude: number) => void;
};

export function MapControls({ onLocationFound }: Props) {
  const goToMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location permission is needed.");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    onLocationFound(location.coords.latitude, location.coords.longitude);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
        onPress={goToMyLocation}
      >
        <FontAwesome name="location-arrow" size={20} color={colors.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
