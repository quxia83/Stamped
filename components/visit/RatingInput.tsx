import { View, Pressable, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/lib/constants";

export function StarDisplay({ rating, size = 22 }: { rating: number; size?: number }) {
  return (
    <View style={[styles.stars, { gap: size * 0.18 }]}>
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(1, Math.max(0, rating - (s - 1)));
        return (
          <View key={s} style={{ width: size, height: size }}>
            <FontAwesome name="star-o" size={size} color={colors.starEmpty} />
            {fill > 0 && (
              <View style={{ position: "absolute", width: fill * size, overflow: "hidden" }}>
                <FontAwesome name="star" size={size} color={colors.star} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

type Props = {
  value: number;
  onChange: (rating: number) => void;
};

const STAR_SIZE = 36;
const STAR_GAP = 8;

export function RatingInput({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(1, Math.max(0, value - (s - 1)));
        return (
          <View key={s} style={{ width: STAR_SIZE, height: STAR_SIZE }}>
            <FontAwesome name="star-o" size={STAR_SIZE} color={colors.starEmpty} />
            {fill > 0 && (
              <View style={{ position: "absolute", width: fill * STAR_SIZE, overflow: "hidden" }}>
                <FontAwesome name="star" size={STAR_SIZE} color={colors.star} />
              </View>
            )}
            {/* Left half → s - 0.5, right half → s */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
              <Pressable
                style={styles.halfLeft}
                onPress={() => onChange(value === s - 0.5 ? 0 : s - 0.5)}
                hitSlop={4}
              />
              <Pressable
                style={styles.halfRight}
                onPress={() => onChange(value === s ? 0 : s)}
                hitSlop={4}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: STAR_GAP,
    alignItems: "center",
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  halfLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "50%",
    height: "100%",
  },
  halfRight: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "50%",
    height: "100%",
  },
});
