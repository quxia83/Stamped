import { View, Text, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { useEffect, useState } from "react";
import { getAllPeople, insertPerson } from "@/db/queries/people";
import { colors } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";

type Person = { id: number; name: string };

type Props = {
  selectedId?: number;
  onSelect: (id: number | undefined) => void;
};

export function PersonPicker({ selectedId, onSelect }: Props) {
  const accentColor = useThemeStore((s) => s.accentColor);
  const [people, setPeople] = useState<Person[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const load = () => getAllPeople().then(setPeople);

  useEffect(() => {
    load();
  }, []);

  const addPerson = async () => {
    if (!newName.trim()) return;
    const [person] = await insertPerson(newName.trim());
    await load();
    onSelect(person.id);
    setNewName("");
    setShowAdd(false);
  };

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          style={[styles.option, !selectedId && { backgroundColor: accentColor, borderColor: accentColor }]}
          onPress={() => onSelect(undefined)}
        >
          <Text style={[styles.optionText, !selectedId && styles.selectedText]}>
            None
          </Text>
        </Pressable>
        {people.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.option, selectedId === p.id && { backgroundColor: accentColor, borderColor: accentColor }]}
            onPress={() => onSelect(p.id)}
          >
            <Text
              style={[
                styles.optionText,
                selectedId === p.id && styles.selectedText,
              ]}
            >
              {p.name}
            </Text>
          </Pressable>
        ))}
        <Pressable style={[styles.addBtn, { borderColor: accentColor }]} onPress={() => setShowAdd(true)}>
          <Text style={[styles.addText, { color: accentColor }]}>+ Add</Text>
        </Pressable>
      </View>
      {showAdd && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="Name"
            autoFocus
            onSubmitEditing={addPerson}
          />
          <Pressable onPress={addPerson} style={[styles.saveBtn, { backgroundColor: accentColor }]}>
            <Text style={styles.saveText}>Save</Text>
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
    gap: 8,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedText: {
    color: "#fff",
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addText: {
    fontSize: 14,
  },
  addRow: {
    flexDirection: "row",
    marginTop: 10,
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
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
