import { View, Text, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { makeStyles, useTheme } from "@/theme";

type Props = {
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon = "map-marker", title, message, action }: Props) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={48} color={theme.colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: t.spacing.xxl },
  title: { ...t.typography.title3, color: t.colors.textSecondary, marginTop: t.spacing.lg, textAlign: "center" },
  message: { ...t.typography.subhead, color: t.colors.textSecondary, marginTop: t.spacing.sm, textAlign: "center" },
  action: {
    marginTop: t.spacing.xl,
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.accent,
  },
  actionText: { ...t.typography.headline, color: t.colors.onAccent },
}));
