import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  format,
} from "date-fns";
import {
  getOverallStats,
  getStatsByCategory,
  getStatsByTimePeriod,
  getTopPlaces,
} from "@/db/queries/stats";
import { colors } from "@/lib/constants";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type TimeRange = "all" | "week" | "month" | "year" | "custom";

type OverallStats = { totalVisits: number; avgRating: number | null; totalSpent: number | null };
type CategoryStat = { id: number | null; name: string | null; icon: string | null; visitCount: number; totalSpent: number | null };
type TimeStat = { period: string; visitCount: number; totalSpent: number | null };
type TopPlace = { placeId: number | null; name: string | null; categoryIcon: string | null; visitCount: number; avgRating: number | null };

export default function StatsTab() {
  const [range, setRange] = useState<TimeRange>("all");
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [byCategory, setByCategory] = useState<CategoryStat[]>([]);
  const [byTime, setByTime] = useState<TimeStat[]>([]);
  const [topPlaces, setTopPlaces] = useState<TopPlace[]>([]);
  const [customFrom, setCustomFrom] = useState(() => startOfMonth(new Date()));
  const [customTo, setCustomTo] = useState(() => new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const getDateRange = useCallback((): { dateFrom?: string; dateTo?: string } => {
    const now = new Date();
    if (range === "all") return {};
    const todayStr = format(now, "yyyy-MM-dd");
    if (range === "week") return { dateFrom: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"), dateTo: todayStr };
    if (range === "month") return { dateFrom: format(startOfMonth(now), "yyyy-MM-dd"), dateTo: todayStr };
    if (range === "year") return { dateFrom: format(startOfYear(now), "yyyy-MM-dd"), dateTo: todayStr };
    return { dateFrom: format(customFrom, "yyyy-MM-dd"), dateTo: format(customTo, "yyyy-MM-dd") };
  }, [range, customFrom, customTo]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const { dateFrom, dateTo } = getDateRange();
        const [overallResult] = await getOverallStats(dateFrom, dateTo);
        setOverall(overallResult ?? null);

        const catResults = await getStatsByCategory(dateFrom, dateTo);
        setByCategory(catResults);

        const timeResults = await getStatsByTimePeriod("month", dateFrom, dateTo);
        setByTime(timeResults);

        const topResults = await getTopPlaces(5, dateFrom, dateTo);
        setTopPlaces(topResults);
      };
      load();
    }, [getDateRange])
  );

  const chips: { key: TimeRange; label: string }[] = [
    { key: "all", label: "All Time" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Time Range Chips */}
      <View style={styles.chipRow}>
        {chips.map((c) => (
          <Pressable
            key={c.key}
            style={[styles.chip, range === c.key && styles.chipActive]}
            onPress={() => setRange(c.key)}
          >
            <Text style={[styles.chipText, range === c.key && styles.chipTextActive]}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Custom Date Range Pickers */}
      {range === "custom" && (
        <View style={{ marginBottom: 16 }}>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>From</Text>
              <Pressable
                style={[styles.dateButton, showFromPicker && styles.dateButtonActive]}
                onPress={() => { setShowToPicker(false); setShowFromPicker(!showFromPicker); }}
              >
                <Text style={styles.dateText}>{format(customFrom, "MMM d, yyyy")}</Text>
              </Pressable>
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>To</Text>
              <Pressable
                style={[styles.dateButton, showToPicker && styles.dateButtonActive]}
                onPress={() => { setShowFromPicker(false); setShowToPicker(!showToPicker); }}
              >
                <Text style={styles.dateText}>{format(customTo, "MMM d, yyyy")}</Text>
              </Pressable>
            </View>
          </View>
          {showFromPicker && (
            <DateTimePicker
              value={customFrom}
              mode="date"
              maximumDate={customTo}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowFromPicker(Platform.OS === "ios");
                if (date) setCustomFrom(date);
              }}
            />
          )}
          {showToPicker && (
            <DateTimePicker
              value={customTo}
              mode="date"
              minimumDate={customFrom}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowToPicker(Platform.OS === "ios");
                if (date) setCustomTo(date);
              }}
            />
          )}
        </View>
      )}

      {/* Overview Card */}
      {overall && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overview</Text>
          <View style={styles.statRow}>
            <StatBlock label="Visits" value={String(overall.totalVisits)} />
            <StatBlock
              label="Avg Rating"
              value={overall.avgRating != null ? overall.avgRating.toFixed(1) : "—"}
              icon="star"
            />
            <StatBlock
              label="Total Spent"
              value={overall.totalSpent ? `$${Number(overall.totalSpent).toFixed(0)}` : "$0"}
            />
          </View>
        </View>
      )}

      {/* Category Breakdown */}
      {byCategory.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>By Category</Text>
          {byCategory.map((cat, i) => (
            <View key={cat.id ?? i} style={styles.catRow}>
              <Text style={styles.catIcon}>{cat.icon ?? "📍"}</Text>
              <Text style={styles.catName}>{cat.name ?? "Uncategorized"}</Text>
              <Text style={styles.catStat}>
                {cat.visitCount} visit{cat.visitCount !== 1 ? "s" : ""}
              </Text>
              <Text style={[styles.catStat, { color: colors.accent }]}>
                ${Number(cat.totalSpent ?? 0).toFixed(0)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Time Trend */}
      {byTime.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Trend</Text>
          {byTime.map((t) => (
            <View key={t.period} style={styles.catRow}>
              <Text style={styles.catName}>{t.period}</Text>
              <Text style={styles.catStat}>
                {t.visitCount} visit{t.visitCount !== 1 ? "s" : ""}
              </Text>
              <Text style={[styles.catStat, { color: colors.accent }]}>
                ${Number(t.totalSpent ?? 0).toFixed(0)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Top Places */}
      {topPlaces.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Places</Text>
          {topPlaces.map((p, i) => (
            <View key={p.placeId ?? i} style={styles.catRow}>
              <Text style={styles.catIcon}>{p.categoryIcon ?? "📍"}</Text>
              <Text style={styles.catName}>{p.name ?? "Unknown"}</Text>
              <Text style={styles.catStat}>{p.visitCount}x</Text>
              {p.avgRating != null && (
                <View style={styles.ratingBadge}>
                  <FontAwesome name="star" size={12} color={colors.star} />
                  <Text style={styles.ratingText}>{p.avgRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatBlock({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <View style={styles.statBlock}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {icon && <FontAwesome name={icon as any} size={16} color={colors.star} />}
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  dateButtonActive: {
    borderColor: colors.accent,
  },
  dateText: {
    fontSize: 15,
    color: colors.text,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBlock: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  catIcon: { fontSize: 18 },
  catName: { flex: 1, fontSize: 15, color: colors.text },
  catStat: { fontSize: 13, color: colors.textSecondary, fontWeight: "600" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: { fontSize: 13, color: colors.text, fontWeight: "600" },
});
