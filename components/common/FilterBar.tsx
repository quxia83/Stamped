import { View, ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Chip } from "@/components/ui/Chip";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useFilterStore } from "@/stores/useFilterStore";
import { getAllCategories } from "@/db/queries/categories";
import { getAllTags } from "@/db/queries/tags";
import { makeStyles, useTheme, categoryColor } from "@/theme";

type Category = { id: number; name: string; icon: string };
type Tag = { id: number; label: string; color: string };

export function FilterBar() {
  const { t } = useTranslation();
  const store = useFilterStore();
  const theme = useTheme();
  const styles = useStyles();

  const sortOptions = [
    { field: "date" as const, label: t("filter.date") },
    { field: "rating" as const, label: t("filter.rating") },
    { field: "cost" as const, label: t("filter.cost") },
    { field: "name" as const, label: t("filter.name") },
  ];
  const [cats, setCats] = useState<Category[]>([]);
  const [allTags, setTags] = useState<Tag[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllCategories().then(setCats);
    getAllTags().then(setTags);
  }, []);

  const hasFilters = !!(
    store.categoryId ||
    store.minRating ||
    (store.tagIds && store.tagIds.length > 0) ||
    store.dateFrom ||
    store.dateTo
  );

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bar}
      >
        {/* All / reset */}
        <Chip
          label={t("filter.all")}
          selected={!hasFilters}
          onPress={() => store.clearFilters()}
        />

        {/* Sort toggle */}
        {sortOptions.map((opt) => (
          <Chip
            key={opt.field}
            label={
              store.sortField === opt.field
                ? `${opt.label} ${store.sortOrder === "asc" ? "↑" : "↓"}`
                : opt.label
            }
            selected={store.sortField === opt.field}
            onPress={() => {
              if (store.sortField === opt.field) {
                store.setFilter(
                  "sortOrder",
                  store.sortOrder === "asc" ? "desc" : "asc"
                );
              } else {
                store.setFilter("sortField", opt.field);
              }
            }}
          />
        ))}

        {/* Filter button */}
        <Pressable
          style={[
            styles.filterBtn,
            hasFilters && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
          ]}
          onPress={() => setShowFilters(true)}
          accessibilityLabel={hasFilters ? t("filter.filtersActive") : t("filter.filter")}
          accessibilityRole="button"
        >
          <FontAwesome
            name="filter"
            size={14}
            color={hasFilters ? theme.colors.onAccent : theme.colors.text}
          />
          <Text
            style={[
              styles.filterText,
              hasFilters && { color: theme.colors.onAccent },
            ]}
          >
            {t("filter.filter")}
          </Text>
        </Pressable>

      </ScrollView>

      <BottomSheet visible={showFilters} onClose={() => setShowFilters(false)}>
        <Text style={styles.sheetTitle}>{t("filter.category")}</Text>
        <View style={styles.chipRow}>
          <Chip
            label={t("filter.all")}
            selected={!store.categoryId}
            onPress={() => store.setFilter("categoryId", undefined)}
          />
          {cats.map((cat) => (
            <Chip
              key={cat.id}
              label={`${cat.icon} ${t(`category.${cat.name}`, { defaultValue: cat.name })}`}
              selected={store.categoryId === cat.id}
              color={categoryColor(cat.id)}
              onPress={() => store.setFilter("categoryId", cat.id)}
            />
          ))}
        </View>

        <Text style={styles.sheetTitle}>{t("filter.minRating")}</Text>
        <View style={styles.chipRow}>
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <Chip
              key={r}
              label={r === 0 ? t("filter.any") : `${"★".repeat(r)}`}
              selected={(store.minRating ?? 0) === r}
              onPress={() => store.setFilter("minRating", r || undefined)}
            />
          ))}
        </View>

        {allTags.length > 0 && (
          <>
            <Text style={styles.sheetTitle}>{t("filter.tags")}</Text>
            <View style={styles.chipRow}>
              {allTags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.label}
                  color={tag.color}
                  selected={store.tagIds?.includes(tag.id) ?? false}
                  onPress={() => {
                    const current = store.tagIds ?? [];
                    const next = current.includes(tag.id)
                      ? current.filter((id) => id !== tag.id)
                      : [...current, tag.id];
                    store.setFilter("tagIds", next.length > 0 ? next : undefined);
                  }}
                />
              ))}
            </View>
          </>
        )}
      </BottomSheet>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  bar: {
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    gap: 0,
    alignItems: "center",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.colors.border,
    marginRight: t.spacing.sm,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: t.colors.text,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: t.colors.text,
    marginTop: t.spacing.md,
    marginBottom: t.spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
}));
