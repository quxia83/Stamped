import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Pressable,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { format, parseISO } from "date-fns";
import { StarDisplay } from "@/components/visit/RatingInput";
import { getVisitById, deleteVisit } from "@/db/queries/visits";
import { deleteOrphanPlace } from "@/db/queries/places";
import { getTagsForVisit } from "@/db/queries/tags";
import { getPhotosForVisit, deletePhotosForVisit } from "@/db/queries/photos";
import { resolvePhotoUri } from "@/lib/photoUtils";
import { useFilterStore } from "@/stores/useFilterStore";
import { IconButton } from "@/components/ui/IconButton";
import { colors } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";

type VisitDetail = Awaited<ReturnType<typeof getVisitById>>[number];
type Tag = { id: number; label: string; color: string };
type Photo = { id: number; uri: string };

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setFilter = useFilterStore((s) => s.setFilter);
  const accentColor = useThemeStore((s) => s.accentColor);
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const load = async () => {
    const visitId = parseInt(id!);
    const [v] = await getVisitById(visitId);
    if (v) {
      setVisit(v);
      setTags(await getTagsForVisit(visitId));
      setPhotos(await getPhotosForVisit(visitId));
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDelete = () => {
    Alert.alert("Delete Visit", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const visitId = parseInt(id!);
          const placeId = visit?.placeId;
          await deletePhotosForVisit(visitId);
          await deleteVisit(visitId);
          if (placeId) await deleteOrphanPlace(placeId);
          router.back();
        },
      },
    ]);
  };

  const openInMaps = () => {
    if (!visit) return;
    const q = visit.placeAddress
      ? encodeURIComponent(visit.placeAddress)
      : `${visit.placeLatitude},${visit.placeLongitude}`;
    Linking.openURL(`maps://?q=${q}`);
  };

  const filterByCategory = () => {
    if (!visit?.categoryId) return;
    setFilter("categoryId", visit.categoryId);
    router.navigate("/(tabs)/list");
  };

  const filterByTag = (tagId: number) => {
    setFilter("tagIds", [tagId]);
    router.navigate("/(tabs)/list");
  };

  if (!visit) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: visit.placeName ?? "Visit",
          headerRight: () => (
            <View style={styles.headerButtons}>
              <IconButton
                name="pencil"
                color={accentColor}
                onPress={() =>
                  router.push({
                    pathname: "/visit/new",
                    params: { editId: id },
                  })
                }
              />
              <IconButton name="trash" color="#dc3545" onPress={handleDelete} />
            </View>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Photos */}
        {photos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
          >
            {photos.map((photo) => (
              <Image
                key={photo.id}
                source={{ uri: resolvePhotoUri(photo.uri) }}
                style={styles.photo}
              />
            ))}
          </ScrollView>
        )}

        {/* Place name */}
        <View style={styles.placeRow}>
          <Pressable onPress={filterByCategory}>
            <Text style={styles.placeIcon}>
              {visit.categoryIcon ?? "📍"}
            </Text>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => router.push(`/place/${visit.placeId}`)}>
            <Text style={styles.placeName}>{visit.placeName}</Text>
            {visit.placeAddress && (
              <Pressable onPress={openInMaps}>
                <Text style={[styles.placeAddress, styles.addressLink, { color: accentColor }]}>
                  {visit.placeAddress} ↗
                </Text>
              </Pressable>
            )}
          </Pressable>
          <FontAwesome
            name="chevron-right"
            size={14}
            color={colors.textSecondary}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date</Text>
          <Text style={styles.sectionValue}>
            {format(parseISO(visit.date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
          </Text>
        </View>

        {/* Rating */}
        {visit.rating != null && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Rating</Text>
            <StarDisplay rating={visit.rating} size={24} />
          </View>
        )}

        {/* Cost */}
        {visit.cost != null && visit.cost > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Cost</Text>
            <Text style={styles.sectionValue}>
              {visit.currency ?? "USD"} {visit.cost.toFixed(2)}
              {visit.whoPaidName ? ` (paid by ${visit.whoPaidName})` : ""}
            </Text>
          </View>
        )}

        {/* Price Level */}
        {visit.priceLevel != null && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Price Level</Text>
            <Text style={styles.sectionValue}>{"$".repeat(visit.priceLevel)}</Text>
          </View>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagRow}>
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
          </View>
        )}

        {/* Notes */}
        {visit.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.notes}>{visit.notes}</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 4,
  },
  photoScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  photo: {
    width: 280,
    height: 200,
    borderRadius: 12,
    marginLeft: 16,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  placeIcon: {
    fontSize: 28,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  placeAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addressLink: {
    textDecorationLine: "underline",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 16,
    color: colors.text,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  notes: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
