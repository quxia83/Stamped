import { FlatList, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRouter } from "expo-router";
import { VisitCard } from "@/components/visit/VisitCard";
import { VisitCardSkeleton } from "@/components/visit/VisitCardSkeleton";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { useFilterStore } from "@/stores/useFilterStore";
import { getFilteredVisits, type VisitWithPlace } from "@/db/queries/visits";
import { getTagsForVisit } from "@/db/queries/tags";
import { getPhotosForVisit } from "@/db/queries/photos";
import { resolvePhotoUri } from "@/lib/photoUtils";

type VisitRow = VisitWithPlace & {
  tags: { id: number; label: string; color: string }[];
  thumbnail?: string;
};

export default function ListTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const filters = useFilterStore();
  const clearFilters = useFilterStore((s) => s.clearFilters);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        try {
          const raw = await getFilteredVisits(filters);
          const enriched = await Promise.all(
            raw.map(async (v) => {
              const tags = await getTagsForVisit(v.id);
              const photos = await getPhotosForVisit(v.id);
              return {
                ...v,
                tags,
                thumbnail: photos[0] ? resolvePhotoUri(photos[0].uri) : undefined,
              };
            })
          );
          if (!cancelled) setVisits(enriched);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => {
        cancelled = true;
        clearFilters();
      };
    }, [
      clearFilters,
      filters.sortField,
      filters.sortOrder,
      filters.categoryId,
      filters.tagIds,
      filters.minRating,
      filters.whoPaidId,
      filters.dateFrom,
      filters.dateTo,
      filters.searchQuery,
    ])
  );

  return (
    <>
      <FilterBar />
      {loading ? (
        <FlatList
          data={[0, 1, 2, 3, 4, 5]}
          keyExtractor={(i) => `sk-${i}`}
          renderItem={() => <VisitCardSkeleton />}
          contentContainerStyle={styles.list}
          contentInsetAdjustmentBehavior="automatic"
        />
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <VisitCard
              id={item.id}
              placeName={item.placeName}
              date={item.date}
              rating={item.rating}
              cost={item.cost}
              currency={item.currency}
              categoryId={item.categoryId}
              categoryIcon={item.categoryIcon}
              categoryName={item.categoryName}
              thumbnail={item.thumbnail}
              tags={item.tags}
            />
          )}
          contentContainerStyle={visits.length === 0 ? styles.empty : styles.list}
          contentInsetAdjustmentBehavior="automatic"
          ListEmptyComponent={
            <EmptyState
              icon="bookmark"
              title={t("list.emptyTitle")}
              message={t("list.emptyMessage")}
              action={{ label: t("list.addFirst", { defaultValue: "Add a visit" }), onPress: () => router.push("/visit/new") }}
            />
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 20,
  },
  empty: {
    flex: 1,
  },
});
