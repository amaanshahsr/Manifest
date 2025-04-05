import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { View, Text, Pressable } from "react-native";

interface StickyHeaderProps {
  onFilterPress: () => void;
  title: string;
}
const StickyHeader = ({ title, onFilterPress }: StickyHeaderProps) => {
  return (
    <View className=" bg-stone-900 p-3 flex flex-row items-center justify-between ">
      <Text className="text-2xl text-white font-geistSemiBold  ">{title}</Text>
      <Pressable onPress={onFilterPress} className="flex flex-row items-center">
        <FontAwesome6 name="sliders" size={22} color="white" />
      </Pressable>
    </View>
  );
};

export default StickyHeader;
