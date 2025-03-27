import BottomSheet, {
  BottomSheetFlashList,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TableList from "../truck/tableList";
import {
  CompanyWithActiveManifests,
  GenericRecord,
  ManifestWithCompanyName,
  TrucksWithActiveManifests,
} from "@/types";
import { useTruckStore } from "@/store/useTruckStore";
import { Manifest } from "@/db/schema";
import { View, Text, Button, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { createCustomBackdrop } from "./backdrop";
import { useSharedValue } from "react-native-reanimated";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { FlashList } from "react-native-actions-sheet/dist/src/views/FlashList";
import CustomModal from "./bareBoneModal";
export type Ref = BottomSheetModal;

interface CustomBottomSheetModalProps {
  data: CompanyWithActiveManifests | null;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  //   handleClose: () => void;
}

const CustomBottomSheetModal = forwardRef<
  ActionSheetRef,
  CustomBottomSheetModalProps
>(({ data, isVisible, setIsVisible }, ref) => {
  const snapPoints = useMemo(() => [50, 75, 90], []); // Start smaller
  const { trucksWithActiveManifests } = useTruckStore();
  const [
    manifestsWithVehicleRegistration,
    setManifestsWithVehicleRegistration,
  ] = useState<Array<Manifest & { vehicleRegistration: string }>>([]);
  const [loading, setloading] = useState<boolean>(false);

  useEffect(() => {
    if (!data?.manifests || !trucksWithActiveManifests) {
      setManifestsWithVehicleRegistration([]);
      return;
    }
    setloading(true);
    const startTime = performance.now();

    // Create lookup map for O(1) access instead of O(n) find
    const truckMap = trucksWithActiveManifests.reduce<GenericRecord>(
      (acc, truck) => {
        acc[truck.id] = truck.registration;
        return acc;
      },
      {}
    );

    const updatedManifests = data.manifests.map((manifest) => ({
      ...manifest,
      vehicleRegistration: truckMap[manifest.assignedTo || ""] || "",
    }));

    setTimeout(() => {
      setManifestsWithVehicleRegistration(updatedManifests);
      setloading(false);
    }, 500);

    const endTime = performance.now();
    if (endTime - startTime > 50) {
      // Only log slow executions
      console.warn(`Slow effect: ${endTime - startTime}ms`);
    }
  }, [data]);
  const animateValue = useSharedValue(1);

  return (
    <CustomModal
      visible={isVisible}
      onClose={() => setIsVisible(false)}
      backdropOpacity={0.7}
      animationType="slide"
    >
      <TableList
        tableRowkeys={["manifestId", "vehicleRegistration"]}
        rows={manifestsWithVehicleRegistration}
        tableHeaders={["Manifest No.", "Registration"]}
      />
    </CustomModal>
  );
});

export default CustomBottomSheetModal;

// Generate 100 test items
const generateTestData = () => {
  return Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    title: `Item ${index + 1}`,
    description: `This is item number ${index + 1} in the list`,
  }));
};

export const TestFlashList = () => {
  const data = generateTestData();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={80} // Helps with scroll performance
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
});
