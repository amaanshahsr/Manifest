import React, { useEffect, useState } from "react";
import TableList from "../truck/tableList";
import { CompanyWithActiveManifests, GenericRecord } from "@/types";
import { useTruckStore } from "@/store/useTruckStore";
import { Manifest } from "@/db/schema";
import { View } from "react-native";
import CustomModal from "./customModal";

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
