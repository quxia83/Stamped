import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";

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
  const accentColor = useThemeStore((s) => s.accentColor);
  const bg =
    variant === "primary"
      ? accentColor
      : variant === "danger"
        ? colors.destructive
        : "transparent";
  const textColor =
    variant === "secondary" ? accentColor : "#fff";
  const borderColor = variant === "secondary" ? accentColor : bg;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
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
