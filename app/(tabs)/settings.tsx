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
import { makeStyles, useTheme } from "@/theme";
import { useThemeStore, PIN_COLORS } from "@/stores/useThemeStore";

type Item = { id: number; name: string; extra?: string };
type Section = { title: string; data: Item[]; type: "category" | "tag" | "person" };

const useStyles = makeStyles((t) => ({
  container: {
    paddingBottom: 40,
    backgroundColor: t.colors.background,
  },
  pinSection: {
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.xl,
    paddingBottom: t.spacing.lg,
    backgroundColor: t.colors.surface,
    marginBottom: t.spacing.lg,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.md,
    marginTop: t.spacing.md,
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
    borderColor: t.colors.text,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.xl,
    paddingBottom: t.spacing.sm,
    backgroundColor: t.colors.background,
  },
  sectionTitle: {
    ...t.typography.footnote,
    color: t.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    backgroundColor: t.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: t.colors.separator,
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
    ...t.typography.body,
    color: t.colors.text,
    flex: 1,
  },
  deleteBtn: {
    padding: t.spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  addRow: {
    flexDirection: "row",
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 10,
    gap: t.spacing.sm,
    backgroundColor: t.colors.surface,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.sm,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    fontSize: 14,
    color: t.colors.text,
    backgroundColor: t.colors.surface,
  },
  emojiInput: {
    width: 44,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.sm,
    paddingHorizontal: t.spacing.sm,
    paddingVertical: t.spacing.sm,
    fontSize: 18,
    textAlign: "center",
    color: t.colors.text,
    backgroundColor: t.colors.surface,
  },
  addBtn: {
    borderRadius: t.radius.sm,
    paddingHorizontal: t.spacing.lg,
    justifyContent: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
}));

function ThemeColorPicker() {
  const { t } = useTranslation();
  const { accentColor, setAccentColor } = useThemeStore();
  const styles = useStyles();
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
  const theme = useTheme();
  const styles = useStyles();
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
              style={[styles.emojiInput, { color: theme.colors.text }]}
              value={editIcon}
              onChangeText={(v) => setEditIcon(v.slice(-2))}
              autoFocus
              placeholderTextColor={theme.colors.textTertiary}
            />
            <TextInput
              style={[styles.addInput, { flex: 1, color: theme.colors.text }]}
              value={editName}
              onChangeText={setEditName}
              onSubmitEditing={handleEditSave}
              placeholderTextColor={theme.colors.textTertiary}
            />
            <Pressable style={[styles.addBtn, { backgroundColor: accentColor }]} onPress={handleEditSave}>
              <Text style={styles.addBtnText}>{t("settings.save")}</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={() => setEditingId(null)}>
              <FontAwesome name="times" size={18} color={theme.colors.textSecondary} />
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
                <FontAwesome name="pencil" size={16} color={theme.colors.textSecondary} />
              </Pressable>
            )}
            <Pressable
              onPress={() => handleDelete(section.type, item.id, item.name)}
              style={styles.deleteBtn}
              accessibilityLabel={`Delete ${item.name}`}
              accessibilityRole="button"
            >
              <FontAwesome name="trash-o" size={18} color={theme.colors.destructive} />
            </Pressable>
          </Pressable>
        )
      }
      renderSectionFooter={({ section }) =>
        addMode === section.type ? (
          <View style={styles.addRow}>
            <TextInput
              style={[styles.addInput, { color: theme.colors.text }]}
              value={newName}
              onChangeText={setNewName}
              placeholder={t(`settings.new${section.type.charAt(0).toUpperCase() + section.type.slice(1)}` as any)}
              autoFocus
              onSubmitEditing={() => handleAdd(section.type)}
              placeholderTextColor={theme.colors.textTertiary}
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
