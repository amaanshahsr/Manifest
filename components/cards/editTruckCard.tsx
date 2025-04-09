import { Manifest } from "@/db/schema";
import { ManifestWithCompanyName } from "@/types";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router, Route } from "expo-router";
import React from "react";
import { View, Text, Pressable } from "react-native";

interface EditTruckCardProps {
  manifest: ManifestWithCompanyName;
  saveFn: (id?: number) => Promise<void>;
}

const EditTruckCard = ({ manifest, saveFn }: EditTruckCardProps) => {
  const { assignedTo, companyId, companyName, id, manifestId, status } =
    manifest;

  return (
    <View className="bg-white rounded-xl p-6 shadow-sm">
      {/* Manifest Number Section */}
      <View className="flex flex-row items-center gap-3 mb-4">
        <Text className="font-geistMedium text-neutral-600 text-base">
          Manifest No:
        </Text>
        <Text className="text-2xl font-geistSemiBold text-neutral-900">
          {manifestId}
        </Text>
        <View className="bg-zinc-200 ml-auto px-3 py-1 rounded-full flex flex-row items-center gap-2">
          <View
            className={`${
              status === "active" ? "bg-green-600" : "bg-orange-600"
            } h-2 w-2 rounded-full`}
          />
          <Text className="font-geistSemiBold text-sm text-neutral-700">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Company Name Section */}
      <Text className="text-lg font-geistSemiBold text-neutral-900 mb-4">
        Company: {companyName}
      </Text>
      <Pressable
        onPress={() => saveFn(manifestId)}
        className="flex flex-row items-center justify-center bg-stone-950 mt-4 py-3 px-6 gap-2 rounded-lg active:bg-stone-800"
      >
        <Text className="text-white font-geistSemiBold text-base">
          Mark Completed
        </Text>
        <AntDesign name="save" size={20} color="white" />
      </Pressable>
    </View>
  );
};

export default EditTruckCard;
