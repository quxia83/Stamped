import { db } from "@/db/client";
import { people } from "@/db/schema";
import { eq } from "drizzle-orm";

export function getAllPeople() {
  return db.select().from(people);
}

export function insertPerson(name: string) {
  return db.insert(people).values({ name }).returning();
}

export function updatePerson(id: number, name: string) {
  return db.update(people).set({ name }).where(eq(people.id, id));
}

export function deletePerson(id: number) {
  return db.delete(people).where(eq(people.id, id));
}
