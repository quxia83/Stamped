import { View, Text, Pressable, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllPeople, insertPerson } from "@/db/queries/people";
import { makeStyles, useTheme } from "@/theme";

type Person = { id: number; name: string };

type Props = {
  selectedId?: number;
  onSelect: (id: number | undefined) => void;
};

export function PersonPicker({ selectedId, onSelect }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
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
          style={[styles.option, !selectedId && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
          onPress={() => onSelect(undefined)}
        >
          <Text style={[styles.optionText, !selectedId && styles.selectedText]}>
            {t("common.none")}
          </Text>
        </Pressable>
        {people.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.option, selectedId === p.id && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
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
        <Pressable style={[styles.addBtn, { borderColor: theme.colors.accent }]} onPress={() => setShowAdd(true)}>
          <Text style={[styles.addText, { color: theme.colors.accent }]}>{t("common.addPerson")}</Text>
        </Pressable>
      </View>
      {showAdd && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder={t("common.personName")}
            autoFocus
            onSubmitEditing={addPerson}
          />
          <Pressable onPress={addPerson} style={[styles.saveBtn, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.saveText}>{t("common.save")}</Text>
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
    gap: t.spacing.sm,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  optionText: {
    fontSize: 14,
    color: t.colors.text,
  },
  selectedText: {
    color: t.colors.onAccent,
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
