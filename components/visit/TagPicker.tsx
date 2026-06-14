import { View, TextInput, Pressable, Text } from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllTags, insertTag } from "@/db/queries/tags";
import { Chip } from "@/components/ui/Chip";
import { makeStyles, useTheme } from "@/theme";

type Tag = { id: number; label: string; color: string };

const tagColors = ["#e94560", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"];

type Props = {
  selectedIds: number[];
  onToggle: (id: number) => void;
};

export function TagPicker({ selectedIds, onToggle }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const load = () => getAllTags().then(setAllTags);

  useEffect(() => {
    load();
  }, []);

  const addTag = async () => {
    if (!newLabel.trim()) return;
    const color = tagColors[allTags.length % tagColors.length];
    const [tag] = await insertTag(newLabel.trim(), color);
    await load();
    onToggle(tag.id);
    setNewLabel("");
    setShowAdd(false);
  };

  return (
    <View>
      <View style={styles.row}>
        {allTags.map((tag) => (
          <Chip
            key={tag.id}
            label={tag.label}
            selected={selectedIds.includes(tag.id)}
            color={tag.color}
            onPress={() => onToggle(tag.id)}
          />
        ))}
        <Pressable style={[styles.addBtn, { borderColor: theme.colors.accent }]} onPress={() => setShowAdd(true)}>
          <Text style={[styles.addText, { color: theme.colors.accent }]}>{t("tag.addTag")}</Text>
        </Pressable>
      </View>
      {showAdd && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder={t("tag.tagName")}
            autoFocus
            onSubmitEditing={addTag}
          />
          <Pressable onPress={addTag} style={[styles.saveBtn, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.saveText}>{t("tag.add")}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: t.spacing.sm,
  },
  addText: {
    fontSize: 14,
  },
  addRow: {
    flexDirection: "row",
    marginTop: t.spacing.xs,
    gap: t.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.sm,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    fontSize: 14,
  },
  saveBtn: {
    borderRadius: t.radius.sm,
    paddingHorizontal: t.spacing.lg,
    justifyContent: "center",
  },
  saveText: {
    color: t.colors.onAccent,
    fontWeight: "600",
  },
}));
