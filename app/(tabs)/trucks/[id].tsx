import { Pressable, Text, TextInput, TurboModule, View } from "react-native";
import * as SQLite from "expo-sqlite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Truck, trucks as truck_table } from "@/db/schema";
import { FlashList } from "@shopify/flash-list";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { capitalizeWord } from "@/utils/utils";
import TruckInfoCard from "@/components/common/truckInfoCard";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams } from "expo-router";

export default function App() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const [trucks, setTrucks] = useState<Truck[] | null>(null);
  const [search, setSearch] = useState("");
  const handleUpdate = async () => {
    try {
      const users = await drizzleDb.select().from(truck_table);
      setTrucks(users);
    } catch (error) {
      console.log("Something went wrong :", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await drizzleDb.select().from(truck_table);
        setTrucks(users);
      } catch (error) {
        console.log("Something went wrong:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once
  if (trucks === null || trucks.length === 0) {
    return (
      <View className="flex-1 f-full h-full  items-center">
        <SkeletonLoader />;
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <View className=" flex-1 w-full h-full ">
        <View className="py-2 px-6  ">
          <View style={{ elevation: 4 }} className="relative  rounded-lg">
            <TextInput
              placeholder="Search..."
              // style={styles.input}
              className="border-[0.7px] relative rounded-lg p-4 h-14 border-zinc-300 bg-white placeholder:text-gray-400   font-geistMedium"
              onChangeText={setSearch}
              value={search}
            ></TextInput>
            <View className="absolute top-1/2 right-3 -translate-y-1/2">
              <Ionicons name="search" size={24} color="black" />
            </View>
          </View>
        </View>
        <FlashList
          className="mb-1"
          data={trucks?.filter(
            (truck) =>
              truck?.registration?.includes(search?.trim()) ||
              truck?.driverName?.includes(search?.trim())
          )}
          renderItem={({ item }) => (
            <TruckInfoCard truck={item} handleUpdate={handleUpdate} />
          )}
          estimatedItemSize={500}
          keyExtractor={(truck) => truck?.id?.toString()}
          numColumns={1}
        />
      </View>
    </GestureHandlerRootView>
  );
}
interface BottomSheetProps {
  handleUpdate: () => Promise<void>;
}
export function BottomSheets({ handleUpdate }: BottomSheetProps) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const truckStatus = ["active", "repair"];
  const [registration, setRegistration] = useState("");
  const [driverName, setDriverName] = useState("");
  const [status, setStatus] = useState<"active" | "repair">("active");

  const handleSave = async () => {
    // Trim to remove unnecessary spaces
    const trimmedRegistration = registration.trim();
    const trimmedDriverName = driverName.trim();

    // Validation checks
    if (!trimmedRegistration) {
      alert("Please enter a valid registration number.");
      return;
    }

    if (!/^[A-Z]{2}\d{1,2}[A-Z]{0,2}\d{4}$/.test(trimmedRegistration)) {
      alert("Registration format is invalid. Expected format: 'KL-43-P1234'.");
      return;
    }

    if (!trimmedDriverName) {
      alert("Please enter a valid driver name.");
      return;
    }

    if (trimmedDriverName.length < 3) {
      alert("Driver name must be at least 3 characters long.");
      return;
    }

    if (!["active", "repair"].includes(status)) {
      alert("Please select a valid status.");
      return;
    }

    // If all validations pass
    console.log(
      "handleTheSave",
      trimmedRegistration,
      trimmedDriverName,
      status
    );

    try {
      await drizzleDb.insert(truck_table).values({
        driverName: driverName,
        registration: registration,
        status: status,
      });
    } catch (error) {
      console.log("Error while adding truck :", error);
    } finally {
      await handleUpdate();

      alert("Truck info saved successfully!");
    }
  };

  return (
    <BottomSheet
      enablePanDownToClose={true}
      ref={bottomSheetRef}
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.51,
        shadowRadius: 13.16,
        elevation: 20,
      }}
      onChange={handleSheetChanges}
    >
      <BottomSheetView className="px-6 min-h-[50vh] z-50">
        <Text className="text-base  text-neutral-800 font-geistMedium ">
          Registration
        </Text>
        <View className="relative  rounded-lg">
          <TextInput
            placeholder="Registration..."
            // style={styles.input}
            className="border-[0.7px] relative rounded-lg p-4 h-14 border-zinc-300 bg-white mt-2 placeholder:text-gray-400   font-geistMedium"
            onChangeText={setRegistration}
            value={registration}
          ></TextInput>
        </View>
        <Text className="text-base mt-5  text-neutral-800 font-geistMedium ">
          Name
        </Text>
        <TextInput
          placeholder="Name..."
          // style={styles.input}
          className="border-[0.7px] rounded-lg p-4 h-14 border-zinc-300 placeholder:text-gray-400 placeholder:font-geistRegular mt-2 font-geistMedium"
          onChangeText={setDriverName}
          value={driverName}
        />
        <View className="flex flex-row gap-4 justify-stretch  mt-6">
          {truckStatus?.map((stat, index) => {
            return (
              <Pressable
                onPress={() => setStatus(stat as "active" | "repair")}
                className={` flex-1 border  rounded-md p-4 ${
                  status === stat ? "bg-black text-white" : ""
                } `}
              >
                <Text
                  className={`font-geistMedium ${
                    status === stat ? " text-white" : ""
                  } `}
                >
                  {capitalizeWord(stat)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={handleSave}
          className="bg-neutral-900 px-3 py-4 rounded-lg flex items-center justify-center mt-auto"
        >
          <Text className="text-white font-geistSemiBold ">Save</Text>
        </Pressable>
        <Pressable className="bg-gray-100 px-3 py-4 rounded-lg flex items-center justify-center mt-3">
          <Text className="text-neutral-600 font-geistSemiBold ">Back</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}

const ID = () => {
  const params = useLocalSearchParams();
  const { id } = params;
  const handleUpdate = async () => {};
  return id ? <BottomSheets handleUpdate={handleUpdate} /> : null;
};
