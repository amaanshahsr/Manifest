import ManifestSelectableCard from "@/components/cards/manifestSelectableCard";
import { Manifest, manifests, companies as company_table } from "@/db/schema";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useManifestStore } from "@/store/useManifestStore";
import { FlashList } from "@shopify/flash-list";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

const AssignTrucks = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const {
    fetchUnassignedManifestsSortedByCompany,
    unassignedManifests,
    loading,
  } = useManifestStore();
  const { fetchCompanyWithActiveManifests } = useCompanyStore();

  const { id } = useLocalSearchParams();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // const isFocused = useIsFocused();

  useEffect(() => {
    fetchUnassignedManifestsSortedByCompany(db);
  }, []);

  const toggleItemSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prevIds) => prevIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds((prevIds) => [...prevIds, id]);
    }
  };

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

      await fetchCompanyWithActiveManifests(db);
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
      <FlashList
        stickyHeaderIndices={sortedHeaderIndices}
        // ListHeaderComponent={
        //   <View className="bg-blue-500 p-5 ">
        //     <Text className="font-geistMedium text-xl">Header</Text>
        //   </View>
        // }
        className="mb-1"
        data={unassignedManifests?.result}
        renderItem={({ item }) => {
          return typeof item === "string" ? (
            <Pressable onPress={handleSave}>
              <View className=" bg-stone-900 py-3 flex items-center justify-center rounded-sm">
                <Text className="text-2xl font-geistSemiBold text-neutral-200 ">
                  {item}
                </Text>
              </View>
            </Pressable>
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
        numColumns={1}
        extraData={selectedIds}
      />
    </View>
  );
};

export default AssignTrucks;
