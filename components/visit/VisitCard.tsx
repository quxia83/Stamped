import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { PressableScale } from "@/components/ui/PressableScale";
import { useFilterStore } from "@/stores/useFilterStore";
import { StarDisplay } from "@/components/visit/RatingInput";
import { makeStyles, useTheme, categoryColor, withAlpha } from "@/theme";

type Props = {
  id: number;
  placeName: string | null;
  date: string;
  rating: number | null;
  cost: number | null;
  currency: string | null;
  categoryId: number | null;
  categoryIcon: string | null;
  categoryName: string | null;
  thumbnail?: string;
  tags?: { id: number; label: string; color: string }[];
};

export function VisitCard({
  id,
  placeName,
  date,
  rating,
  cost,
  currency,
  categoryId,
  categoryIcon,
  categoryName,
  thumbnail,
  tags,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const setFilter = useFilterStore((s) => s.setFilter);

  const catColor = categoryColor(categoryId);

  const filterByCategory = () => {
    if (categoryId == null) return;
    setFilter("categoryId", categoryId);
    router.navigate("/(tabs)/list");
  };

  const filterByTag = (tagId: number) => {
    setFilter("tagIds", [tagId]);
    router.navigate("/(tabs)/list");
  };

  return (
    <PressableScale
      onPress={() => router.push(`/visit/${id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${placeName ?? t("common.unknown")}, ${formatDate(date)}`}
    >
      <Card>
        <View style={styles.row}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          ) : (
            <Pressable onPress={filterByCategory} hitSlop={4}>
              <View style={[styles.iconBox, { backgroundColor: withAlpha(catColor, 0.15) }]}>
                <Text style={styles.icon}>{categoryIcon ?? "📍"}</Text>
              </View>
            </Pressable>
          )}
          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={1}>
              {placeName ?? t("common.unknown")}
            </Text>
            <Text style={styles.date}>{formatDate(date, "EEE, MMM d, yyyy")}</Text>
            <View style={styles.meta}>
              {rating != null && <StarDisplay rating={rating} size={13} />}
              {cost != null && cost > 0 && (
                <Text style={styles.cost}>{formatCurrency(cost, currency)}</Text>
              )}
            </View>
            {tags && tags.length > 0 && (
              <View style={styles.tags}>
                {tags.map((tag) => (
                  <Pressable
                    key={tag.id}
                    style={[styles.tag, { backgroundColor: withAlpha(tag.color, 0.16) }]}
                    onPress={() => filterByTag(tag.id)}
                  >
                    <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          <View style={[styles.categoryStripe, { backgroundColor: catColor }]} />
        </View>
      </Card>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    gap: t.spacing.md,
    alignItems: "center",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: t.radius.md,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: t.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  name: {
    ...t.typography.headline,
    color: t.colors.text,
  },
  date: {
    ...t.typography.footnote,
    color: t.colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    marginTop: 6,
  },
  cost: {
    fontSize: 13,
    fontWeight: "600",
    color: t.colors.text,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.xs,
    marginTop: t.spacing.sm,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: t.radius.full,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  categoryStripe: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: t.radius.full,
    minHeight: 44,
  },
}));
