import { Manifest } from "@/db/schema";
import { Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

interface ManifestSelectableCardProps {
  manifest: Omit<Manifest, "completedOn">;
  selectedIds: number[];
  handleSelect: (id: number, action: "select" | "remove") => void;
}
const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);
const ManifestSelectableCard = ({
  manifest,
  selectedIds,
  handleSelect,
}: ManifestSelectableCardProps) => {
  const isSelected =
    selectedIds?.findIndex((id) => id === manifest?.manifestId) !== -1;

  return (
    <Pressable
      className={`${
        isSelected ? "bg-neutral-200" : "bg-white"
      } w-full px-5 py-5 border-b border-neutral-300`}
      onPress={() =>
        handleSelect(manifest?.manifestId, isSelected ? "remove" : "select")
      }
    >
      {/* Row: Manifest Info + Checkbox */}
      <View className="flex-row justify-between items-center">
        {/* Manifest Details */}
        <View className="space-y-1">
          <Text className="text-lg font-geistSemiBold text-neutral-900">
            Manifest No:{" "}
            <Text className="text-xl ml-1">{manifest?.manifestId}</Text>
          </Text>
          <View className="font-geist gap-2 flex flex-row items-center pt-2">
            {/* <Feather name="calendar" size={14} color="#9ca3af" /> */}
            <Entypo name="calendar" size={18} color="#4b5563" />
            <Text className="text-neutral-500 text-sm ">
              {new Date(manifest?.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Selection Checkbox */}
        <Pressable
          onPress={() =>
            handleSelect(manifest?.manifestId, isSelected ? "remove" : "select")
          }
          className="pl-4"
        >
          <AnimatedIcon
            name={
              isSelected
                ? "checkbox-marked-circle"
                : "checkbox-blank-circle-outline"
            }
            size={24}
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default ManifestSelectableCard;
