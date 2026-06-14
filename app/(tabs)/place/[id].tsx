import { View, Text, FlatList, Alert, StyleSheet, Pressable, Linking, Platform } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { format, parseISO } from "date-fns";
import { getPlaceWithStats, deletePlace } from "@/db/queries/places";
import { getVisitsByPlaceId, deleteVisit } from "@/db/queries/visits";
import { deletePhotosForVisit } from "@/db/queries/photos";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { StarDisplay } from "@/components/visit/RatingInput";
import { useFilterStore } from "@/stores/useFilterStore";
import { makeStyles, useTheme } from "@/theme";

type PlaceStats = Awaited<ReturnType<typeof getPlaceWithStats>>[number];
type Visit = Awaited<ReturnType<typeof getVisitsByPlaceId>>[number];

export default function PlaceDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setFilter = useFilterStore((s) => s.setFilter);
  const [place, setPlace] = useState<PlaceStats | null>(null);
  const [placeVisits, setVisits] = useState<Visit[]>([]);

  useFocusEffect(
    useCallback(() => {
      const placeId = parseInt(id!);
      getPlaceWithStats(placeId).then(([p]) => setPlace(p ?? null));
      getVisitsByPlaceId(placeId).then(setVisits);
    }, [id])
  );

  const openInMaps = () => {
    if (!place) return;
    const q = place.address
      ? encodeURIComponent(place.address)
      : `${place.latitude},${place.longitude}`;
    const url = Platform.OS === "ios"
      ? `https://maps.apple.com/?q=${q}`
      : `geo:${place.latitude},${place.longitude}?q=${q}`;
    Linking.openURL(url);
  };

  const handleDeletePlace = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const placeId = parseInt(id!);
    const hasVisits = placeVisits.length > 0;
    const message = hasVisits
      ? t("place.deletePlaceWithVisits", { name: place?.name, count: placeVisits.length })
      : t("place.deletePlaceNoVisits", { name: place?.name });

    Alert.alert(t("place.deletePlace"), message, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          // Delete all visits and their photos first
          for (const v of placeVisits) {
            await deletePhotosForVisit(v.id);
            await deleteVisit(v.id);
          }
          await deletePlace(placeId);
          router.back();
        },
      },
    ]);
  };

  if (!place) {
    return (
      <>
        <Stack.Screen options={{ title: "" }} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginBottom: 16 }}>{t("place.notFound", { defaultValue: "Place not found" })}</Text>
          <Button title={t("common.goBack", { defaultValue: "Go Back" })} onPress={() => router.back()} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: place.name,
          headerRight: () => (
            <IconButton name="trash" color={theme.colors.destructive} onPress={handleDeletePlace} />
          ),
        }}
      />
      <FlatList
        data={placeVisits}
        keyExtractor={(item) => item.id.toString()}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <View>
            {/* Place header */}
            <View style={styles.header}>
              <Text style={styles.icon}>{place.categoryIcon ?? "📍"}</Text>
              <Text style={styles.name}>{place.name}</Text>
              {place.address && (
                <Pressable onPress={openInMaps}>
                  <Text style={[styles.address, { color: theme.colors.accent }]}>
                    {place.address} ↗
                  </Text>
                </Pressable>
              )}
              {place.categoryId ? (
                <Pressable
                  onPress={() => {
                    setFilter("categoryId", place.categoryId!);
                    router.navigate("/(tabs)/list");
                  }}
                >
                  <Text style={[styles.category, { color: theme.colors.accent }]}>{t(`category.${place.categoryName}`, { defaultValue: place.categoryName ?? "" })}</Text>
                </Pressable>
              ) : (
                <Text style={[styles.category, { color: theme.colors.textSecondary }]}>{t("place.other")}</Text>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{place.visitCount}</Text>
                <Text style={styles.statLabel}>{t("place.visits")}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {place.avgRating ? place.avgRating.toFixed(1) : "-"}
                </Text>
                <Text style={styles.statLabel}>{t("place.avgRating")}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {place.totalSpent ? `$${place.totalSpent.toFixed(0)}` : "-"}
                </Text>
                <Text style={styles.statLabel}>{t("place.totalSpent")}</Text>
              </View>
            </View>

            <Button
              title={t("place.addVisitHere")}
              onPress={() =>
                router.push({
                  pathname: "/visit/new",
                  params: {
                    placeId: id,
                    placeName: place.name,
                    lat: place.latitude.toString(),
                    lng: place.longitude.toString(),
                  },
                })
              }
            />

            <Text style={styles.visitListTitle}>{t("place.visitHistory")}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/visit/${item.id}`)}>
            <Card>
              <View style={styles.visitRow}>
                <View style={styles.visitInfo}>
                  <Text style={styles.visitDate}>
                    {format(parseISO(item.date + "T00:00:00"), "MMM d, yyyy")}
                  </Text>
                  {item.rating != null && (
                    <StarDisplay rating={item.rating} size={14} />
                  )}
                </View>
                {item.cost != null && item.cost > 0 && (
                  <Text style={styles.visitCost}>
                    {item.currency ?? "USD"} {item.cost.toFixed(2)}
                  </Text>
                )}
                {item.notes && (
                  <Text style={styles.visitNotes} numberOfLines={2}>
                    {item.notes}
                  </Text>
                )}
              </View>
            </Card>
          </Pressable>
        )}
        contentContainerStyle={styles.container}
      />
    </>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    paddingBottom: 40,
    backgroundColor: t.colors.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: t.spacing.xl,
    paddingHorizontal: t.spacing.lg,
  },
  icon: {
    fontSize: 40,
    marginBottom: t.spacing.sm,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: t.colors.text,
    textAlign: "center",
  },
  address: {
    fontSize: 14,
    color: t.colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  category: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: t.spacing.lg,
    marginHorizontal: t.spacing.lg,
    marginBottom: t.spacing.lg,
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.md,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: t.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: t.colors.textSecondary,
    marginTop: 2,
  },
  visitListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: t.colors.text,
    paddingHorizontal: t.spacing.lg,
    paddingTop: 20,
    paddingBottom: t.spacing.sm,
  },
  visitRow: {
    gap: 4,
  },
  visitInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  visitDate: {
    fontSize: 15,
    fontWeight: "500",
    color: t.colors.text,
  },
  visitCost: {
    fontSize: 14,
    color: t.colors.textSecondary,
  },
  visitNotes: {
    fontSize: 13,
    color: t.colors.textSecondary,
    marginTop: 4,
  },
}));
