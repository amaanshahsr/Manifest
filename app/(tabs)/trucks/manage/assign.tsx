import ManifestSelectableCard from "@/components/cards/manifestSelectableCard";
import { AssignStickyHeader } from "@/components/truck/assignStickyHeader";
import { manifests, companies as company_table } from "@/db/schema";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useManifestStore } from "@/store/useManifestStore";
import { useTruckStore } from "@/store/useTruckStore";
import { FlashList } from "@shopify/flash-list";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Button } from "react-native";

const AssignTrucks = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const {
    fetchUnassignedManifestsSortedByCompany,
    unassignedManifests,
    loading,
  } = useManifestStore();
  const { fetchCompanyWithActiveManifests } = useCompanyStore();
  const { fetchTrucksWithActiveManifests } = useTruckStore();

  const { id } = useLocalSearchParams();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchUnassignedManifestsSortedByCompany(db);
  }, []);
  const toggleItemSelect = (
    ids: number | number[],
    action: "select" | "remove"
  ) => {
    setSelectedIds((prevIds) => {
      // Convert single ID to an array for uniform handling
      const idsArray = Array.isArray(ids) ? ids : [ids];

      // Create a Set from the current selected IDs for efficient lookups
      const selectedIdsSet = new Set(prevIds);

      // Toggle each ID in the input array
      idsArray.forEach((id) => {
        switch (action) {
          case "remove":
            selectedIdsSet.delete(id);
            break;
          case "select":
            selectedIdsSet.add(id);
            break;
          default:
            break;
        }
      });

      // Convert the Set back to an array and return
      return Array.from(selectedIdsSet);
    });
  };
  console.log("selectedIdsOutside", selectedIds);

  const handleSave = async () => {
    try {
      // Attempt to update the manifests in the database
      const result = await drizzleDb
        .update(manifests)
        .set({
          status: "active", // Set the status to "active"
          assignedTo: Number(id), // Assign the manifest to the user with the specified ID
        })
        .where(inArray(manifests.manifestId, selectedIds)); // Only update manifests with IDs in the selectedIds array

      // Fetch the updated list of unassigned manifests sorted by company
      await fetchUnassignedManifestsSortedByCompany(db);
      fetchCompanyWithActiveManifests(db);
      fetchTrucksWithActiveManifests(db);
    } catch (error) {
      // Handle any errors that occur during the update or fetch process
      console.error("Error updating manifests:", error);
    }
  };

  // Extract and sort company position indices for sticky headers in FlashList
  const sortedHeaderIndices = Object.values(
    unassignedManifests?.companyPositions // Get company positions from manifests
  ).sort((a, b) => a - b); // Sort indices in ascending order for proper header placement

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View className="flex-1 w-full  relative">
      {selectedIds?.length ? (
        <Button title="Hello World" onPress={handleSave} />
      ) : null}
      <FlashList
        stickyHeaderIndices={sortedHeaderIndices}
        className="mb-1"
        data={unassignedManifests?.result}
        renderItem={({ item, index }) => {
          return typeof item === "string" ? (
            <AssignStickyHeader
              position={index}
              item={item}
              manifestList={unassignedManifests}
              toggleItemSelect={toggleItemSelect}
            />
          ) : (
            <ManifestSelectableCard
              manifest={item}
              selectedIds={selectedIds}
              handleSelect={toggleItemSelect}
            />
          );
        }}
        estimatedItemSize={200}
        keyExtractor={(item) =>
          typeof item === "string" ? item : item?.id?.toString()
        }
        extraData={selectedIds}
      />
    </View>
  );
};

export default AssignTrucks;
