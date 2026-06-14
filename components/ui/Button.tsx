import { Pressable, Text, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { makeStyles, useTheme } from "@/theme";

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
  const theme = useTheme();
  const styles = useStyles();
  const bg =
    variant === "primary"
      ? theme.colors.accent
      : variant === "danger"
        ? theme.colors.destructive
        : "transparent";
  const textColor =
    variant === "secondary" ? theme.colors.accent : theme.colors.onAccent;
  const borderColor = variant === "secondary" ? theme.colors.accent : bg;

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

const useStyles = makeStyles((t) => ({
  button: {
    paddingVertical: t.spacing.md + 2,
    paddingHorizontal: t.spacing.xl,
    borderRadius: t.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  text: { ...t.typography.headline },
}));
