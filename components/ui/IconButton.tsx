import { Pressable, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type Props = {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  size?: number;
  color?: string;
  onPress: () => void;
};

export function IconButton({ name, size = 22, color = "#333", onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <FontAwesome name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
});
