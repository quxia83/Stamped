import { View, Text } from "react-native";
import { makeStyles } from "@/theme";

/**
 * A large, bold screen title rendered at the top of a screen's content —
 * an iOS large-title look without the native-stack restructure. Pair with
 * `headerTitle: () => null` on the screen so the title isn't duplicated.
 */
export function LargeHeader({ title }: { title: string }) {
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.xs,
    paddingBottom: t.spacing.sm,
    backgroundColor: t.colors.background,
  },
  title: {
    ...t.typography.largeTitle,
    color: t.colors.text,
  },
}));
