import { manifests, Truck } from "@/db/schema";
import { TruckWithActiveManifests } from "@/types";
import { capitalizeWord } from "@/utils/utils";
import Feather from "@expo/vector-icons/Feather";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";

interface TruckInfoCardProps {
  truck: TruckWithActiveManifests;
}
const TruckInfoCard: React.FC<TruckInfoCardProps> = ({ truck }) => {
  const { driverName, id, registration, status, manifestCount } = truck;
  const router = useRouter();
  console.log("lasdnkjasndj", truck);
  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="bg-white h-auto w-[92.5%] mt-5 rounded-xl relative p-6 mx-auto"
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
            <Feather name="edit" size={24} color="#1e293b" /> {/* Edit Icon */}
          </Text>
        </Pressable>
      </View>

      {/* Driver Name */}
      <Text className="font-geistMedium text-base mt-1 mb-2 text-neutral-600">
        Driver: {driverName as string}
      </Text>

      {/* Assigned Manifests */}
      <View className="flex flex-row justify-between items-center pt-4">
        <Text className="font-geistMedium text-base  text-neutral-800">
          <Text>Active Trips: </Text>
          <Text className="font-geistSemiBold text-lg">{manifestCount}</Text>
        </Text>
        <View className="bg-zinc-200 px-3 py-1 rounded-full w-auto self-start flex flex-row items-center  gap-2">
          <View
            className={`${
              status === "active" ? "bg-green-600 " : "bg-orange-600"
            } h-2 w-2 rounded-full`}
          ></View>
          <Text className="font-geistSemiBold text-sm text-neutral-700">
            {capitalizeWord(status) as string}
          </Text>
        </View>
      </View>
      <View className="w-full border-t border-zinc-300 mt-5">
        <Pressable className="flex flex-row  justify-center bg-stone-950 mt-3 p-3 gap-2 rounded-lg">
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

{
  /* Buttons for Assign Manifest & Edit Status */
}
{
  /* <View className="flex-row justify-start gap-3 mt-4">
  <Pressable
    // onPress={() => router?.push(`/assign-manifest/${id}`)}
    className="bg-blue-600 px-4 py-2 rounded-lg flex flex-row items-center gap-2"
  >
    <Text className="text-white font-geistSemiBold p-1 text-sm">
      Assign Manifest
    </Text>
    <Feather name="plus-circle" size={18} color="white" />
  </Pressable>

  <Pressable
    // onPress={() => router?.push(`/edit-status/${id}`)}
    className="bg-gray-700 px-4 py-2 rounded-lg flex flex-row items-center gap-2"
  >
    <Text className="text-white font-geistSemiBold text-sm">
      Edit Status
    </Text>
    <Feather name="pen-tool" size={18} color="white" />
  </Pressable>
</View> */
}
