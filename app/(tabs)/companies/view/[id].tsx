import ManifestInfoCard from "@/components/common/manifestInfoCard";
import { Manifest, manifests as manifests_table } from "@/db/schema";
import { useManifestStore } from "@/store/useManifestStore";
import { FlashList } from "@shopify/flash-list";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button } from "react-native";

const ViewCompany = () => {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();

  const { manifests, fetchManifests } = useManifestStore();

  const [assignedManifests, setAssignedManifests] = useState<Manifest[]>([]);
  const checkedItemsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!manifests?.length) {
      //   fetchManifests();
      return; // Early return to prevent unnecessary filtering
    }

    const manifestList = manifests.filter(
      (manifest) => manifest.companyId === Number(id)
    );
    setAssignedManifests(manifestList);
  }, [id]);

  const printData = async () => {
    const drizzleDb = drizzle(db);

    const transformedIds = checkedItemsRef.current.map((id) => Number(id));
    try {
      if (transformedIds.length === 0) {
        console.warn("No valid IDs to update.");
        return; // Exit early if there's nothing to update
      }

      // Perform the update
      await drizzleDb
        .update(manifests_table)
        .set({ companyId: Number(id), status: "completed" })
        .where(inArray(manifests_table.manifestId, transformedIds))
        .then(() => {
          //   fetchManifests();
        });

      console.log(`Updated ${transformedIds.length} rows successfully.`);

      // Clear the checked items AFTER fetchManifests to avoid race conditions
      checkedItemsRef.current = [];
    } catch (error) {
      console.error("Failed to update manifests:", error);
    }
  };
  console.log("assignedManifests", assignedManifests);

  return (
    <View className="flex-1 w-full relative">
      <FlashList
        className="mb-1"
        data={assignedManifests}
        renderItem={({ item }) => (
          <ManifestInfoCard manifest={item} checkedItemsRef={checkedItemsRef} />
        )}
        estimatedItemSize={100}
        keyExtractor={(manifest) => manifest?.id?.toString()}
        numColumns={1}
      />
      <Button title="Print Data" onPress={printData} />
    </View>
  );
};

export default ViewCompany;
