import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { View, Text } from "react-native";

interface NoResultsFoundProps {
  text: string;
}
const NoResultsFound = ({ text }: NoResultsFoundProps) => {
  return (
    <View className="flex items-center justify-center p-6">
      <AntDesign name="inbox" size={40} color="#999" className="mb-3" />
      <Text className="text-lg font-geistMedium text-gray-600 text-center">
        {text}
      </Text>
    </View>
  );
};

export default NoResultsFound;
