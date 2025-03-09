import ManifestSelectableCard from "@/components/cards/manifestSelectableCard";
import { Manifest, manifests, companies as company_table } from "@/db/schema";
import { FlashList } from "@shopify/flash-list";
import { eq, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const AssignTrucks = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const [unassignedManifests, setUnassignedManifests] = useState<
    (
      | string
      | {
          id: number;
          manifestId: number;
          status: "completed" | "active" | "unassigned";
          assignedTo: number | null;
          companyId: number | null;
          createdAt: string;
        }
    )[]
  >([]);

  const { id } = useLocalSearchParams();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // const isFocused = useIsFocused();

  useEffect(() => {
    fetchUnassignedManifestsWithCompany()?.then((result) => {
      const formattedResult = result?.reduce<{
        result: (string | Manifest)[];
        companyPositions: Record<string, number>;
      }>(
        (acc, record) => {
          if (!record?.companies) return acc;

          const { manifests, companies } = record;
          const companyName = companies.companyName;

          // Check if the company exists in the positions map
          if (!(companyName in acc.companyPositions)) {
            acc.result.push(companyName);
            acc.companyPositions[companyName] = acc.result.length - 1;
          }

          // Insert the manifest after the company name
          const companyPosition = acc.companyPositions[companyName];
          acc.result.splice(companyPosition + 1, 0, manifests);

          // Update positions of subsequent companies
          Object.keys(acc.companyPositions).forEach((name) => {
            if (acc.companyPositions[name] > companyPosition) {
              acc.companyPositions[name] += 1;
            }
          });

          return acc;
        },
        { result: [], companyPositions: {} }
      );
      setUnassignedManifests(formattedResult?.result);
      console.log("headerindices", formattedResult?.companyPositions);
    });
  }, []);

  console.log("unassignedmanifeszrts", id);

  const fetchUnassignedManifestsWithCompany = async () => {
    const result = await drizzleDb
      .select()
      .from(manifests)
      .leftJoin(company_table, eq(manifests.companyId, company_table.id)) // Join companies table
      .where(
        and(
          eq(manifests.status, "unassigned") // Filter by status = "Active"
        )
      )
      .execute();

    return result;
  };

  const toggleItemSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prevIds) => prevIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds((prevIds) => [...prevIds, id]);
    }
  };

  const handleSave = async () => {
    const result = await drizzleDb
      .update(manifests)
      .set({
        status: "active",
        assignedTo: Number(id),
      })
      .where(inArray(manifests.manifestId, selectedIds));

    fetchUnassignedManifestsWithCompany()?.then((result) => {
      const formattedResult = result?.reduce<{
        result: (string | Manifest)[];
        companyPositions: Record<string, number>;
      }>(
        (acc, record) => {
          if (!record?.companies) return acc;

          const { manifests, companies } = record;
          const companyName = companies.companyName;

          // Check if the company exists in the positions map
          if (!(companyName in acc.companyPositions)) {
            acc.result.push(companyName);
            acc.companyPositions[companyName] = acc.result.length - 1;
          }

          // Insert the manifest after the company name
          const companyPosition = acc.companyPositions[companyName];
          acc.result.splice(companyPosition + 1, 0, manifests);

          // Update positions of subsequent companies
          Object.keys(acc.companyPositions).forEach((name) => {
            if (acc.companyPositions[name] > companyPosition) {
              acc.companyPositions[name] += 1;
            }
          });

          return acc;
        },
        { result: [], companyPositions: {} }
      );
      setUnassignedManifests(formattedResult?.result);
      console.log("headerindices", formattedResult?.companyPositions);
    });
  };

  return (
    <View className="flex-1 w-full  relative">
      <FlashList
        stickyHeaderIndices={[0, 7]}
        // ListHeaderComponent={
        //   <View className="bg-blue-500 p-5 ">
        //     <Text className="font-geistMedium text-xl">Header</Text>
        //   </View>
        // }
        className="mb-1"
        data={unassignedManifests}
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
