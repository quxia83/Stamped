import { View, TextInput } from "react-native";
import { Chip } from "@/components/ui/Chip";
import { currencies } from "@/lib/constants";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  cost: string;
  currency: string;
  onCostChange: (cost: string) => void;
  onCurrencyChange: (currency: string) => void;
};

export function CostInput({ cost, currency, onCostChange, onCurrencyChange }: Props) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View>
      <TextInput
        style={styles.input}
        value={cost}
        onChangeText={onCostChange}
        placeholder="0.00"
        placeholderTextColor={theme.colors.textSecondary}
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

const useStyles = makeStyles((t) => ({
  input: {
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    color: t.colors.text,
    backgroundColor: t.colors.surface,
    marginBottom: t.spacing.sm,
  },
  currencies: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
}));
