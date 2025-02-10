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
import { TruckBottomSheet } from "@/components/bottomsheet/truckBottomSheet";
import { useDataFetch } from "@/hooks/useDataFetch";

export default function App() {
  const db = useSQLiteContext();

  const {
    data: trucks,
    loading,
    refresh,
  } = useDataFetch<Truck>({
    db,
    table: truck_table,
  });

  const [search, setSearch] = useState("");

  // This Component adds an early return to empty or loading state when data is not present yet.

  if (loading) {
    return (
      <View className="flex-1 w-full h-full  ">
        <FlashList
          data={Array(10).fill(null)}
          renderItem={() => <SkeletonLoader />}
          estimatedItemSize={10}
          keyExtractor={(_, index) => `skeleton-${index}`}
        />
      </View>
    );
  }

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
            <TruckInfoCard truck={item} handleUpdate={refresh} />
          )}
          estimatedItemSize={500}
          keyExtractor={(truck) => truck?.id?.toString()}
          numColumns={1}
        />
        // Drawer for Adding and Editing trucks
        <TruckSheet refresh={refresh} />
      </View>
    </GestureHandlerRootView>
  );
}

interface TruckSheetProps {
  refresh: () => Promise<void>;
}

const TruckSheet: React.FC<TruckSheetProps> = ({ refresh }) => {
  const params = useLocalSearchParams();
  const { truck } = params;

  return truck ? (
    <TruckBottomSheet truckId={truck as string} refresh={refresh} />
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
