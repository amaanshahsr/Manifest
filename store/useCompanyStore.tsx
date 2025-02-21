import { companies, Company } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { create } from "zustand";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite"; // ✅ Correct Hook Usage

export interface CompanyState {
  companies: Company[];
  loading: boolean;
  fetchCompanies: (db: SQLiteDatabase, id?: number) => Promise<void>;
  addCompany: (newCompany: Company) => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  loading: false,

  fetchCompanies: async (db, id) => {
    const drizzleDb = drizzle(db, { logger: true });

    set({ loading: true });

    try {
      const result = await drizzleDb.select().from(companies);
      console.log("result", result);

      const filteredCompanies = id
        ? result.filter((company) => company.id === id)
        : result;
      set({ companies: filteredCompanies });
    } catch (error) {
      console.error("Failed to fetch companies", error);
    } finally {
      set({ loading: false });
    }
  },

  addCompany: (newCompany) =>
    set((state) => ({ companies: [...state.companies, newCompany] })),
}));
