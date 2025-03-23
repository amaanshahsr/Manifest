import { companies, Manifest, manifests } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { eq, and, inArray } from "drizzle-orm";
import { FlashList } from "@shopify/flash-list";
import { manifestStatus } from "@/constants";
import { capitalizeWord } from "@/utils/utils";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ManifestStatus, ManifestWithCompanyName } from "@/types";
import { useTruckStore } from "@/store/useTruckStore";
import EditTruckCard from "@/components/cards/editTruckCard";

const EditTruckStatus = () => {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const { fetchTrucksWithActiveManifests } = useTruckStore();
  const [activeManifests, setActiveManifests] = useState<
    ManifestWithCompanyName[]
  >([]);
  useEffect(() => {
    fetchActiveManifestsForTruck().then((result) => {
      setActiveManifests(result);
    });
  }, [id]);

  const fetchActiveManifestsForTruck = async () => {
    const result = await drizzleDb
      .select({
        manifest: {
          id: manifests.id,
          manifestId: manifests?.manifestId,
          status: manifests.status,
          assignedTo: manifests.assignedTo,
          companyId: manifests.companyId,
          createdAt: manifests?.createdAt,
          companyName: companies.companyName, // Add companyName from the companies table
        },
      })
      .from(manifests)
      .leftJoin(companies, eq(manifests.companyId, companies.id)) // Join with the company table
      .where(
        and(
          eq(manifests.status, "active"), // Filter by status = "active"
          eq(manifests.assignedTo, Number(id)) // Filter by assignedTo = truckId
        )
      )
      .execute();

    return result.map((item) => item?.manifest);
  };
  const markAsCompleted = async (id?: number) => {
    try {
      // Extract manifest IDs from activeManifests
      const manifestIds = id
        ? [id]
        : activeManifests?.map((record) => record?.manifestId);

      const date = new Date(); // Current date and time

      // Update the status and assignedTo fields for the selected manifests
      const result = await drizzleDb
        .update(manifests)
        .set({
          status: "completed",
          completedOn: date,
        })
        .where(inArray(manifests.manifestId, manifestIds))
        .execute();

      console.log("Manifests marked as completed:", result, manifestIds);

      // Fetch the updated list of active manifests
      const updatedManifests = await fetchActiveManifestsForTruck();
      await fetchTrucksWithActiveManifests(db);
      setActiveManifests(updatedManifests);
      alert(`Manifest COmpleted with id :${id}`);
    } catch (error) {
      console.error("Failed to mark manifests as completed:", error);
      // Handle the error
    }
  };

  if (activeManifests?.length === 0) {
    return (
      <View>
        <Text>No Active manifests found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 w-full  relative">
      {/* <Pressable
        onPress={() => {
          markManifestCompleted();
        }}
        className="flex flex-row  justify-center bg-stone-950 mt-3 p-3 gap-2 rounded-lg"
      >
        <Text className="text-white font-geistSemiBold text-base">Save</Text>
        <Feather name="arrow-right" size={20} color="white" />
      </Pressable>
      <Pressable>
        <Ionicons name="filter-circle-sharp" size={40} color="black" />
      </Pressable> */}
      <FlashList
        className="mb-1"
        data={activeManifests}
        renderItem={({ item }) => {
          return <EditTruckCard saveFn={markAsCompleted} manifest={item} />;
        }}
        estimatedItemSize={25}
        keyExtractor={(item) => item?.id?.toString()}
      />
    </View>
  );
};

export default EditTruckStatus;

interface StatusToggleProps {
  status: ManifestStatus;
}
