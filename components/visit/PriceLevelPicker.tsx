import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";

const LEVELS = [1, 2, 3, 4] as const;

export function priceLevelLabel(level: number): string {
  return "$".repeat(level);
}

type Props = {
  value: number | undefined;
  onChange: (level: number | undefined) => void;
};

export function PriceLevelPicker({ value, onChange }: Props) {
  const accentColor = useThemeStore((s) => s.accentColor);
  return (
    <View style={styles.row}>
      {LEVELS.map((level) => {
        const selected = value === level;
        return (
          <Pressable
            key={level}
            style={[styles.chip, selected && { backgroundColor: accentColor, borderColor: accentColor }]}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  labelSelected: {
    color: "#fff",
  },
});
