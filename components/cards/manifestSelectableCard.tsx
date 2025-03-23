import { Manifest } from "@/db/schema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Pressable } from "react-native";

interface ManifestSelectableCardProps {
  manifest: Omit<Manifest, "createdAt" | "completedOn">;
  selectedIds: number[];
  handleSelect: (id: number, action: "select" | "remove") => void;
}
const ManifestSelectableCard = ({
  manifest,
  selectedIds,
  handleSelect,
}: ManifestSelectableCardProps) => {
  const isSelected =
    selectedIds?.findIndex((id) => id === manifest?.manifestId) !== -1;
  return (
    <Pressable
      //   style={{
      //     shadowColor: "#000",
      //     shadowOffset: { width: 0, height: 4 },
      //     shadowOpacity: 0.1,
      //     shadowRadius: 6,
      //     elevation: 5,
      //   }}
      className={`${
        isSelected ? "bg-neutral-100  " : "bg-white"
      } h-auto w-full  px-5 py-7 mx-auto  border-b border-neutral-400 `}
      onPress={() =>
        handleSelect(manifest?.manifestId, isSelected ? "remove" : "select")
      }
    >
      {/* Row: Manifest Info + Checkbox */}
      <View className="flex-row justify-between items-center">
        {/* Manifest Details */}
        <View className="flex flex-row items-center space-x-2">
          <Text className="text-lg font-geistSemiBold text-neutral-900">
            Manifest ID: {manifest?.manifestId}
          </Text>
        </View>

        {/* Selection Checkbox */}
        <Pressable
          onPress={() =>
            handleSelect(manifest?.manifestId, isSelected ? "remove" : "select")
          }
        >
          <MaterialCommunityIcons
            name={
              isSelected
                ? "checkbox-marked-circle"
                : "checkbox-blank-circle-outline"
            }
            size={24}
            color={isSelected ? "#1e293b" : "#9ca3af"}
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default ManifestSelectableCard;
