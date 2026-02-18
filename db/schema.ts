import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export const places = sqliteTable("places", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: text("created_at").notNull(),
});

export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const visits = sqliteTable("visits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  placeId: integer("place_id")
    .notNull()
    .references(() => places.id),
  date: text("date").notNull(),
  rating: real("rating"),
  cost: real("cost"),
  currency: text("currency").default("USD"),
  whoPaidId: integer("who_paid_id").references(() => people.id),
  priceLevel: integer("price_level"),
  attendeeCount: integer("attendee_count"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  color: text("color").notNull(),
});

export const visitTags = sqliteTable("visit_tags", {
  visitId: integer("visit_id")
    .notNull()
    .references(() => visits.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  visitId: integer("visit_id")
    .notNull()
    .references(() => visits.id, { onDelete: "cascade" }),
  uri: text("uri").notNull(),
  createdAt: text("created_at").notNull(),
});
