import { db } from "./client";
import { categories } from "./schema";
import { count } from "drizzle-orm";

const defaultCategories = [
  { name: "Restaurant", icon: "🍽️" },
  { name: "Cafe", icon: "☕" },
  { name: "Bar", icon: "🍸" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Event", icon: "🎉" },
  { name: "Travel", icon: "✈️" },
  { name: "Other", icon: "📍" },
];

export async function seedDatabase() {
  const [{ value }] = await db.select({ value: count() }).from(categories);
  if (value === 0) {
    await db.insert(categories).values(defaultCategories);
  }
}
