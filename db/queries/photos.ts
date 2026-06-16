import { db } from "@/db/client";
import { photos } from "@/db/schema";
import { eq, inArray, asc } from "drizzle-orm";
import { File } from "expo-file-system/next";
import { resolvePhotoUri } from "@/lib/photoUtils";

export function getPhotosForVisit(visitId: number) {
  return db.select().from(photos).where(eq(photos.visitId, visitId));
}

/**
 * Batched "first photo per visit" lookup in ONE query (avoids N+1).
 * Returns a Map of visitId -> first photo uri.
 */
export async function getFirstPhotoForVisits(visitIds: number[]): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  if (visitIds.length === 0) return map;
  const rows = await db
    .select({ visitId: photos.visitId, uri: photos.uri })
    .from(photos)
    .where(inArray(photos.visitId, visitIds))
    .orderBy(asc(photos.id));
  for (const r of rows) {
    if (!map.has(r.visitId)) map.set(r.visitId, r.uri); // first by id
  }
  return map;
}

export function insertPhoto(visitId: number, uri: string) {
  return db
    .insert(photos)
    .values({ visitId, uri, createdAt: new Date().toISOString() })
    .returning();
}

export async function deletePhoto(id: number) {
  const [photo] = await db.select().from(photos).where(eq(photos.id, id));
  if (photo) {
    try {
      const file = new File(resolvePhotoUri(photo.uri));
      if (file.exists) file.delete();
    } catch {}
    await db.delete(photos).where(eq(photos.id, id));
  }
}

export async function deletePhotosForVisit(visitId: number) {
  const visitPhotos = await getPhotosForVisit(visitId);
  for (const photo of visitPhotos) {
    try {
      const file = new File(resolvePhotoUri(photo.uri));
      if (file.exists) file.delete();
    } catch {}
  }
  await db.delete(photos).where(eq(photos.visitId, visitId));
}
