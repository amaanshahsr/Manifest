import { BottomSheets } from "@/app/(tabs)/trucks";
import { Truck } from "@/db/schema";
import { capitalizeWord } from "@/utils/utils";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";

interface TruckInfoCardProps {
  truck: Truck;
  handleUpdate: () => Promise<void>;
}
const TruckInfoCard: React.FC<TruckInfoCardProps> = ({ truck }) => {
  const { driverName, id, registration, status } = truck;
  const router = useRouter();
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
      {/* Registration Number */}
      <View className="flex-row justify-between items-center">
        <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {registration}
        </Text>
        <Pressable
          onPress={() =>
            router?.push({
              pathname: "/trucks",
              params: { truck: id },
            })
          }
        >
          <Feather name="edit" size={24} color="#1e293b" /> {/* Edit Icon */}
        </Pressable>
      </View>

      {/* Driver Name */}
      <Text className="font-geistMedium text-base mt-1 mb-2 text-neutral-600">
        Driver: {driverName}
      </Text>

      {/* Assigned Manifests */}
      <View className="flex flex-row justify-between items-center pt-4">
        <Text className="font-geistMedium text-base  text-neutral-800">
          <Text>Assigned Manifests:</Text>
          <Text className="font-geistSemiBold">{id}</Text>
        </Text>
        <View className="bg-zinc-200 px-3 py-1 rounded-full w-auto self-start flex flex-row items-center  gap-2">
          <View
            className={`${
              status === "active" ? "bg-green-600 " : "bg-orange-600"
            } h-2 w-2 rounded-full`}
          ></View>
          <Text className="font-geistSemiBold text-sm text-neutral-700">
            {capitalizeWord(status)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TruckInfoCard;
