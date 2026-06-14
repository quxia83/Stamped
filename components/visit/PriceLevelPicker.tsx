import { View, Text, Pressable } from "react-native";
import { makeStyles, useTheme } from "@/theme";

const LEVELS = [1, 2, 3, 4] as const;

export function priceLevelLabel(level: number): string {
  return "$".repeat(level);
}

type Props = {
  value: number | undefined;
  onChange: (level: number | undefined) => void;
};

export function PriceLevelPicker({ value, onChange }: Props) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.row}>
      {LEVELS.map((level) => {
        const selected = value === level;
        return (
          <Pressable
            key={level}
            style={[styles.chip, selected && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
            onPress={() => onChange(selected ? undefined : level)}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {"$".repeat(level)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    gap: t.spacing.sm,
  },
  chip: {
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    borderRadius: t.radius.sm,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: t.colors.textSecondary,
  },
  labelSelected: {
    color: t.colors.onAccent,
  },
}));
