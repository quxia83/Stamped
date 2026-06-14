import { View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { makeStyles } from "@/theme";

export function VisitCardSkeleton() {
  const styles = useStyles();
  return (
    <Card>
      <View style={styles.row}>
        <Skeleton width={56} height={56} radius={8} />
        <View style={styles.content}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="35%" height={12} style={styles.gap} />
          <Skeleton width="45%" height={12} style={styles.gap} />
        </View>
      </View>
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: "row", gap: t.spacing.md },
  content: { flex: 1, justifyContent: "center", gap: t.spacing.xs },
  gap: { marginTop: t.spacing.xs },
}));
