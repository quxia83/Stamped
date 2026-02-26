import { db } from "./client";
import { categories } from "./schema";


const defaultCategories = [
  { name: "Restaurant", icon: "🍽️" },
  { name: "Cafe", icon: "☕" },
  { name: "Bar", icon: "🍸" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Event", icon: "🎉" },
  { name: "Travel", icon: "✈️" },
  { name: "Health", icon: "🏥" },
  { name: "Other", icon: "📍" },
];

export async function seedDatabase() {
  const existing = await db.select({ name: categories.name }).from(categories);
  const existingNames = new Set(existing.map((c) => c.name));
  const missing = defaultCategories.filter((c) => !existingNames.has(c.name));
  if (missing.length > 0) {
    await db.insert(categories).values(missing);
  }
}
