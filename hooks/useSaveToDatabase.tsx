import { TableTypes } from "@/db/schema";
import { TableItem } from "@/types";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

type UseSaveToDatabase<T extends Omit<TableItem, "id">> = {
  table: TableTypes;
  item: T;
  actionType: "new" | "edit";
  id?: string;
};
export const useSaveToDatabase = <T extends Omit<TableItem, "id">>() => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const addToDatabase = async ({
    table,
    item,
    actionType,
    id,
  }: UseSaveToDatabase<T>) => {
    if (actionType === "new") {
      try {
        await drizzleDb.insert(table).values(item);
      } catch (error) {
        console.log("Error while adding to DB :", error);
        return { status: "error" };
      } finally {
        return { status: "success" };
      }
    } else {
      try {
        await drizzleDb
          .update(table)
          .set(item)
          .where(eq(table.id, Number(id)));
      } catch (error) {
        console.error("Error while updating to DB :", error);
        return { status: "error" };
      } finally {
        return { status: "success" };
      }
    }
  };

  return { addToDatabase };
};
