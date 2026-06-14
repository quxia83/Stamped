import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/Card";
import { useFilterStore } from "@/stores/useFilterStore";
import { StarDisplay } from "@/components/visit/RatingInput";
import { makeStyles } from "@/theme";

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
  const styles = useStyles();
  const setFilter = useFilterStore((s) => s.setFilter);

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
    <Pressable onPress={() => router.push(`/visit/${id}`)}>
      <Card>
        <View style={styles.row}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          ) : (
            <Pressable onPress={filterByCategory} hitSlop={4}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>{categoryIcon ?? "📍"}</Text>
              </View>
            </Pressable>
          )}
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {placeName ?? t("common.unknown")}
              </Text>
            </View>
            <Text style={styles.date}>{format(parseISO(date + "T00:00:00"), "MMM d, yyyy")}</Text>
            <View style={styles.meta}>
              {rating != null && (
                <StarDisplay rating={rating} size={13} />
              )}
              {cost != null && cost > 0 && (
                <Text style={styles.cost}>
                  {currency ?? "USD"} {cost.toFixed(2)}
                </Text>
              )}
            </View>
            {tags && tags.length > 0 && (
              <View style={styles.tags}>
                {tags.map((tag) => (
                  <Pressable
                    key={tag.id}
                    style={[styles.tag, { backgroundColor: tag.color + "20" }]}
                    onPress={() => filterByTag(tag.id)}
                  >
                    <Text style={[styles.tagText, { color: tag.color }]}>
                      {tag.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    gap: t.spacing.md,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: t.radius.sm,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: t.radius.sm,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    ...t.typography.headline,
    color: t.colors.text,
    flex: 1,
  },
  date: {
    fontSize: 13,
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
    fontWeight: "500",
    color: t.colors.text,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.xs,
    marginTop: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
}));
