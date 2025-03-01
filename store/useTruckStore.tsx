import { Truck, trucks } from "@/db/schema";
import { create } from "zustand";
import { TableTypes } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export interface TruckState {
  trucks: Truck[];
  loading: boolean;
  fetchTrucks: (db: SQLite.SQLiteDatabase, filter?: string) => Promise<void>;
  addTruck: (newTruck: Truck) => void;
}

export const useTruckStore = create<TruckState>((set) => ({
  trucks: [],
  loading: false,

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
