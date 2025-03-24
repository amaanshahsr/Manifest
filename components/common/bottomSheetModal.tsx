import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import TableList from "../truck/tableList";
import { CompanyWithActiveManifests, GenericRecord } from "@/types";
import { useTruckStore } from "@/store/useTruckStore";
import { Manifest } from "@/db/schema";
import { View, Text, Button } from "react-native";
import { useLocalSearchParams } from "expo-router";

export type Ref = BottomSheetModal;

interface CustomBottomSheetModalProps {
  data: CompanyWithActiveManifests | null;
  //   handleClose: () => void;
}

const CustomBottomSheetModal = forwardRef<
  BottomSheetModal,
  CustomBottomSheetModalProps
>(({ data }, ref) => {
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  const { trucksWithActiveManifests } = useTruckStore();
  const [
    manifestsWithVehicleRegistration,
    setManifestsWithVehicleRegistration,
  ] = useState<Array<Manifest & { vehicleRegistration: string }>>([]);

  useEffect(() => {
    if (!data?.manifests || !trucksWithActiveManifests) {
      setManifestsWithVehicleRegistration([]);
      return;
    }

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

    const endTime = performance.now();
    if (endTime - startTime > 50) {
      // Only log slow executions
      console.warn(`Slow effect: ${endTime - startTime}ms`);
    }
  }, [data]);

  return (
    <BottomSheetModal index={1} snapPoints={snapPoints} ref={ref}>
      <TableList
        tableRowkeys={["manifestId", "vehicleRegistration"]}
        rows={manifestsWithVehicleRegistration}
        tableHeaders={["Manifest No.", "Registration"]}
      />
    </BottomSheetModal>
  );
});

export default CustomBottomSheetModal;
