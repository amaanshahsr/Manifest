import { manifests } from "@/db/schema";
import { ManifestWithCompanyName } from "@/types";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, View, Text, LayoutChangeEvent } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";

interface AccordionProps {
  expanded: boolean;
  manifests: ManifestWithCompanyName[];
}

const Accordion = ({ expanded, manifests }: AccordionProps) => {
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
        {/* Table Header */}
        <View className="flex-row border-b border-neutral-400 pb-2">
          <Text className="font-geistSemiBold text-base flex-1 text-left">
            Manifest No.
          </Text>
          <Text className="font-geistSemiBold text-base flex-1 text-right">
            Company Name
          </Text>
        </View>
        {/* Table Rows */}
        {manifests.map((manifest, index) => (
          <View
            key={manifest?.manifestId ?? index}
            className={`flex-row items-center py-2 ${
              index === manifests.length - 1
                ? ""
                : "border-b border-neutral-300"
            }`}
          >
            <Text className="text-neutral-800 font-geistMedium text-base flex-1 text-left">
              {manifest?.manifestId}
            </Text>
            <Text className="text-neutral-800 font-geistMedium text-base flex-1 text-right">
              {manifest?.companyName}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

export default Accordion;
