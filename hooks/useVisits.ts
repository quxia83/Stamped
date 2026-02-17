import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db/client";
import { visits, places, categories, people } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export function useVisits() {
  return useLiveQuery(
    db
      .select({
        id: visits.id,
        placeId: visits.placeId,
        date: visits.date,
        rating: visits.rating,
        cost: visits.cost,
        currency: visits.currency,
        whoPaidId: visits.whoPaidId,
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
      .orderBy(desc(visits.date))
  );
}
