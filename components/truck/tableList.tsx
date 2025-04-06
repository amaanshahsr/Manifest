import React, { useCallback, memo, useState } from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";
import type {
  ManifestWithCompanyName,
  ManifestWithRegistration,
} from "@/types";
import { FlashList } from "@shopify/flash-list";
import { TouchableOpacity } from "react-native";

interface TableListProps<
  T extends
    | ManifestWithCompanyName
    | Omit<ManifestWithRegistration, "createdAt">
> {
  rows: T[];
  tableRowkeys: [keyof T, keyof T];
  columns: [string, string];
}

const TableListComponent = <
  T extends
    | ManifestWithCompanyName
    | Omit<ManifestWithRegistration, "createdAt">
>({
  rows,
  columns,
  tableRowkeys,
}: TableListProps<T>) => {
  const [renderedItemsCount, setRenderedItemsCount] = useState(30);

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = React.useMemo(
    () => rows?.filter((_, index) => index < renderedItemsCount),
    [rows, renderedItemsCount]
  );

  // Optimized renderItem with proper dependency array
  const renderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <TouchableOpacity
        activeOpacity={1}
        className={`flex-row px-4 items-center  py-2 ${
          index === filteredData?.length - 1
            ? "bg-neutral-400/30 rounded-b-lg"
            : "border-b border-x border-neutral-300"
        }`}
      >
        <>
          <Text className="text-neutral-800 text-md font-geistMedium  flex-1 text-left">
            {item[tableRowkeys[0]] as string}
          </Text>
          <Text className="text-neutral-800 text-md font-geistMedium  flex-1 text-right">
            {item[tableRowkeys[1]] as string}
          </Text>
        </>
      </TouchableOpacity>
    ),
    [filteredData.length, tableRowkeys]
  );

  // Memoized header component
  const ListHeader = useCallback(
    () => (
      <View className="flex-row  p-2  bg-neutral-400/30 rounded-t-lg border-neutral-300 border">
        <Text className="font-geistSemiBold text-base flex-1 text-left">
          {columns[0]}
        </Text>
        <Text className="font-geistSemiBold text-base flex-1 text-right">
          {columns[1]}
        </Text>
      </View>
    ),
    [columns]
  );

  const handleScroll = () => {
    if (renderedItemsCount >= rows?.length) return;
    setRenderedItemsCount((oldCount) => oldCount + 30);
  };
  return (
    <FlashList
      contentContainerStyle={{ padding: 10 }}
      data={filteredData}
      ListHeaderComponent={ListHeader}
      estimatedItemSize={40}
      renderItem={renderItem}
      onEndReached={handleScroll}
      keyExtractor={(item) => item?.id?.toString()}
      removeClippedSubviews={true} // Improves memory usage
    />
  );
};

// Memoize the entire component
export default memo(TableListComponent) as typeof TableListComponent;
