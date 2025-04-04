import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { RefreshControl, View, Text, TextInput, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import SkeletonLoader from "@/components/common/skeletonLoader";
import TruckInfoCard from "@/components/cards/truckInfoCard";
import CustomSearchBar from "@/components/common/searchBar";
import { useTruckStore } from "@/store/useTruckStore";
import { useSQLiteContext } from "expo-sqlite";
import TableList from "@/components/truck/tableList";
import CustomModal from "@/components/common/customModal";
import { ManifestWithCompanyName } from "@/types";
import { TruckBottomSheetModal } from "@/components/truck/truckBottomSheetModal";
import { router, useNavigation, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "@/components/common/pageHeader";
import PageHeader from "@/components/common/pageHeader";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { AddTruckButton } from "@/components/truck/addTruckButton";

export default function App() {
  const {
    trucksWithActiveManifests: trucks,
    fetchTrucksWithActiveManifests,
    loading,
  } = useTruckStore();
  const db = useSQLiteContext();
  const [search, setSearch] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [modalData, setModalData] = useState<ManifestWithCompanyName[]>([]);

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
    setIsVisible(true);
    setModalData(data);
  }, []);

  useEffect(() => {
    fetchTrucksWithActiveManifests(db);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 w-full h-full">
        <FlashList
          data={Array(10).fill(null)}
          renderItem={() => <SkeletonLoader />}
          estimatedItemSize={10}
          keyExtractor={(_, index) => `skeleton-${index}`}
        />
      </View>
    );
  }

  if (!trucks || trucks.length === 0) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center">
        {/* <AddNewButton route="/trucks/new" text="Truck" /> */}
      </View>
    );
  }

  return (
    <View className="flex-1 w-full h-full bg-neutral-50">
      <PageHeader
        title="Trucks"
        headerRightItem={<AddTruckButton route="/trucks/new" />}
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
        className="mb-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        data={filteredTrucks}
        renderItem={({ item }) => (
          <TruckInfoCard toggleTruckDetails={toggleModal} truck={item} />
        )}
        estimatedItemSize={300}
        keyExtractor={(truck) => truck.id.toString()}
      />
      <TruckBottomSheetModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        modalData={modalData}
      />
    </View>
  );
}
