import { View, TextInput } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const resolvedPlaceholder = placeholder ?? t("common.searchPlaceholder");
  return (
    <View style={styles.container}>
      <FontAwesome name="search" size={16} color={theme.colors.textSecondary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={theme.colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={resolvedPlaceholder}
        accessibilityRole="search"
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: t.spacing.lg,
    marginVertical: t.spacing.sm,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: t.colors.text,
  },
}));
