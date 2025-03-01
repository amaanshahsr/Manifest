import { View } from "react-native";
import React, { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import SkeletonLoader from "@/components/common/skeletonLoader";
import TruckInfoCard from "@/components/cards/truckInfoCard";
import CustomSearchBar from "@/components/common/searchBar";
import { useTruckStore } from "@/store/useTruckStore";
import AddNewButton from "@/components/common/addNewButton";
import { useSQLiteContext } from "expo-sqlite";

export default function App() {
  const { fetchTrucks, trucks, loading } = useTruckStore();
  const db = useSQLiteContext();

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTrucks(db);
  }, []);

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
        <AddNewButton route="/trucks/new" text="Truck" />
      </View>
    );
  }

  return (
    <View className=" flex-1 w-full h-full">
      <CustomSearchBar search={search} setSearch={setSearch} />
      <AddNewButton route="/trucks/new" text="Truck" />
      <FlashList
        className="mb-1"
        data={trucks?.filter(
          (truck) =>
            truck?.registration?.includes(search?.trim()) || // ! TODO - Switch to direct DB search?
            truck?.driverName?.includes(search?.trim())
        )}
        renderItem={({ item }) => <TruckInfoCard truck={item} />}
        estimatedItemSize={500}
        keyExtractor={(truck) => truck?.id?.toString()}
        numColumns={1}
      />
    </View>
  );
}
