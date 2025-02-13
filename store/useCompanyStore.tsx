import { companies, Company, Manifest, manifests } from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { create } from "zustand";
import * as SQLite from "expo-sqlite";

export interface CompanyState {
  companies: Company[];
  loading: boolean;
  fetchCompanies: () => Promise<void>;
  addCompany: (newCompany: Company) => void;
}
const expo = SQLite.openDatabaseSync("data.db");
const drizzleDb = drizzle(expo);

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  loading: false,

  fetchCompanies: async (id = 0) => {
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
