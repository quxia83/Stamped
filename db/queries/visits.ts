import { db } from "@/db/client";
import { visits, places, categories, people, visitTags, tags, photos } from "@/db/schema";
import { eq, desc, asc, like, or, and, gte, lte, inArray, sql } from "drizzle-orm";

export type VisitWithPlace = Awaited<ReturnType<typeof getAllVisitsWithPlace>>[number];

export type VisitFilters = {
  sortField?: "date" | "rating" | "cost" | "name";
  sortOrder?: "asc" | "desc";
  categoryId?: number;
  tagIds?: number[];
  minRating?: number;
  whoPaidId?: number;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
};

export function getAllVisitsWithPlace() {
  return db
    .select({
      id: visits.id,
      placeId: visits.placeId,
      date: visits.date,
      rating: visits.rating,
      cost: visits.cost,
      currency: visits.currency,
      whoPaidId: visits.whoPaidId,
      priceLevel: visits.priceLevel,
      attendeeCount: visits.attendeeCount,
      notes: visits.notes,
      createdAt: visits.createdAt,
      updatedAt: visits.updatedAt,
      placeName: places.name,
      placeAddress: places.address,
      categoryId: places.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      whoPaidName: people.name,
    })
    .from(visits)
    .leftJoin(places, eq(visits.placeId, places.id))
    .leftJoin(categories, eq(places.categoryId, categories.id))
    .leftJoin(people, eq(visits.whoPaidId, people.id))
    .orderBy(desc(visits.date));
}

export function getVisitById(id: number) {
  return db
    .select({
      id: visits.id,
      placeId: visits.placeId,
      date: visits.date,
      rating: visits.rating,
      cost: visits.cost,
      currency: visits.currency,
      whoPaidId: visits.whoPaidId,
      priceLevel: visits.priceLevel,
      attendeeCount: visits.attendeeCount,
      notes: visits.notes,
      createdAt: visits.createdAt,
      updatedAt: visits.updatedAt,
      placeName: places.name,
      placeAddress: places.address,
      placeLatitude: places.latitude,
      placeLongitude: places.longitude,
      categoryId: places.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      whoPaidName: people.name,
    })
    .from(visits)
    .leftJoin(places, eq(visits.placeId, places.id))
    .leftJoin(categories, eq(places.categoryId, categories.id))
    .leftJoin(people, eq(visits.whoPaidId, people.id))
    .where(eq(visits.id, id));
}

export function getVisitsByPlaceId(placeId: number) {
  return db
    .select({
      id: visits.id,
      placeId: visits.placeId,
      date: visits.date,
      rating: visits.rating,
      cost: visits.cost,
      currency: visits.currency,
      notes: visits.notes,
      createdAt: visits.createdAt,
      updatedAt: visits.updatedAt,
    })
    .from(visits)
    .where(eq(visits.placeId, placeId))
    .orderBy(desc(visits.date));
}

export async function getFilteredVisits(filters: VisitFilters) {
  const conditions = [];

  if (filters.categoryId) {
    conditions.push(eq(places.categoryId, filters.categoryId));
  }
  if (filters.minRating) {
    conditions.push(gte(visits.rating, filters.minRating));
  }
  if (filters.whoPaidId) {
    conditions.push(eq(visits.whoPaidId, filters.whoPaidId));
  }
  if (filters.dateFrom) {
    conditions.push(gte(visits.date, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(visits.date, filters.dateTo));
  }
  if (filters.searchQuery) {
    const q = `%${filters.searchQuery}%`;
    conditions.push(or(like(places.name, q), like(visits.notes, q)));
  }

  const orderByMap = {
    date: visits.date,
    rating: visits.rating,
    cost: visits.cost,
    name: places.name,
  } as const;

  const sortField = orderByMap[filters.sortField ?? "date"] ?? visits.date;
  const sortFn = filters.sortOrder === "asc" ? asc : desc;

  let query = db
    .select({
      id: visits.id,
      placeId: visits.placeId,
      date: visits.date,
      rating: visits.rating,
      cost: visits.cost,
      currency: visits.currency,
      whoPaidId: visits.whoPaidId,
      attendeeCount: visits.attendeeCount,
      notes: visits.notes,
      createdAt: visits.createdAt,
      updatedAt: visits.updatedAt,
      placeName: places.name,
      placeAddress: places.address,
      categoryId: places.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      whoPaidName: people.name,
    })
    .from(visits)
    .leftJoin(places, eq(visits.placeId, places.id))
    .leftJoin(categories, eq(places.categoryId, categories.id))
    .leftJoin(people, eq(visits.whoPaidId, people.id));

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  let results = await query.orderBy(sortFn(sortField));

  // Filter by tags post-query if needed
  if (filters.tagIds && filters.tagIds.length > 0) {
    const taggedVisitIds = await db
      .selectDistinct({ visitId: visitTags.visitId })
      .from(visitTags)
      .where(inArray(visitTags.tagId, filters.tagIds));
    const idSet = new Set(taggedVisitIds.map((r) => r.visitId));
    results = results.filter((v) => idSet.has(v.id));
  }

  return results;
}

export function insertVisit(data: {
  placeId: number;
  date: string;
  rating?: number;
  cost?: number;
  currency?: string;
  whoPaidId?: number;
  priceLevel?: number;
  attendeeCount?: number;
  notes?: string;
}) {
  const now = new Date().toISOString();
  return db
    .insert(visits)
    .values({ ...data, createdAt: now, updatedAt: now })
    .returning();
}

export function updateVisit(
  id: number,
  data: Partial<{
    date: string;
    rating: number;
    cost: number;
    currency: string;
    whoPaidId: number;
    priceLevel: number;
    attendeeCount: number;
    notes: string;
  }>
) {
  return db
    .update(visits)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(visits.id, id));
}

export function deleteVisit(id: number) {
  return db.delete(visits).where(eq(visits.id, id));
}
