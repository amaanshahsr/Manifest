import {
  Truck,
  trucks,
  manifests,
  companies as companyTable,
} from "@/db/schema";
import { create } from "zustand";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import { eq, sql, and } from "drizzle-orm";
import { GenericRecord, TrucksWithActiveManifests } from "@/types";

export interface TruckState {
  trucks: Truck[];
  trucksWithActiveManifests: TrucksWithActiveManifests[];
  loading: boolean;
  fetchTrucks: (db: SQLite.SQLiteDatabase, filter?: string) => Promise<void>;
  fetchTrucksWithActiveManifests: (db: SQLite.SQLiteDatabase) => Promise<void>;
  addTruck: (newTruck: Truck) => void;
}

export const useTruckStore = create<TruckState>((set) => ({
  trucks: [],
  trucksWithActiveManifests: [],
  loading: false,
  fetchTrucksWithActiveManifests: async (db) => {
    set({ loading: true });
    const drizzleDb = drizzle(db);
    try {
      const result = await drizzleDb
        .select()
        .from(trucks)
        .leftJoin(
          manifests,
          and(
            eq(manifests.assignedTo, trucks?.id), // Filter by truck ID
            eq(manifests.status, "active") // Filter by status = "Active"
          )
        )
        .leftJoin(companyTable, eq(manifests.companyId, companyTable.id))
        .execute();

      const formattedResult = result?.reduce<GenericRecord>((acc, row) => {
        // console.log("formateed result", row?.companies);
        if (!acc[row?.trucks?.registration]) {
          acc[row?.trucks?.registration] = { ...row?.trucks, manifests: [] };
        }
        if (row?.manifests) {
          acc[row.trucks?.registration].manifests.push({
            ...row?.manifests,
            companyName: row?.companies?.companyName,
          });
        }

        return acc;
      }, {}) as TrucksWithActiveManifests[];

      const transformedResult = Object.values(formattedResult);
      set({ trucksWithActiveManifests: result ? transformedResult : [] });
    } catch (error) {
      console.error("Failed to fetch trucks with active manifests", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchTrucks: async (db, filter = "") => {
    const drizzleDb = drizzle(db);

    set({ loading: true });
    let copyData: Truck[] = [];
    try {
      try {
        const result = await drizzleDb.select().from(trucks);
        copyData = result ? [...result] : [];
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (filter) {
          copyData = copyData.filter(
            (truck) =>
              truck?.driverName?.includes(filter) ||
              truck?.registration?.includes(filter)
          );
        }
      }

      set({ trucks: copyData });
    } catch (error) {
      console.error("Failed to fetch trucks", error);
    } finally {
      set({ loading: false });
    }
  },

  addTruck: (newTruck) =>
    set((state) => ({ trucks: [...state.trucks, newTruck] })),
}));
