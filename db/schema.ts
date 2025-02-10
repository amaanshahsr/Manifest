import { int, sqliteTable as table, text } from "drizzle-orm/sqlite-core";

export const trucks = table("trucks", {
  id: int().primaryKey({ autoIncrement: true }),
  registration: text().notNull()?.unique(),
  driverName: text("driver_name").notNull(),
  status: text({ enum: ["active", "repair"] }).notNull(), //** Only two possible status states, actual conformity to these values will be done on the UI */
});

export const manifests = table("manifests", {
  id: int().primaryKey({ autoIncrement: true }),
  manifestId: int("manifest_id").notNull()?.unique(),
  status: text({ enum: ["completed", "active"] }).notNull(),
  assignedTo: int("assigned_to").references(() => trucks?.id), //? Foreign Key for relation between truck and manifests, one truck can have multiple assigned manifests or none at all.
  companyId: int("company_id").references(() => companies.id), //? Foreign key for companies
});

export const companies = table("companies", {
  id: int().primaryKey({ autoIncrement: true }),
  companyName: int("company_name").notNull()?.unique(),
});

// Export Types to use as an interface within the app
export type Truck = typeof trucks.$inferSelect;
export type Manifest = typeof manifests.$inferSelect;
export type Company = typeof companies.$inferSelect;
