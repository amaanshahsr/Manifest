import ManifestSelectableCard from "@/components/cards/manifestSelectableCard";
import NoResultsFound from "@/components/common/noResultsFound";
import { AssignStickyHeader } from "@/components/truck/assignStickyHeader";
import { manifests, companies as company_table } from "@/db/schema";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useManifestStore } from "@/store/useManifestStore";
import { useTruckStore } from "@/store/useTruckStore";
import { MaterialIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Button, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const AssignTrucks = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const { fetchUnassignedManifestsSortedByCompany, unassignedManifests } =
    useManifestStore();
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

  const [loading, setLoading] = useState(false); // Add this to your component state
  const [step, setStep] = useState<ButtonStatus>("Assign");

  const handleSave = async () => {
    try {
      setLoading(true);
      setStep("updating");

      // Step 1: Update manifests in the DB
      await drizzleDb
        .update(manifests)
        .set({
          status: "active",
          assignedTo: Number(id),
        })
        .where(inArray(manifests.manifestId, selectedIds));

      setStep("fetchingUnassigned");

      // Step 2: Refetch updated unassigned manifests
      await fetchUnassignedManifestsSortedByCompany(db);

      setStep("fetchingCompanies");

      // Step 3: Refetch company manifest info
      await fetchCompanyWithActiveManifests(db);

      setStep("fetchingTrucks");

      // Step 4: Refetch truck manifest info
      await fetchTrucksWithActiveManifests(db);
    } catch (error) {
      console.error("Error updating manifests:", error);
    } finally {
      setStep("Assign");
      setLoading(false);
      setSelectedIds([]);
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
      <AssignButton
        save={handleSave}
        text={step}
        visible={selectedIds.length > 0}
      />

      <FlashList
        stickyHeaderIndices={sortedHeaderIndices}
        className="mb-1"
        ListEmptyComponent={
          <NoResultsFound text="No Unassigned Manifests found." />
        }
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

export type ButtonStatus =
  | "Assign"
  | "updating"
  | "fetchingUnassigned"
  | "fetchingCompanies"
  | "fetchingTrucks";

interface AssignButtonProps {
  text: ButtonStatus;
  save: () => void;
  visible: boolean;
}

// const translateY = useSharedValue(100); // start off screen
// const opacity = useSharedValue(0);
const AssignButton = ({ save, text, visible }: AssignButtonProps) => {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 100, { duration: 200 });
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 6,
          },
          shadowOpacity: 0.37,
          shadowRadius: 7.49,

          elevation: 12,
        },
      ]}
      className="absolute bottom-1 w-full z-[9999] "
    >
      <Pressable
        onPress={() => save()}
        className={` bg-neutral-800 w-full z-[9999] rounded-lg p-4 flex flex-row justify-center items-center gap-2`}
      >
        <Text className="font-geistMedium text-white ">{`${
          text === "Assign" ? "Assign" : text
        }`}</Text>

        <MaterialIcons name="assignment-add" size={24} color="white" />
      </Pressable>
    </Animated.View>
  );
};
