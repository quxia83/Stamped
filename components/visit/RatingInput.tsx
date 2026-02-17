import { View, Pressable, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/lib/constants";

type Props = {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
};

export function RatingInput({ value, onChange, size = 32 }: Props) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} style={styles.star}>
          <FontAwesome
            name={star <= value ? "star" : "star-o"}
            size={size}
            color={star <= value ? colors.star : colors.starEmpty}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
  },
  star: {
    padding: 2,
  },
});
