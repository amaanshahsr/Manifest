import { companies, Manifest, manifests } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { create } from "zustand";
import * as SQLite from "expo-sqlite";
import { eq, and, inArray } from "drizzle-orm";

type ManifestStatus = "unassigned" | "active" | "completed";
export interface ManifestState {
  manifests: Manifest[];
  loading: boolean;
  unassignedManifests: {
    result: (string | Omit<Manifest, "completedOn">)[];
    companyPositions: Record<string, number>;
  };
  fetchManifests: (db: SQLite.SQLiteDatabase) => Promise<void>;
  addManifest: (newManifest: Manifest) => void;
  fetchManifestsSortedByCompany: (
    db: SQLite.SQLiteDatabase,
    selectedStatus?: ManifestStatus[],
    selectedCompanies?: string[]
  ) => Promise<void>;
  fetchUnassignedManifestsSortedByCompany: (
    db: SQLite.SQLiteDatabase
  ) => Promise<void>;
  manifestsSortedByCompany: {
    result: (string | Manifest)[];
    companyPositions: Record<string, number>;
  };
}

export const useManifestStore = create<ManifestState>((set) => ({
  manifests: [],
  unassignedManifests: { result: [], companyPositions: {} },
  loading: false,
  manifestsSortedByCompany: { result: [], companyPositions: {} },
  fetchUnassignedManifestsSortedByCompany: async (db) => {
    set({ loading: true });
    const drizzleDb = drizzle(db);
    const result = await drizzleDb
      .select()
      .from(manifests)
      .leftJoin(companies, eq(manifests.companyId, companies.id))
      .where(eq(manifests.status, "unassigned"))
      .execute();
    // Execute the query and return the results
    // Format the query result for FlatList: group manifests under their respective company headers

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
    console.log("unassignedmanifestsorted", formattedResult);

    set({ loading: false });
    set({ unassignedManifests: formattedResult });
  },

  fetchManifestsSortedByCompany: async (
    db,
    selectedStatus = [],
    selectedCompanies = []
  ) => {
    set({ loading: true });
    const drizzleDb = drizzle(db);

    try {
      // Fetch data from the database
      const result = await drizzleDb
        .select()
        .from(manifests)
        .leftJoin(companies, eq(manifests.companyId, companies.id))
        .where(
          and(
            // Filter by status using inArray
            selectedStatus.length > 0
              ? inArray(manifests.status, selectedStatus)
              : undefined,

            // Filter by company name using inArray
            selectedCompanies.length > 0
              ? inArray(companies.companyName, selectedCompanies)
              : undefined
          )
        )
        .execute();
      // Pass  the result for formatting used in flashlist

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
