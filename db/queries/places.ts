import { db } from "@/db/client";
import { places, categories, visits } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export function getAllPlaces() {
  return db
    .select({
      id: places.id,
      name: places.name,
      address: places.address,
      latitude: places.latitude,
      longitude: places.longitude,
      categoryId: places.categoryId,
      createdAt: places.createdAt,
      categoryName: categories.name,
      categoryIcon: categories.icon,
    })
    .from(places)
    .leftJoin(categories, eq(places.categoryId, categories.id));
}

export function getPlaceById(id: number) {
  return db
    .select({
      id: places.id,
      name: places.name,
      address: places.address,
      latitude: places.latitude,
      longitude: places.longitude,
      categoryId: places.categoryId,
      createdAt: places.createdAt,
      categoryName: categories.name,
      categoryIcon: categories.icon,
    })
    .from(places)
    .leftJoin(categories, eq(places.categoryId, categories.id))
    .where(eq(places.id, id));
}

export function getPlaceWithStats(id: number) {
  return db
    .select({
      id: places.id,
      name: places.name,
      address: places.address,
      latitude: places.latitude,
      longitude: places.longitude,
      categoryId: places.categoryId,
      createdAt: places.createdAt,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      visitCount: sql<number>`count(${visits.id})`,
      avgRating: sql<number | null>`avg(${visits.rating})`,
      totalSpent: sql<number | null>`sum(${visits.cost})`,
    })
    .from(places)
    .leftJoin(categories, eq(places.categoryId, categories.id))
    .leftJoin(visits, eq(visits.placeId, places.id))
    .where(eq(places.id, id))
    .groupBy(places.id);
}

export function insertPlace(data: {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  categoryId?: number;
}) {
  return db
    .insert(places)
    .values({ ...data, createdAt: new Date().toISOString() })
    .returning();
}

export function updatePlace(
  id: number,
  data: Partial<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    categoryId: number;
  }>
) {
  return db.update(places).set(data).where(eq(places.id, id));
}

export function deletePlace(id: number) {
  return db.delete(places).where(eq(places.id, id));
}

export async function deleteOrphanPlace(placeId: number) {
  const [row] = await db
    .select({ count: sql<number>`count(${visits.id})` })
    .from(visits)
    .where(eq(visits.placeId, placeId));
  if (row && row.count === 0) {
    await db.delete(places).where(eq(places.id, placeId));
  }
}
