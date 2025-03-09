import { Manifest, manifests } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { eq, and } from "drizzle-orm";
import { FlashList } from "@shopify/flash-list";

const EditTruckStatus = () => {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const [activeManifests, setActiveManifests] = useState<Manifest[]>([]);
  useEffect(() => {
    fetchActiveManifestsForTruck().then((result) => {
      setActiveManifests(result);
    });
  }, [id]);

  const fetchActiveManifestsForTruck = async () => {
    const result = await drizzleDb
      .select()
      .from(manifests)
      .where(
        and(
          eq(manifests.status, "active"), // Filter by status = "active"
          eq(manifests.assignedTo, Number(id)) // Filter by assignedTo = truckId
        )
      )
      .execute();

    return result;
  };

  console.log("activeManifests", activeManifests?.length, activeManifests);
  return (
    <View className="flex-1 w-full  relative">
      <FlashList
        // stickyHeaderIndices={[0, 7]}
        // ListHeaderComponent={
        //   <View className="bg-blue-500 p-5 ">
        //     <Text className="font-geistMedium text-xl">Header</Text>
        //   </View>
        // }
        className="mb-1"
        data={activeManifests}
        renderItem={({ item }) => {
          return (
            <View>
              <Text>{item?.manifestId}</Text>
            </View>
          );
        }}
        estimatedItemSize={200}
        keyExtractor={(item) => item?.id?.toString()}
        numColumns={1}
      />
    </View>
  );
};

export default EditTruckStatus;
