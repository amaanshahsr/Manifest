import { Manifest, manifests, companies as companyTable } from "@/db/schema";
import { useManifestStore } from "@/store/useManifestStore";
import { ManifestStatus } from "@/types";
import { AntDesign } from "@expo/vector-icons";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { eq } from "drizzle-orm";

interface FilterModalProps {
  initialStatus: ManifestStatus[];
  initialCompanies: string[];
  closeFn: () => void;
  handleFiltered: (
    selectedStatus: ManifestStatus[],
    selectedCompanies: string[]
  ) => void;
}

const FilterModal = ({
  closeFn,
  handleFiltered,
  initialCompanies,
  initialStatus,
}: FilterModalProps) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const [totalCompanies, setTotalCompanies] = useState<{
    result: (string | Manifest)[];
    companyPositions: Record<string, number>;
  }>();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Fetch data from the database
        const result = await drizzleDb
          .select()
          .from(manifests)
          .leftJoin(companyTable, eq(manifests.companyId, companyTable.id))

          .execute();
        // Pass  the result for formatting used in flashlist

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
        setTotalCompanies(formattedResult);
      } catch (error) {
        // Log the error for debugging
        console.error("Failed to fetch manifests sorted by company:", error);
      } finally {
      }
    };
    fetchCompanies();
    // set({ manifestsSortedByCompany: formattedResult });
  }, []);

  const companies = totalCompanies?.result.filter(
    (row) => typeof row === "string"
  );

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const statuses: ManifestStatus[] = ["active", "unassigned", "completed"];
  const [status, setStatus] = useState<ManifestStatus[]>([]);

  useEffect(() => {
    setSelectedCompanies(initialCompanies);
    setStatus(initialStatus);
  }, [initialCompanies, initialStatus]);

  return (
    <View className="flex-1 z-50 px-5 pt-6 pb-28 bg-white rounded-t-3xl">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-geistSemiBold text-neutral-900">
          Filters
        </Text>
        <Pressable onPress={() => closeFn()}>
          <AntDesign name="closecircle" size={24} color="black" />
        </Pressable>
      </View>

      {/* Companies Filter Section */}
      <View className="w-full bg-neutral-100 rounded-xl p-5 space-y-4">
        <Text className="text-lg font-geistMedium text-neutral-900">
          Companies
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {companies?.map((company) => {
            const isActive = selectedCompanies?.includes(company);
            return (
              <Pressable
                key={company}
                onPress={() =>
                  setSelectedCompanies((prev) =>
                    isActive
                      ? prev.filter((c) => c !== company)
                      : [...prev, company]
                  )
                }
              >
                <View
                  className={`px-4 py-2 rounded-full flex flex-row items-center gap-1
                ${
                  isActive
                    ? "bg-black border border-black"
                    : "bg-white border border-neutral-300"
                }`}
                >
                  <Text
                    className={`text-sm font-geistMedium ${
                      isActive ? "text-white" : "text-black"
                    }`}
                  >
                    {company}
                  </Text>
                  {/* <Ionicons
                name="close"
                size={14}
                color={isActive ? `white` : "#262626"}
              /> */}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Status Filter Section */}
      <View className="w-full bg-neutral-100 rounded-xl p-5 mt-6 space-y-4">
        <Text className="text-lg font-geistMedium text-neutral-900">
          Status
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {statuses?.map((stat, index) => {
            const isActive = status?.includes(stat);
            return (
              <Pressable
                key={index}
                onPress={() =>
                  setStatus((prev) => {
                    const isRemoving = isActive;
                    const isLastItem = prev.length === 1;

                    if (isRemoving && isLastItem) {
                      // Don't allow removing the last status
                      return prev;
                    }

                    return isRemoving
                      ? prev.filter((s) => s !== stat) // remove
                      : [...prev, stat]; // add
                  })
                }
              >
                <View
                  className={`px-4 py-2 rounded-full ${
                    isActive
                      ? "bg-black border border-black"
                      : "bg-white border border-neutral-300"
                  }`}
                >
                  <Text
                    className={`text-sm font-geistMedium ${
                      isActive ? "text-white" : "text-black"
                    }`}
                  >
                    {stat}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Footer Buttons */}
      <View className="absolute bottom-6 left-5 right-5 flex-row gap-3">
        {/* Cancel */}
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "#E5E5E5", // neutral-200
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
          onPress={() => closeFn()}
          // className="flex-1 bg-neutral-200 py-3 rounded-xl items-center"
        >
          <Text className="text-base font-geistMedium text-neutral-800">
            Cancel
          </Text>
        </Pressable>

        {/* Apply */}
        <Pressable
          onPress={() => {
            handleFiltered(status, selectedCompanies);
          }}
          style={{
            flex: 1,
            backgroundColor: "#000000",
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
          // className="flex-1 bg-black py-3 rounded-xl items-center"
        >
          <Text className="text-base font-geistMedium text-white">Apply</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default FilterModal;
