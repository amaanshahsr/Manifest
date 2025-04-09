import { Manifest } from "@/db/schema";
import { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";

interface AssignStickyHeaderProps {
  item: string;
  manifestList: {
    result: (string | Omit<Manifest, "createdAt" | "completedOn">)[];
    companyPositions: Record<string, number>;
  };
  position: number;
  toggleItemSelect: (
    ids: number | number[],
    action: "select" | "remove"
  ) => void;
}

export const AssignStickyHeader = ({
  item,
  manifestList,
  position,
  toggleItemSelect,
}: AssignStickyHeaderProps) => {
  const [allSelected, setAllSelected] = useState(false);

  const handlePress = () => {
    setAllSelected((old) => !old);
    const manifestListCopy = [...manifestList?.result];

    // Convert the companyPositions object into an array of [key, position] pairs and sort by position
    const sortedCompanyPositions = Object.entries(
      manifestList?.companyPositions || {}
    ).sort((a, b) => a[1] - b[1]);

    // Find the index of the current position in the sortedCompanyPositions array
    const currentPositionIndex = sortedCompanyPositions.findIndex(
      ([key, value]) => value === position
    );

    // Get the next position in the sortedCompanyPositions array
    const nextPosition = sortedCompanyPositions[currentPositionIndex + 1];
    // Filter elements in the manifestListCopy array between `position` and `nextPosition[1]` (exclusive)
    const manifestsForSelectedCompany = manifestListCopy.filter(
      (manifest, index) =>
        index > position &&
        index < (nextPosition ? nextPosition[1] : manifestListCopy?.length)
    );

    const filteredResults = manifestsForSelectedCompany
      ?.filter((item) => typeof item !== "string")
      ?.map((item) => item?.manifestId);

    toggleItemSelect(filteredResults, allSelected ? "remove" : "select");
  };

  return (
    <View className="flex flex-row items-center justify-between px-4 py-3 bg-zinc-900 rounded-t-md shadow-sm">
      <Text className="text-xl font-geistSemiBold text-neutral-100 tracking-wide">
        {item}
      </Text>

      <TouchableOpacity
        onPress={handlePress}
        className="bg-white px-3 py-1.5 w-32 rounded-md flex-row justify-center items-center shadow-sm"
      >
        <Animated.View>
          <Text className="text-sm font-geistMedium text-stone-800">
            {allSelected ? "Deselect All" : "Select all"}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};
