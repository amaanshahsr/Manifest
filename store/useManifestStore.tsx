import { companies, Company, Manifest, manifests } from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { create } from "zustand";
import * as SQLite from "expo-sqlite";
import { ManifestWithCompanies } from "@/types";
import { eq, and } from "drizzle-orm";

export interface ManifestState {
  manifests: Manifest[];
  loading: boolean;
  fetchManifests: (db: SQLite.SQLiteDatabase, id?: number) => Promise<void>;
  addManifest: (newManifest: Manifest) => void;
  manifestsWithCompany: { manifests: Manifest; companies: Company }[];
  fetchManifestsSortedByCompany: (db: SQLite.SQLiteDatabase) => Promise<void>;
  manifestsSortedByCompany: {
    result: (string | Manifest)[];
    companyPositions: Record<string, number>;
  };
}

export const useManifestStore = create<ManifestState>((set) => ({
  manifests: [],
  loading: false,
  manifestsWithCompany: [],
  manifestsSortedByCompany: { result: [], companyPositions: {} },
  fetchManifestsSortedByCompany: async (db) => {
    set({ loading: true });

    const drizzleDb = drizzle(db);
    try {
      // Fetch data from the database
      const result = await drizzleDb
        .select()
        .from(manifests)
        .leftJoin(companies, eq(manifests.companyId, companies.id)) // Join companies table
        .execute();

      // Pass  the result for formatting if successful

      const formattedResult = result?.reduce<{
        result: (string | Manifest)[];
        companyPositions: Record<string, number>;
      }>(
        (acc, record) => {
          if (!record?.companies) return acc;

          const { manifests, companies } = record;
          const companyName = companies.companyName;

          // Check if the company exists in the positions map
          if (!(companyName in acc.companyPositions)) {
            acc.result.push(companyName);
            acc.companyPositions[companyName] = acc.result.length - 1;
          }

          // Insert the manifest after the company name
          const companyPosition = acc.companyPositions[companyName];
          acc.result.splice(companyPosition + 1, 0, manifests);

          // Update positions of subsequent companies
          Object.keys(acc.companyPositions).forEach((name) => {
            if (acc.companyPositions[name] > companyPosition) {
              acc.companyPositions[name] += 1;
            }
          });

          return acc;
        },
        { result: [], companyPositions: {} }
      );
      set({ manifestsSortedByCompany: formattedResult });
    } catch (error) {
      // Log the error for debugging
      console.error("Failed to fetch manifests sorted by company:", error);
    } finally {
      set({ loading: false });
    }
  },

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

      set({ manifests: copyData });
    } catch (error) {
      console.error("Failed to fetch manifests", error);
    } finally {
      set({ loading: false });
    }
  },
  addManifest: (newManifest) =>
    set((state) => ({ manifests: [...state.manifests, newManifest] })),
}));
