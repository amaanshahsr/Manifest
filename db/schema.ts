import { sql } from "drizzle-orm";
import {
  index,
  int,
  integer,
  sqliteTable as table,
  text,
} from "drizzle-orm/sqlite-core";

export const trucks = table("trucks", {
  id: int().primaryKey({ autoIncrement: true }),
  registration: text().notNull()?.unique(),
  driverName: text("driver_name").notNull(),
  status: text({ enum: ["active", "repair"] }).notNull(), //** Only two possible status states, actual conformity to these values will be done on the UI */
});

export const manifests = table(
  "manifests",
  {
    id: int().primaryKey({ autoIncrement: true }),
    manifestId: int("manifest_id").notNull()?.unique(),
    status: text({ enum: ["completed", "active", "unassigned"] }).notNull(),
    assignedTo: int("assigned_to").references(() => trucks?.id), //? Foreign Key for relation between truck and manifests, one truck can have multiple assigned manifests or none at all.
    companyId: int("company_id").references(() => companies.id), //? Foreign key for companies
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(), // ✅ Auto-filled timestamp
    completedOn: integer("completed_on", { mode: "timestamp" }).default(
      sql`NULL`
    ),
  },
  (table) => ({
    assignedToIdx: index("idx_manifest_assigned_to").on(table.assignedTo),
    companyIdIdx: index("idx_manifest_company_id").on(table.companyId),
  })
);

export const companies = table("companies", {
  id: int().primaryKey({ autoIncrement: true }),
  companyName: text("company_name").notNull()?.unique(),
});

//Table names used as types for hoooks
export type TableTypes = typeof companies | typeof trucks | typeof manifests;

// Export Types to use as an interface within the app
export type Truck = typeof trucks.$inferSelect;
export type Manifest = typeof manifests.$inferSelect;
export type Company = typeof companies.$inferSelect;

//Enum type

export type FetchDataType<T extends TableTypes> = T extends typeof trucks
  ? Truck
  : T extends typeof manifests
  ? Manifest
  : Company;
