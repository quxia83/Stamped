import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export function getAllCategories() {
  return db.select().from(categories);
}

export function getCategoryById(id: number) {
  return db.select().from(categories).where(eq(categories.id, id));
}

export function insertCategory(name: string, icon: string) {
  return db.insert(categories).values({ name, icon });
}

export function updateCategory(id: number, name: string, icon: string) {
  return db.update(categories).set({ name, icon }).where(eq(categories.id, id));
}

export function deleteCategory(id: number) {
  return db.delete(categories).where(eq(categories.id, id));
}
