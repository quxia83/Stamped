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
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
    >
      <FontAwesome name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
  },
});
