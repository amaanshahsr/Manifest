import { ManifestWithCompanyName, TrucksWithActiveManifests } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import { Route, useRouter } from "expo-router";
import React from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

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
      className=" bg-zinc-50 h-auto w-full  rounded-xl relative p-6 mx-auto"
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
      <Pressable className="flex flex-row justify-between items-center pt-4">
        <TouchableOpacity
          onPress={() => (manifestCount ? toggleTruckDetails(manifests) : null)}
        >
          <View className="bg-neutral-100 border border-neutral-200 flex-row items-center gap-2 py-2 px-3 rounded-lg shadow-sm">
            <View className="flex flex-row items-center">
              <Text className="font-geistMedium text-base text-neutral-600">
                Active Trips:{" "}
              </Text>
              <Text className="font-geistSemiBold text-lg text-neutral-800">
                {manifestCount}
              </Text>
            </View>
            <Feather
              name="arrow-up-right"
              size={18}
              color="#525252"
              style={{ marginLeft: 4 }}
            />
          </View>
        </TouchableOpacity>

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
          className="flex flex-row  justify-center bg-stone-950 mt-3 p-3 gap-3 rounded-lg"
        >
          <Text className="text-white font-geistSemiBold text-base">
            Manage
          </Text>
          <Ionicons name="book-outline" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export default TruckInfoCard;
