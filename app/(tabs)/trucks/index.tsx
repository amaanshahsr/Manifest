import { View } from "react-native";
import React, { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import SkeletonLoader from "@/components/common/skeletonLoader";
import TruckInfoCard from "@/components/cards/truckInfoCard";
import CustomSearchBar from "@/components/common/searchBar";
import { useTruckStore } from "@/store/useTruckStore";
import AddNewButton from "@/components/common/addNewButton";
import { useSQLiteContext } from "expo-sqlite";
import { useIsFocused } from "@react-navigation/native";
import Animated, { SlideInLeft, SlideInRight } from "react-native-reanimated";

export default function App() {
  const {
    fetchTrucks,
    trucksWithActiveManifests: trucks,
    fetchTrucksWithActiveManifests,
    loading,
  } = useTruckStore();
  const db = useSQLiteContext();

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTrucksWithActiveManifests(db);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 w-full h-full  ">
        {/* <FlashList
          data={Array(10).fill(null)}
          renderItem={() => <SkeletonLoader />}
          estimatedItemSize={10}
          keyExtractor={(_, index) => `skeleton-${index}`}
        /> */}
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
    <Animated.View className=" flex-1 w-full h-full">
      <CustomSearchBar search={search} setSearch={setSearch} />
      <AddNewButton route="/trucks/new" text="Truck" />
      <FlashList
        className="mb-1"
        data={trucks?.filter(
          (truck) =>
            truck?.registration
              ?.toLowerCase()
              .includes(search?.trim().toLowerCase()) || // ! TODO - Switch to direct DB search?
            truck?.driverName
              ?.toLowerCase()
              .includes(search?.trim().toLowerCase())
        )}
        renderItem={({ item }) => <TruckInfoCard truck={item} />}
        estimatedItemSize={300}
        keyExtractor={(truck) => truck?.id?.toString()}
      />
    </Animated.View>
  );
}
