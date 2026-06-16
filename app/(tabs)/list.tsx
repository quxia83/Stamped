import { FlatList, StyleSheet, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRouter } from "expo-router";
import { VisitCard } from "@/components/visit/VisitCard";
import { VisitCardSkeleton } from "@/components/visit/VisitCardSkeleton";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { LargeHeader } from "@/components/ui/LargeHeader";
import { useFilterStore } from "@/stores/useFilterStore";
import { getFilteredVisits, type VisitWithPlace, type VisitFilters } from "@/db/queries/visits";
import { getTagsForVisits } from "@/db/queries/tags";
import { getFirstPhotoForVisits } from "@/db/queries/photos";
import { resolvePhotoUri } from "@/lib/photoUtils";
import { useTheme } from "@/theme";

type VisitRow = VisitWithPlace & {
  tags: { id: number; label: string; color: string }[];
  thumbnail?: string;
};

export default function ListTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const filters = useFilterStore();
  const clearFilters = useFilterStore((s) => s.clearFilters);

  // Enrich visits with tags + first photo using batched queries (3 queries
  // total regardless of list size, instead of 2 per visit).
  const enrich = useCallback(async (current: VisitFilters): Promise<VisitRow[]> => {
    const raw = await getFilteredVisits(current);
    const ids = raw.map((v) => v.id);
    const [tagMap, photoMap] = await Promise.all([
      getTagsForVisits(ids),
      getFirstPhotoForVisits(ids),
    ]);
    return raw.map((v) => {
      const uri = photoMap.get(v.id);
      return {
        ...v,
        tags: tagMap.get(v.id) ?? [],
        thumbnail: uri ? resolvePhotoUri(uri) : undefined,
      };
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const data = await enrich(filters);
          if (!cancelled) setVisits(data);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
        clearFilters();
      };
    }, [
      enrich,
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setVisits(await enrich(useFilterStore.getState()));
    } finally {
      setRefreshing(false);
    }
  }, [enrich]);

  return (
    <>
      <LargeHeader title={t("tabs.visits")} />
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.textSecondary} />
          }
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={11}
          removeClippedSubviews
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
