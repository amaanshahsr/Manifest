import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  RefreshControl,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import SkeletonLoader from "@/components/common/skeletonLoader";
import TruckInfoCard from "@/components/cards/truckInfoCard";
import CustomSearchBar from "@/components/common/searchBar";
import { useTruckStore } from "@/store/useTruckStore";
import { useSQLiteContext } from "expo-sqlite";
import { ManifestWithCompanyName } from "@/types";
import PageHeader from "@/components/common/pageHeader";
import { AddNewButton } from "@/components/truck/addNewButton";
import NoResultsFound from "@/components/common/noResultsFound";
import TruckBottomSheetModal, {
  TruckModalRef,
} from "@/components/truck/truckBottomSheetModal";

export default function App() {
  const { trucksWithActiveManifests: trucks, fetchTrucksWithActiveManifests } =
    useTruckStore();
  const db = useSQLiteContext();
  const [search, setSearch] = useState("");
  const modalRef = useRef<TruckModalRef>(null);

  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true); // Start refreshing
    await fetchTrucksWithActiveManifests(db); // Fetch new data
    setRefreshing(false); // Stop refreshing
  };

  // Memoized filtered trucks
  const filteredTrucks = useMemo(() => {
    if (!trucks) return [];
    const searchTerm = search.trim().toLowerCase();
    return trucks.filter(
      (truck) =>
        truck?.registration?.toLowerCase().includes(searchTerm) ||
        truck?.driverName?.toLowerCase().includes(searchTerm)
    );
  }, [trucks, search]);

  // Stable callback for modal toggle
  const toggleModal = useCallback((data: ManifestWithCompanyName[]) => {
    modalRef?.current?.open(data);
  }, []);

  useEffect(() => {
    fetchTrucksWithActiveManifests(db);
  }, []);

  if (!trucks || trucks?.length === 0) {
    return (
      <View className="flex-1 w-full h-full  items-center justify-center">
        <NoResultsFound text="No Trucks found" />

        <AddNewButton route="/trucks/new" text="Add New Truck" />
      </View>
    );
  }

  return (
    <View className="flex-1 w-full h-full bg-neutral-50">
      <PageHeader
        title="Trucks"
        headerRightItem={<AddNewButton route="/trucks/new" />}
      >
        <View className="flex flex-row mt-5 mb-2">
          <CustomSearchBar
            search={search}
            setSearch={setSearch}
            placeholder="Search Trucks"
          />
        </View>
      </PageHeader>
      <FlashList
        ListEmptyComponent={<NoResultsFound text="No Trucks found." />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{
          paddingTop: 12, // 👈 top space before the first item
          paddingBottom: 24, // 👈 bottom space after the last item (optional)
          paddingHorizontal: 16, // 👈 optional side padding
        }}
        data={filteredTrucks}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        renderItem={({ item }) => (
          <TruckInfoCard toggleTruckDetails={toggleModal} truck={item} />
        )}
        estimatedItemSize={300}
        keyExtractor={(truck) => truck.id.toString()}
      />
      <TruckBottomSheetModal ref={modalRef} />
    </View>
  );
}
