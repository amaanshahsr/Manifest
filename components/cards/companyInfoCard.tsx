import {
  CompanyWithActiveManifests,
  ManifestWithAssignedVehicleRegistration,
} from "@/types";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Accordion from "../truck/accordion";
import { CommonActions } from "@react-navigation/native";
import { companies, manifests } from "@/db/schema";
import { useTruckStore } from "@/store/useTruckStore";
import { useMemo, useState } from "react";

interface CompanyInfoCardProps {
  company: CompanyWithActiveManifests;
}

export const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  company,
}) => {
  const { trucksWithActiveManifests } = useTruckStore();
  const { companyName, id } = company;
  const router = useRouter();
  const activeManifestCount = company?.manifests?.length;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const manifestsWithVehicleRegistration = useMemo(() => {
    return (
      company?.manifests?.map((manifest) => {
        const assignedTruckDetails = trucksWithActiveManifests?.find(
          (truck) => truck?.id === manifest?.assignedTo
        );
        return {
          ...manifest,
          vehicleRegistration: assignedTruckDetails?.registration || "",
        };
      }) ?? []
    );
  }, [company?.manifests, trucksWithActiveManifests]);

  // Shared value for rotation angle
  const rotateValue = useSharedValue(180);

  // Animated style for rotation
  const animatedRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }], // Rotate by the current value
  }));

  const spinChevron = () => {
    setIsExpanded((old) => !old);
    rotateValue.value = withTiming(
      rotateValue?.value === 180 ? 0 : 180, // Toggle between 0 and 180 degrees
      { duration: 150, easing: Easing.out(Easing.quad) } // Snappy transition
    );
  };
  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="bg-white h-auto w-[92.5%] mt-5 rounded-xl p-6 mx-auto"
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
      <Pressable
        onPress={spinChevron}
        className="flex flex-row  gap-3 items-center"
      >
        <ManifestCount count={activeManifestCount} />
        {activeManifestCount > 0 ? (
          <Animated.View style={[animatedRotateStyle]}>
            <Feather name="chevron-up" size={20} color="#1e293b" />
          </Animated.View>
        ) : null}
      </Pressable>
      <Accordion
        expanded={isExpanded}
        tableRowkeys={["manifestId", "vehicleRegistration"]}
        rows={manifestsWithVehicleRegistration}
        tableHeaders={["Manifest No.", "Registration"]}
      />
    </View>
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
