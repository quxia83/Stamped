import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db/client";
import { photos } from "@/db/schema";
import { eq } from "drizzle-orm";

export function usePhotos(visitId: number) {
  return useLiveQuery(
    db.select().from(photos).where(eq(photos.visitId, visitId))
  );
}
