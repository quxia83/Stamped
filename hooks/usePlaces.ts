import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db/client";
import { places, categories } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export function usePlaces() {
  return useLiveQuery(
    db
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
        firstPhotoUri: sql<string | null>`(
          SELECT photos.uri FROM photos
          INNER JOIN visits ON photos.visit_id = visits.id
          WHERE visits.place_id = places.id
          ORDER BY photos.created_at ASC
          LIMIT 1
        )`.as("first_photo_uri"),
      })
      .from(places)
      .leftJoin(categories, eq(places.categoryId, categories.id))
  );
}
