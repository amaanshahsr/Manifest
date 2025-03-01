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
    try {
      switch (actionType) {
        case "new":
          await drizzleDb.insert(table).values(item);
          return { status: "success" };

        case "edit":
          if (!id) throw new Error("ID is required for updating records.");
          await drizzleDb
            .update(table)
            .set(item)
            .where(eq(table.id, Number(id)));
          return { status: "success" };

        default:
          throw new Error("Invalid action type.");
      }
    } catch (error) {
      console.error(
        `Error while ${actionType === "new" ? "adding" : "updating"} to DB:`,
        error
      );
      return { status: "error" };
    }
  };

  return { addToDatabase };
};
