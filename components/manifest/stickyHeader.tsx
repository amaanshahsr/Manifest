import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { View, Text, Pressable } from "react-native";

interface StickyHeaderProps {
  title: string;
}
const StickyHeader = ({ title }: StickyHeaderProps) => {
  return (
    <View className="bg-stone-900 px-4 py-3 flex-row rounded-t-md  items-center justify-between border-b border-stone-700">
      <Text className="text-2xl text-white font-geistSemiBold">{title}</Text>

      {/* Uncomment and use this if you plan to add filter/settings icon */}
      {/* 
    <Pressable className="p-2 rounded-md bg-stone-800 active:opacity-80">
      <FontAwesome6 name="sliders" size={20} color="white" />
    </Pressable> 
    */}
    </View>
  );
};

export default StickyHeader;
