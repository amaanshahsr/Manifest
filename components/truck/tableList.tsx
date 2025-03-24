import {
  ManifestWithAssignedVehicleRegistration,
  ManifestWithCompanyName,
} from "@/types";
import { BottomSheetFlashList, BottomSheetView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useState } from "react";
import { View, Text } from "react-native";
import Animated from "react-native-reanimated";

interface TableListProps<
  T extends
    | ManifestWithCompanyName
    | Omit<ManifestWithAssignedVehicleRegistration, "createdAt">
> {
  rows: T[];
  tableRowkeys: [keyof T, keyof T];
  tableHeaders: string[];
}

const TableList = <
  T extends
    | ManifestWithCompanyName
    | Omit<ManifestWithAssignedVehicleRegistration, "createdAt">
>({
  rows,
  tableHeaders,
  tableRowkeys,
}: TableListProps<T>) => {
  const renderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      return (
        <BottomSheetView
          className={`flex-row items-center py-2 ${
            index === rows.length - 1 ? "" : "border-b border-neutral-300"
          }`}
        >
          <Text className="text-neutral-800 font-geistMedium text-base flex-1 text-left">
            {item[tableRowkeys[0] as keyof typeof item] as string}
          </Text>
          <Text className="text-neutral-800 font-geistMedium text-base flex-1 text-right">
            {item[tableRowkeys[1] as keyof typeof item] as string}
          </Text>
        </BottomSheetView>
      );
    },
    []
  );
  return (
    <BottomSheetView className={`mt-3 flex-1  w-full bg-zinc-100  rounded-lg`}>
      <BottomSheetFlashList
        data={rows?.filter((_, index) => index < 50)}
        ListHeaderComponent={
          <BottomSheetView className="flex-row border-b border-neutral-400 pb-2">
            <Text
              className={`font-geistSemiBold text-base flex-1 "text-left" 
`}
            >
              {tableHeaders[0]}
            </Text>
            <Text className={`font-geistSemiBold text-base flex-1 text-right `}>
              {tableHeaders[1]}
            </Text>
          </BottomSheetView>
        }
        renderItem={renderItem}
        estimatedItemSize={200}
        aria-modal={true}
        keyExtractor={(item) => item?.id?.toString()}
      />
    </BottomSheetView>
  );
};

export default TableList;
