import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CategoryPicker } from "@/components/common/CategoryPicker";
import { DatePicker } from "@/components/common/DatePicker";
import { PersonPicker } from "@/components/common/PersonPicker";
import { RatingInput } from "@/components/visit/RatingInput";
import { CostInput } from "@/components/visit/CostInput";
import { TagPicker } from "@/components/visit/TagPicker";
import { PhotoPicker } from "@/components/visit/PhotoPicker";
import { PriceLevelPicker } from "@/components/visit/PriceLevelPicker";
import { Button } from "@/components/ui/Button";
import { insertPlace, updatePlace } from "@/db/queries/places";
import { insertVisit, getVisitById, updateVisit } from "@/db/queries/visits";
import { insertPhoto, getPhotosForVisit, deletePhoto } from "@/db/queries/photos";
import { getTagsForVisit, setVisitTags } from "@/db/queries/tags";
import * as Location from "expo-location";
import { colors } from "@/lib/constants";

type PhotoItem = { id?: number; uri: string };

export default function NewVisitScreen() {
  const params = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    editId?: string;
    placeId?: string;
    placeName?: string;
  }>();
  const router = useRouter();
  const isEdit = !!params.editId;

  const [name, setName] = useState(params.placeName ?? "");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [date, setDate] = useState(new Date());
  const [rating, setRating] = useState(0);
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [whoPaidId, setWhoPaidId] = useState<number | undefined>();
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [localPhotos, setLocalPhotos] = useState<PhotoItem[]>([]);
  const [priceLevel, setPriceLevel] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);
  const [addressManuallyEdited, setAddressManuallyEdited] = useState(false);
  const [lat, setLat] = useState(params.lat ? parseFloat(params.lat) : 0);
  const [lng, setLng] = useState(params.lng ? parseFloat(params.lng) : 0);
  const [existingPlaceId, setExistingPlaceId] = useState<number | undefined>(
    params.placeId ? parseInt(params.placeId) : undefined
  );

  useEffect(() => {
    if (params.editId) {
      loadVisit(parseInt(params.editId));
    } else if (params.lat && params.lng) {
      reverseGeocode(parseFloat(params.lat), parseFloat(params.lng));
    } else if (!params.lat && !params.lng && !params.placeId) {
      // Adding without map — use current location
      getCurrentLocation();
    }
  }, [params.editId, params.lat, params.lng]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setLat(loc.coords.latitude);
      setLng(loc.coords.longitude);
      reverseGeocode(loc.coords.latitude, loc.coords.longitude);
    } catch {}
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (results.length > 0) {
        const r = results[0];
        const parts = [r.streetNumber, r.street].filter(Boolean);
        const cityParts = [r.city, r.region, r.postalCode].filter(Boolean);
        setAddress([parts.join(" "), ...cityParts].filter(Boolean).join(", "));
      }
    } catch {}
  };

  const loadVisit = async (visitId: number) => {
    const [visit] = await getVisitById(visitId);
    if (!visit) return;
    setName(visit.placeName ?? "");
    setAddress(visit.placeAddress ?? "");
    setCategoryId(visit.categoryId ?? undefined);
    const [y, m, d] = visit.date.split("-").map(Number);
    setDate(new Date(y, m - 1, d));
    setRating(visit.rating ?? 0);
    setCost(visit.cost?.toString() ?? "");
    setCurrency(visit.currency ?? "USD");
    setWhoPaidId(visit.whoPaidId ?? undefined);
    setPriceLevel(visit.priceLevel ?? undefined);
    setNotes(visit.notes ?? "");
    setExistingPlaceId(visit.placeId);
    setLat(visit.placeLatitude ?? 0);
    setLng(visit.placeLongitude ?? 0);

    const visitTags = await getTagsForVisit(visitId);
    setSelectedTags(visitTags.map((t) => t.id));

    const visitPhotos = await getPhotosForVisit(visitId);
    setLocalPhotos(visitPhotos.map((p) => ({ id: p.id, uri: p.uri })));
  };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const addPhoto = (uri: string) => {
    setLocalPhotos((prev) => [...prev, { uri }]);
  };

  const removePhoto = (index: number) => {
    setLocalPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a place name.");
      return;
    }

    setSaving(true);
    try {
      let placeLat = lat;
      let placeLng = lng;

      // Forward-geocode if address was manually changed, or if we still have no coordinates
      if (address.trim() && (addressManuallyEdited || (placeLat === 0 && placeLng === 0))) {
        try {
          const results = await Location.geocodeAsync(address.trim());
          if (results.length > 0) {
            placeLat = results[0].latitude;
            placeLng = results[0].longitude;
          }
        } catch {}
      }

      let placeId = existingPlaceId;

      if (!placeId) {
        const [place] = await insertPlace({
          name: name.trim(),
          address: address.trim() || undefined,
          latitude: placeLat,
          longitude: placeLng,
          categoryId,
        });
        placeId = place.id;
      }

      if (existingPlaceId) {
        await updatePlace(existingPlaceId, {
          name: name.trim(),
          address: address.trim() || undefined,
          latitude: placeLat,
          longitude: placeLng,
          categoryId,
        });
      }

      const visitData = {
        placeId: placeId!,
        date: format(date, "yyyy-MM-dd"),
        rating: rating || undefined,
        cost: cost ? parseFloat(cost) : undefined,
        currency,
        whoPaidId,
        priceLevel,
        notes: notes.trim() || undefined,
      };

      let visitId: number;
      if (isEdit) {
        visitId = parseInt(params.editId!);
        await updateVisit(visitId, visitData);
      } else {
        const [visit] = await insertVisit(visitData);
        visitId = visit.id;
      }

      await setVisitTags(visitId, selectedTags);

      // Handle photos
      if (isEdit) {
        const existing = await getPhotosForVisit(visitId);
        const currentUris = new Set(localPhotos.map((p) => p.uri));
        for (const ex of existing) {
          if (!currentUris.has(ex.uri)) {
            await deletePhoto(ex.id);
          }
        }
      }

      const existingUris = isEdit
        ? new Set((await getPhotosForVisit(visitId)).map((p) => p.uri))
        : new Set<string>();

      for (const photo of localPhotos) {
        if (!existingUris.has(photo.uri)) {
          await insertPhoto(visitId, photo.uri);
        }
      }

      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{ title: isEdit ? "Edit Visit" : "New Visit" }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.label}>Place Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. The Coffee House"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={(t) => { setAddress(t); setAddressManuallyEdited(true); }}
            placeholder="123 Main St"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Category</Text>
          <CategoryPicker selectedId={categoryId} onSelect={setCategoryId} />

          <Text style={styles.label}>Date</Text>
          <DatePicker value={date} onChange={setDate} />

          <Text style={styles.label}>Rating</Text>
          <RatingInput value={rating} onChange={setRating} />

          <Text style={styles.label}>Cost</Text>
          <CostInput
            cost={cost}
            currency={currency}
            onCostChange={setCost}
            onCurrencyChange={setCurrency}
          />

          <Text style={styles.label}>Price Level</Text>
          <PriceLevelPicker value={priceLevel} onChange={setPriceLevel} />

          <Text style={styles.label}>Who Paid</Text>
          <PersonPicker selectedId={whoPaidId} onSelect={setWhoPaidId} />

          <Text style={styles.label}>Tags</Text>
          <TagPicker selectedIds={selectedTags} onToggle={toggleTag} />

          <Text style={styles.label}>Photos</Text>
          <PhotoPicker
            photos={localPhotos}
            onAdd={addPhoto}
            onRemove={removePhoto}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How was it?"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />

          <View style={styles.buttonRow}>
            <Button
              title={isEdit ? "Save Changes" : "Add Visit"}
              onPress={save}
              loading={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    marginTop: 24,
  },
});
