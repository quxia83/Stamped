import { View, TextInput, Text, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/lib/constants";

type Props = {
  value: number;
  onChange: (rating: number) => void;
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(1, Math.max(0, rating - (s - 1)));
        const name = fill >= 1 ? "star" : fill >= 0.5 ? "star-half-o" : "star-o";
        return (
          <FontAwesome
            key={s}
            name={name}
            size={22}
            color={fill > 0 ? colors.star : colors.starEmpty}
          />
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
