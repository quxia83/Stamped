import { View, Image, Pressable, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system/next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/lib/constants";
import { PHOTO_DIR, resolvePhotoUri } from "@/lib/photoUtils";
import { useThemeStore } from "@/stores/useThemeStore";

type PhotoItem = {
  id?: number;
  uri: string;
};

type Props = {
  photos: PhotoItem[];
  onAdd: (uri: string) => void;
  onRemove: (index: number) => void;
};

function ensureDir() {
  if (!PHOTO_DIR.exists) {
    PHOTO_DIR.create();
  }
}

export function PhotoPicker({ photos, onAdd, onRemove }: Props) {
  const { t } = useTranslation();
  const accentColor = useThemeStore((s) => s.accentColor);
  const pickImage = async (fromCamera: boolean) => {
    const permMethod = fromCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { granted } = await permMethod();
    if (!granted) {
      Alert.alert(t("photo.permissionNeeded"), t("photo.grantAccess"));
      return;
    }

    const method = fromCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await method({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: !fromCamera,
    });

    if (result.canceled) return;

    ensureDir();

    for (const asset of result.assets) {
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const source = new File(asset.uri);
      const dest = new File(PHOTO_DIR, filename);
      source.copy(dest);
      onAdd(filename); // store just the filename, not the absolute path
    }
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {photos.map((photo, index) => (
          <View key={photo.uri} style={styles.photoContainer}>
            <Image source={{ uri: resolvePhotoUri(photo.uri) }} style={styles.photo} />
            <Pressable style={styles.removeBtn} onPress={() => onRemove(index)}>
              <FontAwesome name="times-circle" size={22} color="#dc3545" />
            </Pressable>
          </View>
        ))}
        <View style={styles.addButtons}>
          <Pressable style={styles.addBtn} onPress={() => pickImage(false)}>
            <FontAwesome name="photo" size={24} color={accentColor} />
            <Text style={[styles.addText, { color: accentColor }]}>{t("photo.gallery")}</Text>
          </Pressable>
          <Pressable style={styles.addBtn} onPress={() => pickImage(true)}>
            <FontAwesome name="camera" size={24} color={accentColor} />
            <Text style={[styles.addText, { color: accentColor }]}>{t("photo.camera")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  photoContainer: {
    marginRight: 10,
    position: "relative",
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addButtons: {
    flexDirection: "row",
    gap: 8,
  },
  addBtn: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addText: {
    fontSize: 12,
  },
});
