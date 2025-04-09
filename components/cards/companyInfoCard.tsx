import { Manifest } from "@/db/schema";
import { useTruckStore } from "@/store/useTruckStore";
import {
  CompanyWithActiveManifests,
  GenericRecord,
  TrucksWithActiveManifests,
} from "@/types";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import TableList from "../truck/tableList";

interface CompanyInfoCardProps {
  company: CompanyWithActiveManifests;
  handleModalOpen: (data: CompanyWithActiveManifests) => void;
}

export const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  company,
  handleModalOpen,
}) => {
  const { companyName, id } = company;
  // const { trucksWithActiveManifests } = useTruckStore();
  const router = useRouter();
  const activeManifestCount = company?.manifests?.length;

  // const processManifestsWithVehicleRegistration = useCallback(
  //   (
  //     manifests: Manifest[] | undefined,
  //     trucks: TrucksWithActiveManifests[] | undefined
  //   ): Array<Manifest & { vehicleRegistration: string }> => {
  //     if (!manifests || !trucks) return [];

  //     const truckMap = trucks.reduce<GenericRecord>((acc, truck) => {
  //       acc[truck.id] = truck.registration;
  //       return acc;
  //     }, {});

  //     return manifests.map((manifest) => ({
  //       ...manifest,
  //       vehicleRegistration: truckMap[manifest.assignedTo || ""] || "",
  //     }));
  //   },
  //   []
  // );
  // const [
  //   manifestsWithVehicleRegistration,
  //   setManifestsWithVehicleRegistration,
  // ] = useState<Array<Manifest & { vehicleRegistration: string }>>([]);
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setLoading(true);
  //   const processedManifests = processManifestsWithVehicleRegistration(
  //     company?.manifests,
  //     trucksWithActiveManifests
  //   );
  //   setManifestsWithVehicleRegistration(processedManifests);
  //   setLoading(false);
  // }, [company]);

  // const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Animated.View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="bg-white w-full h-auto   rounded-xl p-6 mx-auto "
    >
      <View className="flex-row justify-between mb-5 items-center">
        <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {companyName}
        </Text>
        <Pressable
          onPress={() => {
            router?.push({
              pathname: `/companies/[id]`,
              params: { id: id?.toString() },
            });
          }}
        >
          <Text>
            <Feather name="edit" size={24} color="#1e293b" /> {/* Edit Icon */}
          </Text>
        </Pressable>
      </View>
      <Pressable className="flex flex-row  gap-3 items-center justify-between">
        <ManifestCount count={activeManifestCount} />
        {activeManifestCount > 0 ? (
          <TouchableOpacity
            onPress={() => handleModalOpen(company)}
            activeOpacity={0.7}
            className="flex flex-row items-center gap-2 py-2 px-3  rounded-full bg-neutral-900"
          >
            <Text className={`text-white font-geistSemiBold text-base ${""}`}>
              View
            </Text>
            <Feather name="arrow-up-right" size={20} color="white" />
          </TouchableOpacity>
        ) : null}
      </Pressable>
      {/* {isExpanded?
    
      < <TableList
      tableRowkeys={["manifestId", "vehicleRegistration"]}
      rows={manifestsWithVehicleRegistration}
      tableHeaders={["Manifest No.", "Registration"]}
    />:null} */}
    </Animated.View>
  );
};

interface ManifestCountProps {
  count: number;
}

function ManifestCount({ count }: ManifestCountProps) {
  return (
    <Text className="font-geistSemiBold text-base   flex flex-row items-center text-neutral-900">
      <Text className="text-neutral-500">Active Manifests: </Text>
      <Text className="text-xl">{count}</Text>
    </Text>
  );
}
