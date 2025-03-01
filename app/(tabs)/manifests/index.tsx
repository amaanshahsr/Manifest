import AddNewButton from "@/components/common/addNewButton";
import ManifestInfoCard from "@/components/common/manifestInfoCard";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { Company, Manifest, manifests as manifests_table } from "@/db/schema";
import { useManifestStore } from "@/store/useManifestStore";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";

const Manifests = () => {
  const [search, setSearch] = useState("");
  const db = useSQLiteContext();

  const { fetchManifests, manifests, loading } = useManifestStore();
  useEffect(() => {
    fetchManifests(db);
  }, []);

  // for debugging
  // useFocusEffect(
  //   React.useCallback(() => {
  //     fetchManifests();
  //     // Do something when the screen is focused
  //     return () => {
  //       // Do something when the screen is unfocused
  //       // Useful for cleanup functions
  //     };
  //   }, [])
  // );

  if (loading) {
    return (
      <View className="flex-1 w-full h-full  bg-yellow-200">
        <ActivityIndicator />
      </View>
    );
  }

  if (manifests === null || manifests.length === 0) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center">
        <AddNewButton route="/manifests/new" text="Manifest" />
      </View>
    );
  }

  return (
    <View className="flex-1 w-full relative">
      <FlashList
        className="mb-1"
        data={manifests}
        renderItem={({ item }) => (
          // <View>
          //   <Text>{item?.id}</Text>
          // </View>
          <ManifestInfoCard manifest={item} />
        )}
        estimatedItemSize={200}
        keyExtractor={(manifest) => manifest?.id?.toString()}
        numColumns={1}
      />

      <AddNewButton route="/manifests/new" text="Manifest" />
    </View>
  );
};

export default Manifests;
