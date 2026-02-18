import { View, TextInput, Text, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/lib/constants";

type Props = {
  value: number;
  onChange: (rating: number) => void;
};

export function StarDisplay({ rating, size = 22 }: { rating: number; size?: number }) {
  return (
    <View style={[styles.stars, { gap: size * 0.18 }]}>
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(1, Math.max(0, rating - (s - 1)));
        return (
          <View key={s} style={{ width: size, height: size }}>
            <FontAwesome name="star-o" size={size} color={colors.starEmpty} />
            {fill > 0 && (
              <View style={{ position: "absolute", width: fill * size, overflow: "hidden" }}>
                <FontAwesome name="star" size={size} color={colors.star} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function RatingInput({ value, onChange }: Props) {
  const displayValue = value > 0 ? String(value) : "";

  const handleChange = (text: string) => {
    if (text === "" || text === ".") {
      onChange(0);
      return;
    }
    const n = parseFloat(text);
    if (!isNaN(n) && n >= 0 && n <= 5) {
      onChange(Math.round(n * 10) / 10);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={displayValue}
        onChangeText={handleChange}
        keyboardType="decimal-pad"
        placeholder="0 – 5"
        placeholderTextColor={colors.textSecondary}
        maxLength={3}
      />
      <StarDisplay rating={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    width: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    backgroundColor: colors.surface,
    textAlign: "center",
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
});
