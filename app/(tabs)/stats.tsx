import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfMonth,
  parseISO,
  format,
} from "date-fns";
import {
  getOverallStats,
  getStatsByCategory,
  getStatsByTimePeriod,
  getTopPlaces,
} from "@/db/queries/stats";
import { useFilterStore } from "@/stores/useFilterStore";
import { makeStyles, useTheme } from "@/theme";
import { Skeleton } from "@/components/ui/Skeleton";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type TimeRange = "all" | "week" | "month" | "year" | "custom";

type OverallStats = { totalVisits: number; avgRating: number | null; totalSpent: number | null };
type CategoryStat = { id: number | null; name: string | null; icon: string | null; visitCount: number; totalSpent: number | null };
type TimeStat = { period: string; visitCount: number; totalSpent: number | null };
type TopPlace = { placeId: number | null; name: string | null; categoryIcon: string | null; visitCount: number; avgRating: number | null };

export default function StatsTab() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const setFilter = useFilterStore((s) => s.setFilter);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const [range, setRange] = useState<TimeRange>("all");
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [byCategory, setByCategory] = useState<CategoryStat[]>([]);
  const [byTime, setByTime] = useState<TimeStat[]>([]);
  const [topPlaces, setTopPlaces] = useState<TopPlace[]>([]);
  const [customFrom, setCustomFrom] = useState(() => startOfMonth(new Date()));
  const [customTo, setCustomTo] = useState(() => new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const getDateRange = useCallback((): { dateFrom?: string; dateTo?: string } => {
    const now = new Date();
    if (range === "all") return {};
    const todayStr = format(now, "yyyy-MM-dd");
    if (range === "week") return { dateFrom: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"), dateTo: todayStr };
    if (range === "month") return { dateFrom: format(startOfMonth(now), "yyyy-MM-dd"), dateTo: todayStr };
    if (range === "year") return { dateFrom: format(startOfYear(now), "yyyy-MM-dd"), dateTo: todayStr };
    return { dateFrom: format(customFrom, "yyyy-MM-dd"), dateTo: format(customTo, "yyyy-MM-dd") };
  }, [range, customFrom, customTo]);

  const [focused, setFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  useEffect(() => {
    if (!focused) return;
    setLoading(true);
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
    load().finally(() => setLoading(false));
  }, [focused, getDateRange]);

  const chips: { key: TimeRange; label: string }[] = [
    { key: "all", label: t("stats.allTime") },
    { key: "week", label: t("stats.thisWeek") },
    { key: "month", label: t("stats.thisMonth") },
    { key: "year", label: t("stats.thisYear") },
    { key: "custom", label: t("stats.custom") },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Time Range Chips */}
      <View style={styles.chipRow}>
        {chips.map((c) => (
          <Pressable
            key={c.key}
            style={[styles.chip, range === c.key && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
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
              <Text style={styles.dateLabel}>{t("stats.from")}</Text>
              <Pressable
                style={[styles.dateButton, showFromPicker && { borderColor: theme.colors.accent }]}
                onPress={() => { setShowToPicker(false); setShowFromPicker(!showFromPicker); }}
              >
                <Text style={styles.dateText}>{format(customFrom, "MMM d, yyyy")}</Text>
              </Pressable>
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>{t("stats.to")}</Text>
              <Pressable
                style={[styles.dateButton, showToPicker && { borderColor: theme.colors.accent }]}
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

      {loading ? (
        <>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.card}>
              <Skeleton width="40%" height={16} />
              <Skeleton width="100%" height={48} style={{ marginTop: 12 }} />
            </View>
          ))}
        </>
      ) : (
        <>
          {/* Overview Card */}
          {overall && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t("stats.overview")}</Text>
              <View style={styles.statRow}>
                <StatBlock label={t("stats.visits")} value={String(overall.totalVisits)} />
                <StatBlock
                  label={t("stats.avgRating")}
                  value={overall.avgRating != null ? overall.avgRating.toFixed(1) : "—"}
                  icon="star"
                />
                <StatBlock
                  label={t("stats.totalSpent")}
                  value={overall.totalSpent ? Number(overall.totalSpent).toFixed(0) : "0"}
                />
              </View>
            </View>
          )}

          {/* Category Breakdown */}
          {byCategory.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t("stats.byCategory")}</Text>
              {byCategory.map((cat, i) => (
                <Pressable
                  key={cat.id ?? i}
                  style={({ pressed }) => [styles.catRow, pressed && styles.rowPressed]}
                  onPress={() => {
                    resetFilters();
                    if (cat.id != null) setFilter("categoryId", cat.id);
                    router.navigate("/(tabs)/list");
                  }}
                >
                  <Text style={styles.catIcon}>{cat.icon ?? "📍"}</Text>
                  <Text style={styles.catName}>{cat.name ? t(`category.${cat.name}`, { defaultValue: cat.name }) : t("stats.uncategorized")}</Text>
                  <Text style={styles.catStat}>
                    {t("stats.visitCount", { count: cat.visitCount })}
                  </Text>
                  <Text style={[styles.catStat, { color: theme.colors.accent }]}>
                    {Number(cat.totalSpent ?? 0).toFixed(0)}
                  </Text>
                  <FontAwesome name="chevron-right" size={12} color={theme.colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          )}

          {/* Time Trend */}
          {byTime.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t("stats.monthlyTrend")}</Text>
              {byTime.map((tm) => (
                <Pressable
                  key={tm.period}
                  style={({ pressed }) => [styles.catRow, pressed && styles.rowPressed]}
                  onPress={() => {
                    const d = parseISO(tm.period + "-01");
                    resetFilters();
                    setFilter("dateFrom", format(startOfMonth(d), "yyyy-MM-dd"));
                    setFilter("dateTo", format(endOfMonth(d), "yyyy-MM-dd"));
                    router.navigate("/(tabs)/list");
                  }}
                >
                  <Text style={styles.catName}>{tm.period}</Text>
                  <Text style={styles.catStat}>
                    {t("stats.visitCount", { count: tm.visitCount })}
                  </Text>
                  <Text style={[styles.catStat, { color: theme.colors.accent }]}>
                    {Number(tm.totalSpent ?? 0).toFixed(0)}
                  </Text>
                  <FontAwesome name="chevron-right" size={12} color={theme.colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          )}

          {/* Top Places */}
          {topPlaces.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t("stats.topPlaces")}</Text>
              {topPlaces.map((p, i) => (
                <Pressable
                  key={p.placeId ?? i}
                  style={({ pressed }) => [styles.catRow, pressed && styles.rowPressed]}
                  onPress={() => p.placeId != null && router.push(`/place/${p.placeId}`)}
                >
                  <Text style={styles.catIcon}>{p.categoryIcon ?? "📍"}</Text>
                  <Text style={styles.catName}>{p.name ?? t("stats.unknown")}</Text>
                  <Text style={styles.catStat}>{p.visitCount}x</Text>
                  {p.avgRating != null && (
                    <View style={styles.ratingBadge}>
                      <FontAwesome name="star" size={12} color={theme.colors.star} />
                      <Text style={styles.ratingText}>{p.avgRating.toFixed(1)}</Text>
                    </View>
                  )}
                  <FontAwesome name="chevron-right" size={12} color={theme.colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function StatBlock({ label, value, icon }: { label: string; value: string; icon?: string }) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.statBlock}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {icon && <FontAwesome name={icon as any} size={16} color={theme.colors.star} />}
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1, backgroundColor: t.colors.background },
  content: { padding: t.spacing.lg, paddingBottom: 40 },
  dateRow: {
    flexDirection: "row",
    gap: t.spacing.md,
    marginBottom: t.spacing.lg,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: t.colors.textSecondary,
    marginBottom: t.spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: t.colors.surface,
  },
  dateText: {
    fontSize: 15,
    color: t.colors.text,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.sm,
    marginBottom: t.spacing.lg,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: t.spacing.sm,
    borderRadius: 20,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: t.colors.textSecondary,
  },
  chipTextActive: {
    color: t.colors.onAccent,
  },
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.md,
    padding: t.spacing.lg,
    marginBottom: t.spacing.md,
    borderWidth: 0.5,
    borderColor: t.colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: t.colors.text,
    marginBottom: t.spacing.md,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBlock: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700", color: t.colors.text },
  statLabel: { fontSize: 12, color: t.colors.textSecondary, marginTop: 2 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: t.spacing.sm,
    gap: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: t.colors.border,
  },
  rowPressed: {
    opacity: 0.5,
  },
  catIcon: { fontSize: 18 },
  catName: { flex: 1, fontSize: 15, color: t.colors.text },
  catStat: { fontSize: 13, color: t.colors.textSecondary, fontWeight: "600" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: { fontSize: 13, color: t.colors.text, fontWeight: "600" },
}));
