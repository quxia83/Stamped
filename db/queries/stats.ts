import { db } from "@/db/client";
import { visits, places, categories } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

function dateConditions(dateFrom?: string, dateTo?: string) {
  const conds = [];
  if (dateFrom) conds.push(gte(visits.date, dateFrom));
  if (dateTo) conds.push(lte(visits.date, dateTo));
  return conds.length > 0 ? and(...conds) : undefined;
}

export function getOverallStats(dateFrom?: string, dateTo?: string) {
  const where = dateConditions(dateFrom, dateTo);
  let query = db
    .select({
      totalVisits: sql<number>`count(${visits.id})`,
      avgRating: sql<number | null>`avg(${visits.rating})`,
      totalSpent: sql<number | null>`coalesce(sum(${visits.cost}), 0)`,
    })
    .from(visits);
  if (where) query = query.where(where) as typeof query;
  return query;
}

export function getStatsByCategory(dateFrom?: string, dateTo?: string) {
  const conds = [];
  if (dateFrom) conds.push(gte(visits.date, dateFrom));
  if (dateTo) conds.push(lte(visits.date, dateTo));
  const where = conds.length > 0 ? and(...conds) : undefined;

  let query = db
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      visitCount: sql<number>`count(${visits.id})`,
      totalSpent: sql<number | null>`coalesce(sum(${visits.cost}), 0)`,
    })
    .from(visits)
    .leftJoin(places, eq(visits.placeId, places.id))
    .leftJoin(categories, eq(places.categoryId, categories.id))
    .groupBy(categories.id);

  if (where) query = query.where(where) as typeof query;
  return query;
}

export function getStatsByTimePeriod(
  groupBy: "day" | "week" | "month" | "year",
  dateFrom?: string,
  dateTo?: string
) {
  const formatMap = {
    day: "%Y-%m-%d",
    week: "%Y-W%W",
    month: "%Y-%m",
    year: "%Y",
  };
  const fmt = formatMap[groupBy];
  const where = dateConditions(dateFrom, dateTo);

  let query = db
    .select({
      period: sql<string>`strftime('${sql.raw(fmt)}', ${visits.date})`,
      visitCount: sql<number>`count(${visits.id})`,
      totalSpent: sql<number | null>`coalesce(sum(${visits.cost}), 0)`,
    })
    .from(visits)
    .groupBy(sql`strftime('${sql.raw(fmt)}', ${visits.date})`)
    .orderBy(sql`strftime('${sql.raw(fmt)}', ${visits.date})`);

  if (where) query = query.where(where) as typeof query;
  return query;
}

export function getTopPlaces(
  limit: number,
  dateFrom?: string,
  dateTo?: string
) {
  const where = dateConditions(dateFrom, dateTo);

  let query = db
    .select({
      placeId: places.id,
      name: places.name,
      categoryIcon: categories.icon,
      visitCount: sql<number>`count(${visits.id})`,
      avgRating: sql<number | null>`avg(${visits.rating})`,
    })
    .from(visits)
    .leftJoin(places, eq(visits.placeId, places.id))
    .leftJoin(categories, eq(places.categoryId, categories.id))
    .groupBy(places.id)
    .orderBy(sql`count(${visits.id}) desc`)
    .limit(limit);

  if (where) query = query.where(where) as typeof query;
  return query;
}
