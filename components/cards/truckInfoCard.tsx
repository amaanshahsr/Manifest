import { ManifestWithCompanyName, TrucksWithActiveManifests } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import { Route, useRouter } from "expo-router";
import React from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";

interface TruckInfoCardProps {
  truck: TrucksWithActiveManifests;
  toggleTruckDetails: (data: ManifestWithCompanyName[]) => void;
}
const TruckInfoCard: React.FC<TruckInfoCardProps> = ({
  truck,
  toggleTruckDetails,
}) => {
  const { driverName, id, registration, status, manifests } = truck;
  const router = useRouter();
  const manifestCount = manifests?.length;

  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
      className=" bg-zinc-50 h-auto w-[92.5%] mt-5 rounded-xl relative p-6 mx-auto"
    >
      {/* Registration Number */}
      <View className="flex-row justify-between items-center">
        <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {registration}
        </Text>
        <Pressable
          onPress={() =>
            router?.push({
              pathname: `/trucks/[id]`,
              params: { id: id?.toString() },
            })
          }
        >
          <Text>
            <Feather name="edit" size={24} color="#1e293b" />
          </Text>
        </Pressable>
      </View>

      {/* Driver Name */}
      <Text className="font-geistMedium text-base mt-1 mb-2 text-neutral-600">
        Driver: {driverName as string}
      </Text>

      <Pressable
        onPress={() => toggleTruckDetails(manifests)}
        className="flex flex-row justify-between items-center pt-4"
      >
        <Text className="font-geistMedium text-base text-neutral-800">
          <Text>Active Trips: </Text>
          <Text className="font-geistSemiBold text-lg">{manifestCount}</Text>
        </Text>
        <View className="bg-zinc-200 px-3 py-1 rounded-full flex flex-row items-center gap-2">
          <View
            className={`${
              status === "active" ? "bg-green-600" : "bg-orange-600"
            } h-2 w-2 rounded-full`}
          />
          <Text className="font-geistSemiBold text-sm text-neutral-700">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </Pressable>
      <View className="w-full border-t border-zinc-300 mt-5">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router?.push({
              pathname: `/trucks/manage/assign` as Route,
              params: { id: id?.toString() },
            });
          }}
          className="flex flex-row  justify-center bg-stone-950 mt-3 p-3 gap-2 rounded-lg"
        >
          <Text className="text-white font-geistSemiBold text-base">
            Manage
          </Text>
          <Feather name="arrow-right" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export default TruckInfoCard;
