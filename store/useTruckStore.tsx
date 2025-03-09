import { Truck, trucks, manifests, Manifest } from "@/db/schema";
import { create } from "zustand";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import { eq, sql } from "drizzle-orm";
import { TruckWithActiveManifests } from "@/types";

export interface TruckState {
  trucks: Truck[];
  trucksWithActiveManifests: TruckWithActiveManifests[];
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
        .select({
          id: trucks.id,
          driverName: trucks.driverName,
          manifestId: manifests.id,
          status: trucks?.status,
          registration: trucks?.registration,
          manifestCount: sql<number>`COUNT(${manifests.id})`, // Count the number of manifests
        })
        .from(trucks)
        .leftJoin(manifests, eq(trucks.id, manifests.assignedTo)) // Join companies table
        .groupBy(trucks.id, trucks.registration) // Group by truck to get counts
        .execute();

      set({ trucksWithActiveManifests: result ? [...result] : [] });
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
