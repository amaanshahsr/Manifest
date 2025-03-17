import {
  ManifestWithAssignedVehicleRegistration,
  ManifestWithCompanyName,
} from "@/types";
import React, { useState } from "react";
import { Pressable, View, Text, LayoutChangeEvent } from "react-native";
import Animated from "react-native-reanimated";

interface AccordionProps<
  T extends ManifestWithCompanyName | ManifestWithAssignedVehicleRegistration
> {
  expanded?: boolean;
  rows: T[];
  tableRowkeys: [keyof T, keyof T];
  tableHeaders: string[];
}

const Accordion = <
  T extends ManifestWithCompanyName | ManifestWithAssignedVehicleRegistration
>({
  expanded,
  rows,
  tableHeaders,
  tableRowkeys,
}: AccordionProps<T>) => {
  const handleLayout = (e: LayoutChangeEvent) => {};
  return (
    <Animated.View
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.2,

        elevation: 2,
      }}
      className={`mt-3 ${
        expanded ? "h-auto" : "h-0 overflow-hidden"
      } bg-zinc-100 rounded-lg`}
    >
      <View onLayout={handleLayout} className="p-3 ">
        <TableHeaders headers={tableHeaders} />
        <TableRows rows={rows} rowKeys={tableRowkeys} />
      </View>
    </Animated.View>
  );
};

export default Accordion;

interface TableHeadersProps {
  headers: string[];
}
const TableHeaders = ({ headers }: TableHeadersProps) => {
  return (
    <View className="flex-row border-b border-neutral-400 pb-2">
      {headers?.map((header, index) => {
        return (
          <Text
            key={index + header}
            className={`font-geistSemiBold text-base flex-1 ${
              index === 0 ? "text-left" : "text-right"
            } `}
          >
            {header}
          </Text>
        );
      })}
    </View>
  );
};

interface TableRows<
  T extends ManifestWithCompanyName | ManifestWithAssignedVehicleRegistration
> {
  rowKeys: [keyof T, keyof T];
  rows: T[];
}
const TableRows = <
  T extends ManifestWithCompanyName | ManifestWithAssignedVehicleRegistration
>({
  rows,
  rowKeys,
}: TableRows<T>) => {
  return (
    <>
      {rows.map((row, index) => (
        <View
          key={row?.manifestId ?? index}
          className={`flex-row items-center py-2 ${
            index === rows.length - 1 ? "" : "border-b border-neutral-300"
          }`}
        >
          <Text className="text-neutral-800 font-geistMedium text-base flex-1 text-left">
            {row[rowKeys[0] as keyof typeof row] as string}
          </Text>
          <Text className="text-neutral-800 font-geistMedium text-base flex-1 text-right">
            {row[rowKeys[1] as keyof typeof row] as string}
          </Text>
        </View>
      ))}
    </>
  );
};
