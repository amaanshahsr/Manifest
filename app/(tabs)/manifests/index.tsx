import AddNewButton from "@/components/common/addNewButton";
import ManifestInfoCard from "@/components/common/manifestInfoCard";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { Company, Manifest, manifests as manifests_table } from "@/db/schema";
import { useManifestStore } from "@/store/useManifestStore";
import { FlashList } from "@shopify/flash-list";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Button } from "react-native";
import { DebugInstructions } from "react-native/Libraries/NewAppScreen";

const Manifests = () => {
  const [search, setSearch] = useState("");
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const { fetchManifests, manifests, loading } = useManifestStore();

  useEffect(() => {
    fetchManifests(db);
  }, []);

  console.log("manifestssss", manifests);

  const checkedItemsRef = useRef<string[]>([]);

  const printData = async () => {
    const transformedIds = checkedItemsRef.current.map((id) => Number(id));
    try {
      if (transformedIds.length === 0) {
        console.warn("No valid IDs to update.");
        return; // Exit early if there's nothing to update
      }

      // Perform the update
      await drizzleDb
        .update(manifests_table)
        .set({ companyId: 6, status: "active" })
        .where(inArray(manifests_table.manifestId, transformedIds));

      console.log(`Updated ${transformedIds.length} rows successfully.`);

      // Clear the checked items AFTER fetchManifests to avoid race conditions
      await fetchManifests(db);
      checkedItemsRef.current = [];
    } catch (error) {
      console.error("Failed to update manifests:", error);
    }
  };
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
          <ManifestInfoCard manifest={item} checkedItemsRef={checkedItemsRef} />
        )}
        estimatedItemSize={200}
        keyExtractor={(manifest) => manifest?.id?.toString()}
        numColumns={1}
      />
      <Button title="Print Data" onPress={printData} />
      <AddNewButton route="/manifests/new" text="Manifest" />
    </View>
  );
};

export default Manifests;
