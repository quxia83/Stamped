import { View, Text, FlatList, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { format, parseISO } from "date-fns";
import { getPlaceWithStats, deletePlace } from "@/db/queries/places";
import { getVisitsByPlaceId, deleteVisit } from "@/db/queries/visits";
import { deletePhotosForVisit } from "@/db/queries/photos";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { colors } from "@/lib/constants";

type PlaceStats = Awaited<ReturnType<typeof getPlaceWithStats>>[number];
type Visit = Awaited<ReturnType<typeof getVisitsByPlaceId>>[number];

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<PlaceStats | null>(null);
  const [placeVisits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    const placeId = parseInt(id!);
    getPlaceWithStats(placeId).then(([p]) => setPlace(p ?? null));
    getVisitsByPlaceId(placeId).then(setVisits);
  }, [id]);

  const handleDeletePlace = () => {
    const placeId = parseInt(id!);
    const hasVisits = placeVisits.length > 0;
    const message = hasVisits
      ? `This will delete "${place?.name}" and its ${placeVisits.length} visit(s). This cannot be undone.`
      : `Delete "${place?.name}" from the map?`;

    Alert.alert("Delete Place", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
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

  if (!place) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: place.name,
          headerRight: () => (
            <IconButton name="trash" color="#dc3545" onPress={handleDeletePlace} />
          ),
        }}
      />
      <FlatList
        data={placeVisits}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View>
            {/* Place header */}
            <View style={styles.header}>
              <Text style={styles.icon}>{place.categoryIcon ?? "📍"}</Text>
              <Text style={styles.name}>{place.name}</Text>
              {place.address && (
                <Text style={styles.address}>{place.address}</Text>
              )}
              <Text style={styles.category}>{place.categoryName ?? "Other"}</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{place.visitCount}</Text>
                <Text style={styles.statLabel}>Visits</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {place.avgRating ? place.avgRating.toFixed(1) : "-"}
                </Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {place.totalSpent ? `$${place.totalSpent.toFixed(0)}` : "-"}
                </Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
            </View>

            <Button
              title="Add Visit Here"
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

            <Text style={styles.visitListTitle}>Visit History</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.visitRow}>
              <View style={styles.visitInfo}>
                <Text style={styles.visitDate}>
                  {format(parseISO(item.date + "T00:00:00"), "MMM d, yyyy")}
                </Text>
                {item.rating != null && (
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FontAwesome
                        key={s}
                        name={s <= item.rating! ? "star" : "star-o"}
                        size={14}
                        color={
                          s <= item.rating! ? colors.star : colors.starEmpty
                        }
                      />
                    ))}
                  </View>
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
        )}
        contentContainerStyle={styles.container}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  address: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  category: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: "600",
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  visitListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
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
    color: colors.text,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
  },
  visitCost: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  visitNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
