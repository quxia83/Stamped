import { ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { getAllCategories } from "@/db/queries/categories";
import { colors } from "@/lib/constants";

type Category = { id: number; name: string; icon: string };

type Props = {
  selectedId?: number;
  onSelect: (id: number) => void;
};

export function CategoryPicker({ selectedId, onSelect }: Props) {
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
      {cats.map((cat, i) => (
        <Chip
          key={cat.id}
          label={`${cat.icon} ${cat.name}`}
          selected={selectedId === cat.id}
          color={colors.categoryColors[i % colors.categoryColors.length]}
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
