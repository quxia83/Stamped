import { Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/lib/constants";

type Props = {
  label: string;
  selected?: boolean;
  color?: string;
  onPress?: () => void;
};

export function Chip({ label, selected, color, onPress }: Props) {
  const bgColor = selected ? (color ?? colors.accent) : colors.surface;
  const textColor = selected ? "#fff" : colors.text;
  const borderColor = selected ? bgColor : colors.border;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: bgColor, borderColor }]}
    >
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});
