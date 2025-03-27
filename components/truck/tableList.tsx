import React, { useCallback, memo } from "react";
import { View, Text } from "react-native";
// import { FlashList } from "@shopify/flash-list";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { FlashList } from "react-native-actions-sheet/dist/src/views/FlashList";
import type {
  ManifestWithAssignedVehicleRegistration,
  ManifestWithCompanyName,
} from "@/types";

interface TableListProps<
  T extends
    | ManifestWithCompanyName
    | Omit<ManifestWithAssignedVehicleRegistration, "createdAt">
> {
  rows: T[];
  tableRowkeys: [keyof T, keyof T];
  tableHeaders: string[];
}

const TableListComponent = <
  T extends
    | ManifestWithCompanyName
    | Omit<ManifestWithAssignedVehicleRegistration, "createdAt">
>({
  rows,
  tableHeaders,
  tableRowkeys,
}: TableListProps<T>) => {
  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = React.useMemo(
    () => rows?.filter((_, index) => index < 30),
    [rows]
  );

  // Optimized renderItem with proper dependency array
  const renderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <View
        className={`flex-row items-center py-2 ${
          index === rows.length - 1 ? "" : "border-b border-neutral-300"
        }`}
      >
        <Text className="text-neutral-800 font-geistMedium text-base flex-1 text-left">
          {item[tableRowkeys[0]] as string}
        </Text>
        <Text className="text-neutral-800 font-geistMedium text-base flex-1 text-right">
          {item[tableRowkeys[1]] as string}
        </Text>
      </View>
    ),
    [rows.length, tableRowkeys]
  );

  // Memoized header component
  const ListHeader = useCallback(
    () => (
      <View className="flex-row border-b border-neutral-400 pb-2">
        <Text className="font-geistSemiBold text-base flex-1 text-left">
          {tableHeaders[0]}
        </Text>
        <Text className="font-geistSemiBold text-base flex-1 text-right">
          {tableHeaders[1]}
        </Text>
      </View>
    ),
    [tableHeaders]
  );

  return (
    <View className="mt-3 flex-1 w-full bg-zinc-100 rounded-lg">
      <FlashList
        data={filteredData}
        ListHeaderComponent={ListHeader}
        estimatedItemSize={40}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id?.toString()}
        removeClippedSubviews={true} // Improves memory usage
      />
    </View>
  );
};

// Memoize the entire component
export default memo(TableListComponent) as typeof TableListComponent;
