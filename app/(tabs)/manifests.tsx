import { ManifestBottomSheet } from "@/components/bottomsheet/manifestBottomSheet";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { Company, Manifest, manifests as manifests_table } from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Manifests = () => {
  const [search, setSearch] = useState("");
  const { id } = useLocalSearchParams();
  console.log("ajdnkasjndasdna", id);
  const {
    data: manifests,
    loading,
    refresh,
  } = useDataFetch<Manifest>({
    table: manifests_table,
  });
  if (loading) {
    return (
      <View className="flex-1 w-full h-full  ">
        <FlashList
          data={Array(10).fill(null)}
          renderItem={() => <SkeletonLoader />}
          estimatedItemSize={10}
          keyExtractor={(_, index) => `skeleton-${index}`}
        />
      </View>
    );
  }

  if (manifests === null || manifests.length === 0) {
    return (
      <GestureHandlerRootView>
        <View className="flex-1 w-full h-full items-center justify-center">
          <AddNewButton />
          <ManifestSheet refresh={refresh} />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <View className="flex-1 w-full relative">
      <ManifestSheet refresh={refresh} />

      <FlashList
        className="mb-1"
        data={manifests}
        renderItem={({ item }) => (
          <View className="w-11/12 mx-auto">
            <Text>{item?.manifestId}</Text>
          </View>
        )}
        estimatedItemSize={500}
        keyExtractor={(manifest) => manifest?.id?.toString()}
        numColumns={1}
      />
      <AddNewButton />
    </View>
  );
};

export default Manifests;

const AddNewButton = () => {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        router?.push({
          pathname: "/manifests",
          params: { id: "new" },
        });
      }}
      className="bg-neutral-900 px-3 py-4 rounded-lg w-11/12 mx-auto flex flex-row gap-2 items-center justify-center "
    >
      <Text className="text-white font-geistSemiBold ">Add New Manifest</Text>
      <Ionicons name="add-circle-sharp" size={18} color="white" />
    </Pressable>
  );
};

interface ManifestSheetProps {
  refresh: () => Promise<void>;
}
const ManifestSheet: React.FC<ManifestSheetProps> = ({ refresh }) => {
  const { id } = useLocalSearchParams();
  console.log("localsearchparsms", id);
  return id ? (
    <ManifestBottomSheet refresh={refresh} ManifestId={id as string} />
  ) : null;
};
