import { Manifest } from "@/db/schema";
import { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";

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
    <View className="flex flex-row px-2 items-center justify-between bg-stone-900 py-3 ">
      <View className="  flex items-center justify-between rounded-sm">
        <Text className="text-2xl font-geistSemiBold text-neutral-200 ">
          {item}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handlePress}
        className="bg-white p-2 rounded-lg gap-2 flex flex-row items-center"
      >
        <Text className="font-geistMedium">
          {!allSelected ? "Select all" : "Deselect All"}
        </Text>
        {/* <AntDesign name="checkcircleo" size={20} color="black" /> */}
      </TouchableOpacity>
    </View>
  );
};
