import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SearchBar } from "@/components/common/SearchBar";
import { VisitCard } from "@/components/visit/VisitCard";
import { EmptyState } from "@/components/common/EmptyState";
import { getFilteredVisits, type VisitWithPlace } from "@/db/queries/visits";
import { getTagsForVisit } from "@/db/queries/tags";
import { searchPlaces, type PlaceResult } from "@/lib/geocode";
import { useMapStore } from "@/stores/useMapStore";
import { colors } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";

type VisitRow = VisitWithPlace & {
  tags: { label: string; color: string }[];
};

export default function SearchScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const region = useMapStore((s) => s.region);
  const setSearchPin = useMapStore((s) => s.setSearchPin);
  const accentColor = useThemeStore((s) => s.accentColor);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setVisits([]);
      setPlaces([]);
      return;
    }

    const [raw, placeResults] = await Promise.all([
      getFilteredVisits({ searchQuery: q }),
      searchPlaces(q, region),
    ]);

    const enriched = await Promise.all(
      raw.map(async (v) => {
        const tags = await getTagsForVisit(v.id);
        return { ...v, tags };
      })
    );
    setVisits(enriched);
    setPlaces(placeResults);
  }, [region]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handlePlacePress = useCallback(
    (place: PlaceResult) => {
      const region = {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setSearchPin({ name: place.name, latitude: place.latitude, longitude: place.longitude }, region);
      router.navigate("/");
    },
    [setSearchPin, router]
  );

  const hasResults = places.length > 0 || visits.length > 0;

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t("search.placeholder")}
      />
      <FlatList
        data={[]}
        renderItem={null}
        contentContainerStyle={
          !hasResults && query ? styles.empty : undefined
        }
        ListHeaderComponent={
          <>
            {places.length > 0 && (
              <View>
                <Text style={styles.sectionHeader}>{t("search.places")}</Text>
                {places.map((place, i) => (
                  <Pressable
                    key={`place-${i}`}
                    style={styles.placeRow}
                    onPress={() => handlePlacePress(place)}
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={accentColor}
                      style={styles.placeIcon}
                    />
                    <View style={styles.placeText}>
                      <Text style={styles.placeName} numberOfLines={1}>
                        {place.name}
                      </Text>
                      <Text style={styles.placeAddress} numberOfLines={1}>
                        {place.displayName}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
            {visits.length > 0 && (
              <Text style={styles.sectionHeader}>{t("search.yourVisits")}</Text>
            )}
          </>
        }
        ListFooterComponent={
          <>
            {visits.map((item) => (
              <VisitCard
                key={item.id}
                id={item.id}
                placeName={item.placeName}
                date={item.date}
                rating={item.rating}
                cost={item.cost}
                currency={item.currency}
                categoryId={item.categoryId}
                categoryIcon={item.categoryIcon}
                categoryName={item.categoryName}
                tags={item.tags}
              />
            ))}
          </>
        }
        ListEmptyComponent={
          query && !hasResults ? (
            <EmptyState
              icon="search"
              title={t("search.noResultsTitle")}
              message={t("search.noResultsMessage", { query })}
            />
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
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  placeIcon: {
    marginRight: 12,
  },
  placeText: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  placeAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
