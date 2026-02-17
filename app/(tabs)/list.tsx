import { FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { VisitCard } from "@/components/visit/VisitCard";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { useFilterStore } from "@/stores/useFilterStore";
import { getFilteredVisits, type VisitWithPlace } from "@/db/queries/visits";
import { getTagsForVisit } from "@/db/queries/tags";
import { getPhotosForVisit } from "@/db/queries/photos";

type VisitRow = VisitWithPlace & {
  tags: { label: string; color: string }[];
  thumbnail?: string;
};

export default function ListTab() {
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const filters = useFilterStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const raw = await getFilteredVisits(filters);
      const enriched = await Promise.all(
        raw.map(async (v) => {
          const tags = await getTagsForVisit(v.id);
          const photos = await getPhotosForVisit(v.id);
          return {
            ...v,
            tags,
            thumbnail: photos[0]?.uri,
          };
        })
      );
      if (!cancelled) setVisits(enriched);
    }

    load();
    // Re-run on filter changes — using a simple interval for reactivity
    const interval = setInterval(load, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    filters.sortField,
    filters.sortOrder,
    filters.categoryId,
    filters.tagIds,
    filters.minRating,
    filters.whoPaidId,
    filters.dateFrom,
    filters.dateTo,
    filters.searchQuery,
  ]);

  return (
    <>
      <FilterBar />
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
            categoryIcon={item.categoryIcon}
            categoryName={item.categoryName}
            thumbnail={item.thumbnail}
            tags={item.tags}
          />
        )}
        contentContainerStyle={visits.length === 0 ? styles.empty : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="list"
            title="No visits yet"
            message="Long-press on the map to add your first visit."
          />
        }
      />
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
