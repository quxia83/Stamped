import { View, TextInput, StyleSheet } from "react-native";
import { Chip } from "@/components/ui/Chip";
import { colors, currencies } from "@/lib/constants";

type Props = {
  cost: string;
  currency: string;
  onCostChange: (cost: string) => void;
  onCurrencyChange: (currency: string) => void;
};

export function CostInput({ cost, currency, onCostChange, onCurrencyChange }: Props) {
  return (
    <View>
      <TextInput
        style={styles.input}
        value={cost}
        onChangeText={onCostChange}
        placeholder="0.00"
        placeholderTextColor={colors.textSecondary}
        keyboardType="decimal-pad"
      />
      <View style={styles.currencies}>
        {currencies.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={currency === c}
            onPress={() => onCurrencyChange(c)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  currencies: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
