import { Pressable, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Truck, trucks as truck_table } from "@/db/schema";
import { FlashList } from "@shopify/flash-list";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import TruckInfoCard from "@/components/common/truckInfoCard";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, useRouter } from "expo-router";
import CustomSearchBar from "@/components/common/searchBar";
import { BottomSheets } from "@/components/bottomsheet/truckBottomSheet";

export default function App() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const [trucks, setTrucks] = useState<Truck[] | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { truck } = useLocalSearchParams();
  console.log("trucks", truck);
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
    console.count("hellow world");
    fetchData();
  }, []);

  if (trucks === null || trucks.length === 0) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center">
        <AddNewButton />
      </View>
    );
  }
  return (
    <GestureHandlerRootView>
      <View className=" flex-1 w-full h-full">
        // Search Bar
        <CustomSearchBar search={search} setSearch={setSearch} />
        <AddNewButton />
        //Truck List
        <FlashList
          className="mb-1"
          data={trucks?.filter(
            (truck) =>
              truck?.registration?.includes(search?.trim()) || // ! TODO - Switch to direct DB search?
              truck?.driverName?.includes(search?.trim())
          )}
          renderItem={({ item }) => (
            <TruckInfoCard truck={item} handleUpdate={handleUpdate} />
          )}
          estimatedItemSize={500}
          keyExtractor={(truck) => truck?.id?.toString()}
          numColumns={1}
        />
        // Drawer for Adding and Editing trucks
        <TruckSheet handleUpdate={handleUpdate} /> // This function updates the
        flashlist after addition/edit
      </View>
    </GestureHandlerRootView>
  );
}

interface TruckSheetProps {
  handleUpdate: () => Promise<void>;
}

const TruckSheet: React.FC<TruckSheetProps> = ({ handleUpdate }) => {
  const params = useLocalSearchParams();
  const { truck } = params;

  return truck ? (
    <BottomSheets truckId={truck as string} handleUpdate={handleUpdate} />
  ) : null;
};

const AddNewButton = () => {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        router?.push({
          pathname: "/trucks",
          params: { truck: "new" },
        });
      }}
      className="bg-neutral-900 px-3 py-4 rounded-lg w-11/12 mx-auto flex flex-row gap-2 items-center justify-center "
    >
      <Text className="text-white font-geistSemiBold ">Add New Truck</Text>
      <Ionicons name="add-circle-sharp" size={18} color="white" />
    </Pressable>
  );
};
