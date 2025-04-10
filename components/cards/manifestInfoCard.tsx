import { Manifest } from "@/db/schema";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, Pressable } from "react-native";

interface ManifestInfoCardProps {
  manifest: Manifest;
}

export const ManifestCard = ({ manifest }: ManifestInfoCardProps) => {
  const { manifestId, status, createdAt } = manifest;

  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="bg-zinc-50 rounded-xl p-4 w-full mx-auto space-y-4"
    >
      {/* Header: Manifest Label + Edit Icon */}
      <View className="flex-row justify-between items-center py-2">
        <View className="flex-row justify-between items-center gap-2">
          <Text className="text-[13px] text-neutral-500 font-geistMedium uppercase tracking-wide">
            Manifest
          </Text>
          <Text className="text-[22px] font-geistSemiBold text-neutral-900">
            #{manifestId}
          </Text>
        </View>

        <Pressable
          hitSlop={20}
          className="p-2 rounded-full active:bg-neutral-100"
          // onPress={() =>
          //   router.push({
          //     pathname: "/manifests",
          //     params: { id: id?.toString() },
          //   })
          // }
        >
          <Feather name="edit" size={20} color="#1e293b" />
        </Pressable>
      </View>

      {/* Divider */}
      <View className="h-px my-3 bg-neutral-200" />

      {/* Footer: Status + Created At */}
      <View className="flex-row justify-between items-center">
        {/* Status Pill */}
        <View className="flex-row items-center gap-2 bg-zinc-200 px-3 py-1 rounded-full">
          <View
            className={`h-2 w-2 rounded-full ${
              status === "active"
                ? "bg-green-600"
                : status === "completed"
                ? "bg-neutral-400"
                : "bg-orange-500"
            }`}
          />
          <Text className="text-[13px] font-geistMedium text-neutral-700 capitalize">
            {status}
          </Text>
        </View>

        {/* Created Date */}
        <View className="flex-row items-center gap-1">
          <Feather name="calendar" size={14} color="#9ca3af" />
          <Text className="text-[12px] text-neutral-500">
            Created{" "}
            {new Date(createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};
