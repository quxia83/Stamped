import { View, StyleProp, ViewStyle } from "react-native";
import { makeStyles } from "@/theme";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: Props) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.md,
    padding: t.spacing.lg,
    marginHorizontal: t.spacing.lg,
    marginVertical: 6,
    ...t.shadow.level1,
  },
}));
