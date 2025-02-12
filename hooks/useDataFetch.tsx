import { useState, useEffect } from "react";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { TableTypes } from "@/db/schema";

type UseDataFetchParams<T> = {
  table: TableTypes; // Use the correct type for your table
};

export function useDataFetch<T>({ table }: UseDataFetchParams<T>) {
  const db = useSQLiteContext();

  const drizzleDb = drizzle(db);
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await drizzleDb.select().from(table);
      setData(result as T[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table]);

  return { data, loading, refresh: fetchData };
}
