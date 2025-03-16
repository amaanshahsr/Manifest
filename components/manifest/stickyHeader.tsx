import React from "react";
import { View, Text } from "react-native";

interface StickyHeaderProps {
  title: string;
}
const StickyHeader = ({ title }: StickyHeaderProps) => {
  return (
    <View className=" bg-stone-300 py-3 flex items-center justify-center rounded-md">
      <Text className="text-2xl font-geistSemiBold text-stone-900 ">
        {title}
      </Text>
    </View>
  );
};

export default StickyHeader;
