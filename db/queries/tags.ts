import { db } from "@/db/client";
import { tags, visitTags } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export type VisitTag = { id: number; label: string; color: string };

/**
 * Batched tag lookup for many visits in ONE query (avoids N+1).
 * Returns a Map of visitId -> tags.
 */
export async function getTagsForVisits(visitIds: number[]): Promise<Map<number, VisitTag[]>> {
  const map = new Map<number, VisitTag[]>();
  if (visitIds.length === 0) return map;
  const rows = await db
    .select({
      visitId: visitTags.visitId,
      id: tags.id,
      label: tags.label,
      color: tags.color,
    })
    .from(visitTags)
    .innerJoin(tags, eq(visitTags.tagId, tags.id))
    .where(inArray(visitTags.visitId, visitIds));
  for (const r of rows) {
    const arr = map.get(r.visitId);
    const tag = { id: r.id, label: r.label, color: r.color };
    if (arr) arr.push(tag);
    else map.set(r.visitId, [tag]);
  }
  return map;
}

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
