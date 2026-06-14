import { Pressable, Text } from "react-native";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  label: string;
  selected?: boolean;
  color?: string;
  onPress?: () => void;
};

export function Chip({ label, selected, color, onPress }: Props) {
  const theme = useTheme();
  const styles = useStyles();
  const bgColor = selected ? (color ?? theme.colors.accent) : theme.colors.surface;
  const textColor = selected ? theme.colors.onAccent : theme.colors.text;
  const borderColor = selected ? bgColor : theme.colors.border;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[styles.chip, { backgroundColor: bgColor, borderColor }]}
    >
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: t.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: t.spacing.sm,
    marginBottom: t.spacing.sm,
    minHeight: 36,
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
}));
