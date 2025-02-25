import { Manifest, manifests } from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { create } from "zustand";
import * as SQLite from "expo-sqlite";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";

export interface ManifestState {
  manifests: Manifest[];
  loading: boolean;
  fetchManifests: (db: SQLiteDatabase, id?: number) => Promise<void>;
  addManifest: (newManifest: Manifest) => void;
}

export const useManifestStore = create<ManifestState>((set) => ({
  manifests: [],
  loading: false,

  fetchManifests: async (db, id = 0) => {
    const drizzleDb = drizzle(db);
    set({ loading: true });
    let copyData: Manifest[] = [];
    try {
      try {
        const result = await drizzleDb.select().from(manifests);
        copyData = result ? [...result] : [];
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (id) {
          copyData = copyData.filter((manifest) => manifest?.id === id);
        }
      }
      console.log("adsasdasdasdasdasd");

      set({ manifests: [...copyData] });
    } catch (error) {
      console.error("Failed to fetch manifests", error);
    } finally {
      set({ loading: false });
    }
  },
  addManifest: (newManifest) =>
    set((state) => ({ manifests: [...state.manifests, newManifest] })),
}));
