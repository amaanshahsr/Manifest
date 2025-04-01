import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import SkeletonLoader from "@/components/common/skeletonLoader";
import TruckInfoCard from "@/components/cards/truckInfoCard";
import CustomSearchBar from "@/components/common/searchBar";
import { useTruckStore } from "@/store/useTruckStore";
import AddNewButton from "@/components/common/addNewButton";
import { useSQLiteContext } from "expo-sqlite";
import TableList from "@/components/truck/tableList";
import CustomModal from "@/components/common/customModal";
import { ManifestWithCompanyName } from "@/types";

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
        <AddNewButton route="/trucks/new" text="Truck" />
      </View>
    );
  }

  return (
    <View className="flex-1 w-full h-full">
      <CustomSearchBar search={search} setSearch={setSearch} />
      <AddNewButton route="/trucks/new" text="Truck" />
      <FlashList
        className="mb-1"
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

interface TruckBottomSheetModalProps {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modalData: ManifestWithCompanyName[];
}

const TruckBottomSheetModal = memo(
  ({ isVisible, modalData, setIsVisible }: TruckBottomSheetModalProps) => {
    const handleClose = useCallback(() => setIsVisible(false), [setIsVisible]);

    return (
      <View>
        <CustomModal
          backdropOpacity={0.7}
          visible={isVisible}
          key="trucks"
          onClose={handleClose}
        >
          <TableList
            rows={modalData}
            tableRowkeys={["manifestId", "companyName"]}
            columns={["Manifest No.", "Company Name"]}
            key="tablelist"
          />
        </CustomModal>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.modalData === nextProps.modalData
);
