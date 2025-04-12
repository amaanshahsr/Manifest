import { CompletedManifests } from "@/types";
import { AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { View, Text, RefreshControl } from "react-native";
import { Pressable } from "react-native-gesture-handler";

interface ReportListComponentProps {
  handleDownload: () => Promise<void>;
  completedManifests: CompletedManifests[];
  refreshing: boolean;
  handleRefresh: () => Promise<void>;
}

const ListComponent = ({
  handleDownload,
  completedManifests,
  handleRefresh,
  refreshing,
}: ReportListComponentProps) => {
  return (
    <View className="flex-1 px-4">
      {completedManifests?.length ? (
        <Pressable
          style={{
            gap: 8,
            marginBlock: 10,
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            backgroundColor: "#262626", // neutral-800 ≈ #262626
            justifyContent: "center",
            paddingHorizontal: 16, // px-4 ≈ 16 (Tailwind: 1 unit = 4px)
            paddingVertical: 12, // py-3 ≈ 12
            borderRadius: 8, // rounded-lg ≈ 8
            shadowColor: "#000", // shadow-md (approximation)
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3, // Android shadow
          }}
          onPress={handleDownload}
        >
          <Text className="text-white font-geistSemiBold text-base">
            Export
          </Text>
          <Feather name="download" size={18} color="white" className="mr-2" />
        </Pressable>
      ) : null}
      <FlashList
        ListEmptyComponent={
          <View className="flex items-center justify-center p-6">
            <AntDesign name="inbox" size={40} color="#999" className="mb-3" />
            <Text className="text-lg font-geistMedium text-gray-600 text-center">
              No completed trips for this date.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing} // Pass the refreshing state
            onRefresh={handleRefresh} // Trigger refresh on pull-to-refresh
          />
        }
        data={completedManifests}
        keyExtractor={(item) => item.manifestId.toString()}
        renderItem={({ item }) => (
          <ManifestCard
            truckName={item.registration}
            companyName={item.companyName}
            manifestId={item.manifestId}
          />
        )}
        estimatedItemSize={80}
      />
    </View>
  );
};

export default ListComponent;

interface ManifestCardProps {
  truckName: string;
  companyName: string;
  manifestId: string | number;
}

const ManifestCard = ({
  truckName,
  companyName,
  manifestId,
}: ManifestCardProps) => {
  return (
    <View className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 mb-3">
      {/* Header Row */}
      <View className="flex-row items-center gap-3 mb-3">
        <Text className="text-xl font-geistSemiBold text-neutral-900">
          {truckName}
        </Text>

        <View className="ml-auto bg-zinc-200 px-3 py-1 rounded-full">
          <Text className="text-base font-geistMedium text-neutral-700">
            Manifest No: {manifestId}
          </Text>
        </View>
      </View>

      {/* Company Row */}
      <View className="flex-row items-center gap-1 space-x-2 mt-1">
        <FontAwesome5 name="building" size={16} color="#4B5563" />
        <Text className="text-base font-geistMedium text-neutral-700">
          {companyName}
        </Text>
      </View>
    </View>
  );
};
