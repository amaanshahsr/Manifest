import { Pressable, Text, View } from "react-native";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { Truck, trucks as truck_table } from "@/db/schema";

const expo = SQLite.openDatabaseSync("data.db");

const db = drizzle(expo);

export default function App() {
  const { success, error } = useMigrations(db, migrations);
  const [trucks, setTrucks] = useState<Truck[] | null>(null);

  useEffect(() => {
    // if (!success) return;

    (async () => {
      await db.delete(truck_table);

      const users = await db.select().from(truck_table);
      console.log("usersusersusers", users);
      setTrucks(users);
    })();
  }, [success]);

  if (error) {
    console.log("error", error);
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  if (trucks === null || trucks.length === 0) {
    return (
      <View>
        <Pressable
          className="p-7 bg-pink-700"
          onPress={async () => {
            console.log("hereasync");
            try {
              await db.insert(truck_table).values([
                {
                  driverName: "Rathessh",
                  registration: "KL-43-p0126",
                  status: "active",
                },
                {
                  driverName: "suresh",
                  registration: "KL-43-p126",
                  status: "repair",
                },
              ]);
            } catch (error) {
              console.log("error", error);
            } finally {
              const users = await db.select().from(truck_table);
              console.log("usersusersusers", users);
              setTrucks(users);
            }
          }}
        >
          <Text>Add DB</Text>
        </Pressable>
        <Text>Empty</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <Pressable
        className="p-7 bg-pink-700"
        onPress={async () => {
          console.log("hereasync");
          try {
            await db.insert(truck_table).values([
              {
                driverName: "Rathessh",
                registration: "KL-43-p0126",
                status: "active",
              },
              {
                driverName: "suresh",
                registration: "KL-43-p126",
                status: "repair",
              },
            ]);
          } catch (error) {
            console.log("error", error);
          } finally {
            const users = await db.select().from(truck_table);
            console.log("usersusersusers", users);
            setTrucks(users);
          }
        }}
      >
        <Text>Add DB</Text>
      </Pressable>
      {trucks.map((truck) => (
        <Text key={truck.id} className="font-inter">
          {truck.registration} - {truck.driverName}
        </Text>
      ))}
    </View>
  );
}
