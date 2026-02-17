import { View, Text, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/lib/constants";

type Props = {
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
  message?: string;
};

export function EmptyState({ icon = "map-marker", title, message }: Props) {
  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={48} color={colors.border} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 16,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
});
