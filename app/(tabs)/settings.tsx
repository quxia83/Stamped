import {
  View,
  Text,
  SectionList,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  getAllCategories,
  insertCategory,
  deleteCategory,
  updateCategory,
} from "@/db/queries/categories";
import { getAllTags, insertTag, deleteTag } from "@/db/queries/tags";
import { getAllPeople, insertPerson, deletePerson } from "@/db/queries/people";
import { colors } from "@/lib/constants";
import { useThemeStore, PIN_COLORS } from "@/stores/useThemeStore";

type Item = { id: number; name: string; extra?: string };
type Section = { title: string; data: Item[]; type: "category" | "tag" | "person" };

function ThemeColorPicker() {
  const { t } = useTranslation();
  const { accentColor, setAccentColor } = useThemeStore();
  return (
    <View style={styles.pinSection}>
      <Text style={styles.sectionTitle}>{t("settings.themeColor")}</Text>
      <View style={styles.swatchRow}>
        {PIN_COLORS.map((c) => (
          <Pressable
            key={c}
            style={[styles.swatch, { backgroundColor: c }, accentColor === c && styles.swatchSelected]}
            onPress={() => setAccentColor(c)}
          >
            {accentColor === c && (
              <FontAwesome name="check" size={14} color="#fff" />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function SettingsTab() {
  const { t } = useTranslation();
  const accentColor = useThemeStore((s) => s.accentColor);
  const [sections, setSections] = useState<Section[]>([]);
  const [addMode, setAddMode] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const load = async () => {
    const [cats, allTags, people] = await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllPeople(),
    ]);
    setSections([
      {
        title: t("settings.categories"),
        type: "category",
        data: cats.map((c) => ({ id: c.id, name: c.name, extra: c.icon })),
      },
      {
        title: t("settings.tags"),
        type: "tag",
        data: allTags.map((tg) => ({ id: tg.id, name: tg.label, extra: tg.color })),
      },
      {
        title: t("settings.people"),
        type: "person",
        data: people.map((p) => ({ id: p.id, name: p.name })),
      },
    ]);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (type: string) => {
    if (!newName.trim()) return;
    if (type === "category") await insertCategory(newName.trim(), "📍");
    else if (type === "tag") await insertTag(newName.trim(), "#3b82f6");
    else await insertPerson(newName.trim());
    setNewName("");
    setAddMode(null);
    load();
  };

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditIcon(item.extra ?? "📍");
  };

  const handleEditSave = async () => {
    if (!editingId || !editName.trim()) return;
    await updateCategory(editingId, editName.trim(), editIcon || "📍");
    setEditingId(null);
    load();
  };

  const handleDelete = (type: string, id: number, name: string) => {
    Alert.alert(t("settings.delete"), t("settings.deleteConfirm", { name }), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (type === "category") await deleteCategory(id);
          else if (type === "tag") await deleteTag(id);
          else await deletePerson(id);
          load();
        },
      },
    ]);
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => `${item.id}`}
      ListHeaderComponent={<ThemeColorPicker />}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Pressable onPress={() => setAddMode(section.type)}>
            <FontAwesome name="plus-circle" size={22} color={accentColor} />
          </Pressable>
        </View>
      )}
      renderItem={({ item, section }) =>
        section.type === "category" && editingId === item.id ? (
          <View style={styles.item}>
            <TextInput
              style={styles.emojiInput}
              value={editIcon}
              onChangeText={(t) => setEditIcon(t.slice(-2))}
              autoFocus
            />
            <TextInput
              style={[styles.addInput, { flex: 1 }]}
              value={editName}
              onChangeText={setEditName}
              onSubmitEditing={handleEditSave}
            />
            <Pressable style={[styles.addBtn, { backgroundColor: accentColor }]} onPress={handleEditSave}>
              <Text style={styles.addBtnText}>{t("settings.save")}</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={() => setEditingId(null)}>
              <FontAwesome name="times" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.item}
            onPress={() => section.type === "category" ? startEdit(item) : undefined}
          >
            {item.extra && section.type === "category" && (
              <Text style={styles.itemIcon}>{item.extra}</Text>
            )}
            {item.extra && section.type === "tag" && (
              <View
                style={[styles.tagDot, { backgroundColor: item.extra }]}
              />
            )}
            <Text style={styles.itemName}>{item.name}</Text>
            {section.type === "category" && (
              <Pressable style={styles.deleteBtn} onPress={() => startEdit(item)}>
                <FontAwesome name="pencil" size={16} color={colors.textSecondary} />
              </Pressable>
            )}
            <Pressable
              onPress={() => handleDelete(section.type, item.id, item.name)}
              style={styles.deleteBtn}
            >
              <FontAwesome name="trash-o" size={18} color={accentColor} />
            </Pressable>
          </Pressable>
        )
      }
      renderSectionFooter={({ section }) =>
        addMode === section.type ? (
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newName}
              onChangeText={setNewName}
              placeholder={t(`settings.new${section.type.charAt(0).toUpperCase() + section.type.slice(1)}` as any)}
              autoFocus
              onSubmitEditing={() => handleAdd(section.type)}
            />
            <Pressable
              style={[styles.addBtn, { backgroundColor: accentColor }]}
              onPress={() => handleAdd(section.type)}
            >
              <Text style={styles.addBtnText}>{t("settings.add")}</Text>
            </Pressable>
          </View>
        ) : null
      }
      contentContainerStyle={styles.container}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  pinSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 10,
  },
  itemIcon: {
    fontSize: 18,
  },
  tagDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  itemName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  deleteBtn: {
    padding: 8,
  },
  addRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.surface,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  emojiInput: {
    width: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 18,
    textAlign: "center",
  },
  addBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
