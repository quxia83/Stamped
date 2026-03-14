import { ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chip } from "@/components/ui/Chip";
import { getAllCategories } from "@/db/queries/categories";

type Category = { id: number; name: string; icon: string };

type Props = {
  selectedId?: number;
  onSelect: (id: number) => void;
};

export function CategoryPicker({ selectedId, onSelect }: Props) {
  const { t } = useTranslation();
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    getAllCategories().then(setCats);
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {cats.map((cat) => (
        <Chip
          key={cat.id}
          label={`${cat.icon} ${t(`category.${cat.name}`, { defaultValue: cat.name })}`}
          selected={selectedId === cat.id}
          onPress={() => onSelect(cat.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});
