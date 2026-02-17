import { db } from "@/db/client";
import { tags, visitTags } from "@/db/schema";
import { eq } from "drizzle-orm";

export function getAllTags() {
  return db.select().from(tags);
}

export function insertTag(label: string, color: string) {
  return db.insert(tags).values({ label, color }).returning();
}

export function updateTag(id: number, label: string, color: string) {
  return db.update(tags).set({ label, color }).where(eq(tags.id, id));
}

export function deleteTag(id: number) {
  return db.delete(tags).where(eq(tags.id, id));
}

export function getTagsForVisit(visitId: number) {
  return db
    .select({
      id: tags.id,
      label: tags.label,
      color: tags.color,
    })
    .from(visitTags)
    .innerJoin(tags, eq(visitTags.tagId, tags.id))
    .where(eq(visitTags.visitId, visitId));
}

export async function setVisitTags(visitId: number, tagIds: number[]) {
  await db.delete(visitTags).where(eq(visitTags.visitId, visitId));
  if (tagIds.length > 0) {
    await db
      .insert(visitTags)
      .values(tagIds.map((tagId) => ({ visitId, tagId })));
  }
}
