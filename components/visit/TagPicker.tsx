import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { getAllTags, insertTag } from "@/db/queries/tags";
import { Chip } from "@/components/ui/Chip";
import { colors } from "@/lib/constants";

type Tag = { id: number; label: string; color: string };

const tagColors = ["#e94560", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"];

type Props = {
  selectedIds: number[];
  onToggle: (id: number) => void;
};

export function TagPicker({ selectedIds, onToggle }: Props) {
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
        <Pressable style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addText}>+ Tag</Text>
        </Pressable>
      </View>
      {showAdd && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder="Tag name"
            autoFocus
            onSubmitEditing={addTag}
          />
          <Pressable onPress={addTag} style={styles.saveBtn}>
            <Text style={styles.saveText}>Add</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: "dashed",
    marginBottom: 8,
  },
  addText: {
    fontSize: 14,
    color: colors.accent,
  },
  addRow: {
    flexDirection: "row",
    marginTop: 4,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
