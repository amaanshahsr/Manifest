import { companies, Company, Manifest, manifests } from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { create } from "zustand";
import * as SQLite from "expo-sqlite";
import { CompanyWithActiveManifests, GenericRecord } from "@/types";
import { eq, and } from "drizzle-orm";

export interface CompanyState {
  companies: Company[];
  loading: boolean;
  comapaniesWithActiveManifests: CompanyWithActiveManifests[];
  fetchCompanies: (db: SQLite.SQLiteDatabase, id?: number) => Promise<void>;
  fetchCompanyWithActiveManifests: (
    db: SQLite.SQLiteDatabase,
    id?: number
  ) => Promise<void>;
  addCompany: (newCompany: Company) => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  comapaniesWithActiveManifests: [],
  loading: false,
  fetchCompanyWithActiveManifests: async (db) => {
    set({ loading: true });
    const drizzleDb = drizzle(db);
    try {
      const result = await drizzleDb
        ?.select()
        .from(companies)
        .innerJoin?.(
          manifests,
          and(
            eq(companies.id, manifests.companyId), // Join condition
            eq(manifests.status, "active") // Filter for active manifests
          )
        );

      const groupedResult = result?.reduce<GenericRecord>((acc, row) => {
        if (!acc[row?.companies?.id]) {
          acc[row?.companies?.id] = { ...row?.companies, manifests: [] };
        }
        if (row.manifests) {
          acc[row.companies?.id].manifests.push(row?.manifests);
        }

        return acc;
      }, {});

      const transformedResult: CompanyWithActiveManifests[] =
        Object.values(groupedResult);
      set({ comapaniesWithActiveManifests: transformedResult });
    } catch (error) {
      console.log("Error while fetching company with manifest details", error);
    } finally {
      set({ loading: false });
    }
  },
  fetchCompanies: async (db, id = 0) => {
    const drizzleDb = drizzle(db);

    set({ loading: true });
    let copyData: Company[] = [];
    try {
      try {
        const result = await drizzleDb.select().from(companies);
        copyData = result ? [...result] : [];
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (id) {
          copyData = copyData.filter((company) => company?.id === id);
        }
      }
      set({ companies: copyData });
    } catch (error) {
      console.error("Failed to fetch manifests", error);
    } finally {
      set({ loading: false });
    }
  },
  addCompany: (newCompany) =>
    set((state) => ({ companies: [...state.companies, newCompany] })),
}));
