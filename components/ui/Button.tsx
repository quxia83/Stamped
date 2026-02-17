import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "@/lib/constants";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
}: Props) {
  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "danger"
        ? "#dc3545"
        : "transparent";
  const textColor =
    variant === "secondary" ? colors.accent : "#fff";
  const borderColor = variant === "secondary" ? colors.accent : bg;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor, opacity: pressed || disabled ? 0.7 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
