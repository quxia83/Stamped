import { View, FlatList, StyleSheet } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { VisitCard } from "@/components/visit/VisitCard";
import { EmptyState } from "@/components/common/EmptyState";
import { getFilteredVisits, type VisitWithPlace } from "@/db/queries/visits";
import { getTagsForVisit } from "@/db/queries/tags";
import { colors } from "@/lib/constants";

type VisitRow = VisitWithPlace & {
  tags: { label: string; color: string }[];
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VisitRow[]>([]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const raw = await getFilteredVisits({ searchQuery: q });
    const enriched = await Promise.all(
      raw.map(async (v) => {
        const tags = await getTagsForVisit(v.id);
        return { ...v, tags };
      })
    );
    setResults(enriched);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search places, notes, tags..."
      />
      <FlatList
        data={results}
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
            tags={item.tags}
          />
        )}
        contentContainerStyle={
          results.length === 0 && query ? styles.empty : undefined
        }
        ListEmptyComponent={
          query ? (
            <EmptyState icon="search" title="No results" message={`No matches for "${query}"`} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  empty: {
    flex: 1,
  },
});
