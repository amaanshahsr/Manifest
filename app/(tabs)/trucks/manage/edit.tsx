import { Manifest, manifests } from "@/db/schema";
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
import { ManifestStatus } from "@/types";

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
  const markManifestCompleted = async () => {
    try {
      // Extract manifest IDs from activeManifests
      const manifestIds = activeManifests?.map((record) => record?.manifestId);

      // Update the status and assignedTo fields for the selected manifests
      const result = await drizzleDb
        .update(manifests)
        .set({
          status: "completed",
          assignedTo: null,
        })
        .where(inArray(manifests.manifestId, manifestIds))
        .execute();

      console.log("Manifests marked as completed:", result, manifestIds);

      // Fetch the updated list of active manifests
      const updatedManifests = await fetchActiveManifestsForTruck();
      setActiveManifests(updatedManifests);
    } catch (error) {
      console.error("Failed to mark manifests as completed:", error);
      // Handle the error
    }
  };

  // const bottomSheetRef = useRef<BottomSheet>(null);
  // const title = "Passing my data 🔥";

  // const handleClosePress = () => bottomSheetRef.current?.close();
  // const handleOpenPress = () => {
  //   console.log("bottomsadsasd", bottomSheetRef?.current);
  //   bottomSheetRef.current?.expand();
  // };

  if (activeManifests?.length === 0) {
    return (
      <View>
        <Text>No Active manifests found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 w-full  relative">
      <Pressable
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
      </Pressable>
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
            <View className="bg-white rounded-xl p-4 my-2">
              <Text className="text-lg font-geistSemiBold text-neutral-900">
                Manifest ID: {item?.manifestId}
              </Text>
              <Text className="text-sm text-neutral-500">Status</Text>
              <StatusToggle status={item?.status} />
            </View>
          );
        }}
        estimatedItemSize={200}
        keyExtractor={(item) => item?.id?.toString()}
        numColumns={1}
      />
      {/* <CustomBottomSheet title={title} ref={bottomSheetRef} /> */}

      {/* <BottomSheet
        animateOnMount
        index={-1}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
      >
        <BottomSheetView className="flex-1 items-center  h-[50vw] ">
          <ManifestForm />
        </BottomSheetView>
      </BottomSheet> */}
    </View>
  );
};

export default EditTruckStatus;

interface StatusToggleProps {
  status: ManifestStatus;
}

export const StatusToggle = ({ status }: StatusToggleProps) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  return (
    <View className="flex flex-row flex-wrap gap-3 mt-2">
      {manifestStatus.map((status) => (
        <Pressable
          key={status}
          className={`flex flex-row items-center px-4 py-2 border rounded-full gap-2 transition-all ${
            status === currentStatus
              ? "bg-stone-800 border-stone-800 "
              : "border-stone-400"
          }`}
        >
          {status === "completed" ? (
            <MaterialCommunityIcons
              name="checkbox-marked-circle"
              size={18}
              color={status === currentStatus ? "#fff" : "#1e293b"}
            />
          ) : (
            <View
              className={`w-2 h-2 rounded-full ${
                status === "active" ? "bg-green-500" : "bg-blue-500"
              }`}
            ></View>
          )}

          <Text
            className={`text-base font-geistMedium ${
              status === currentStatus ? "text-white" : "text-neutral-700"
            }`}
          >
            {capitalizeWord(status)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
