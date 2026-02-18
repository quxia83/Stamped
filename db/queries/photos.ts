import { db } from "@/db/client";
import { photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { File } from "expo-file-system/next";
import { resolvePhotoUri } from "@/lib/photoUtils";

export function getPhotosForVisit(visitId: number) {
  return db.select().from(photos).where(eq(photos.visitId, visitId));
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
