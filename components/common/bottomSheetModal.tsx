import React, { useEffect, useState } from "react";
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
import { useSharedValue } from "react-native-reanimated";
import CustomModal from "./customModal";
import { FlashList } from "@shopify/flash-list";
import { ScrollView } from "react-native-gesture-handler";

interface CustomBottomSheetModalProps {
  data: CompanyWithActiveManifests | null;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomBottomSheetModal = ({
  data,
  isVisible,
  setIsVisible,
}: CustomBottomSheetModalProps) => {
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

    setManifestsWithVehicleRegistration(updatedManifests);
    setloading(false);

    const endTime = performance.now();
    if (endTime - startTime > 50) {
      // Only log slow executions
      console.warn(`Slow effect: ${endTime - startTime}ms`);
    }
  }, [data]);

  return (
    <View>
      <CustomModal
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        backdropOpacity={0.7}
      >
        <TableList
          tableRowkeys={["manifestId", "vehicleRegistration"]}
          rows={manifestsWithVehicleRegistration}
          columns={["Manifest No.", "Registration"]}
        />
      </CustomModal>
    </View>
  );
};

export default CustomBottomSheetModal;

export const TestFlashList = () => {
  // Generate 100 test items
  const generateTestData = () => {
    return Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      title: `Item ${index + 1}`,
      description: `This is item number ${index + 1} in the list`,
    }));
  };
  const data = generateTestData();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
  return (
    <ScrollView className="flex-1 w-full h-16 bg-green-500">
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={80} // Helps with scroll performance
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    display: "flex",
    alignItems: "center",
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
