import { View, ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Chip } from "@/components/ui/Chip";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useFilterStore } from "@/stores/useFilterStore";
import { getAllCategories } from "@/db/queries/categories";
import { getAllTags } from "@/db/queries/tags";
import { colors } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";

type Category = { id: number; name: string; icon: string };
type Tag = { id: number; label: string; color: string };

const sortOptions = [
  { field: "date" as const, label: "Date" },
  { field: "rating" as const, label: "Rating" },
  { field: "cost" as const, label: "Cost" },
  { field: "name" as const, label: "Name" },
];

export function FilterBar() {
  const store = useFilterStore();
  const accentColor = useThemeStore((s) => s.accentColor);
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
          label="All"
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
            hasFilters && { backgroundColor: accentColor, borderColor: accentColor },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <FontAwesome
            name="filter"
            size={14}
            color={hasFilters ? "#fff" : colors.text}
          />
          <Text
            style={[
              styles.filterText,
              hasFilters && { color: "#fff" },
            ]}
          >
            Filter
          </Text>
        </Pressable>

      </ScrollView>

      <BottomSheet visible={showFilters} onClose={() => setShowFilters(false)}>
        <Text style={styles.sheetTitle}>Category</Text>
        <View style={styles.chipRow}>
          <Chip
            label="All"
            selected={!store.categoryId}
            onPress={() => store.setFilter("categoryId", undefined)}
          />
          {cats.map((cat, i) => (
            <Chip
              key={cat.id}
              label={`${cat.icon} ${cat.name}`}
              selected={store.categoryId === cat.id}
              color={colors.categoryColors[i % colors.categoryColors.length]}
              onPress={() => store.setFilter("categoryId", cat.id)}
            />
          ))}
        </View>

        <Text style={styles.sheetTitle}>Min Rating</Text>
        <View style={styles.chipRow}>
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <Chip
              key={r}
              label={r === 0 ? "Any" : `${"★".repeat(r)}`}
              selected={(store.minRating ?? 0) === r}
              onPress={() => store.setFilter("minRating", r || undefined)}
            />
          ))}
        </View>

        {allTags.length > 0 && (
          <>
            <Text style={styles.sheetTitle}>Tags</Text>
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

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    borderColor: colors.border,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
