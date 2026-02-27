import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert(t("visit.deleteVisit"), t("visit.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
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
    const url = Platform.OS === "ios"
      ? `https://maps.apple.com/?q=${q}`
      : `geo:${visit.placeLatitude},${visit.placeLongitude}?q=${q}`;
    Linking.openURL(url);
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
              <IconButton name="trash" color={accentColor} onPress={handleDelete} />
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
          <View style={{ flex: 1 }}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/visit/new",
                  params: {
                    placeId: visit.placeId.toString(),
                    placeName: visit.placeName ?? "",
                    lat: visit.placeLatitude?.toString() ?? "0",
                    lng: visit.placeLongitude?.toString() ?? "0",
                  },
                })
              }
            >
              <Text style={styles.placeName}>{visit.placeName}</Text>
            </Pressable>
            {visit.placeAddress && (
              <Pressable onPress={openInMaps}>
                <Text style={[styles.placeAddress, { color: accentColor }]}>
                  {visit.placeAddress} ↗
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("visit.date")}</Text>
          <Text style={styles.sectionValue}>
            {format(parseISO(visit.date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
          </Text>
        </View>

        {/* Rating */}
        {visit.rating != null && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t("visit.rating")}</Text>
            <StarDisplay rating={visit.rating} size={24} />
          </View>
        )}

        {/* Cost */}
        {visit.cost != null && visit.cost > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t("visit.cost")}</Text>
            <Text style={styles.sectionValue}>
              {visit.currency ?? "USD"} {visit.cost.toFixed(2)}
              {visit.whoPaidName ? ` (${t("visit.paidBy", { name: visit.whoPaidName })})` : ""}
            </Text>
          </View>
        )}

        {/* Attendees */}
        {visit.attendeeCount != null && visit.attendeeCount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t("visit.attendees")}</Text>
            <Text style={styles.sectionValue}>
              {t("visit.attendeeCount", { count: visit.attendeeCount })}
            </Text>
          </View>
        )}

        {/* Price Level */}
        {visit.priceLevel != null && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t("visit.priceLevel")}</Text>
            <Text style={styles.sectionValue}>{"$".repeat(visit.priceLevel)}</Text>
          </View>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t("visit.tags")}</Text>
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
            <Text style={styles.sectionLabel}>{t("visit.notes")}</Text>
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
