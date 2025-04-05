import AddNewButton from "@/components/common/addNewButton";
import ManifestInfoCard from "@/components/cards/manifestInfoCard";
import { useManifestStore } from "@/store/useManifestStore";
import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import StickyHeader from "@/components/manifest/stickyHeader";

import { Manifest } from "@/db/schema";
import { ManifestStatus } from "@/types";
import CustomModal from "@/components/common/customModal";
import { Pressable } from "react-native-gesture-handler";

const Manifests = () => {
  const db = useSQLiteContext();

  const { loading, manifestsSortedByCompany, fetchManifestsSortedByCompany } =
    useManifestStore();

  const [
    filteredManifestsSortedByCompany,
    setFilteredmanifestsSortedByCompany,
  ] = useState<(string | Manifest)[]>([]);
  useEffect(() => {
    fetchManifestsSortedByCompany(db);
  }, []);

  useEffect(() => {
    setFilteredmanifestsSortedByCompany(manifestsSortedByCompany?.result);
  }, [manifestsSortedByCompany?.result]);

  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true); // Start refreshing
    fetchManifestsSortedByCompany(db);
    setRefreshing(false); // Stop refreshing
  };

  const [isVisible, setisVisible] = useState(false);

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [status, setStatus] = useState<ManifestStatus[]>([]);

  const companies = manifestsSortedByCompany?.result.filter(
    (row) => typeof row === "string"
  );

  const statuses: ManifestStatus[] = ["active", "unassigned", "completed"];
  type ReducedObject = { [k: string]: Manifest[] };

  const handleFiltered = () => {
    let currentCompanyName = "";
    const transformedResult =
      manifestsSortedByCompany?.result?.reduce<ReducedObject>((acc, record) => {
        const isCompanyName = typeof record === "string";

        if (isCompanyName) {
          acc[record as string] = [];
          currentCompanyName = record;
        }
        if (!isCompanyName) {
          acc[currentCompanyName]?.push(record);
        }

        return acc;
      }, {});
    for (let i = 0; i < selectedCompanies.length; i++) {
      const key = selectedCompanies[i];
      delete transformedResult[key];
    }
    // Convert the object into  array format
    const resultArray = Object.entries(transformedResult).flatMap(
      ([companyName, manifests]) => [
        companyName, // Add the company name
        ...manifests, // Add all the manifests for this company
      ]
    );

    const finalArray = resultArray.filter((record) => {
      // Skip if the record is a string (company name)
      if (typeof record === "string") return true;

      // Filter manifests based on their status
      return !status.includes(record.status);
    });

    console.log("finalArray", finalArray);

    setFilteredmanifestsSortedByCompany(finalArray);
    setisVisible(false);
  };

  // console.log("manifestss", manifestsSortedByCompany);

  // if (loading) {
  //   return (
  //     <View className="flex-1 w-full h-full  bg-yellow-200">
  //       <ActivityIndicator />
  //     </View>
  //   );
  // }

  if (
    manifestsSortedByCompany?.result === null ||
    manifestsSortedByCompany?.result.length === 0
  ) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center">
        <AddNewButton route="/manifests/new" text="Manifest" />
      </View>
    );
  }

  return loading ? (
    <ActivityIndicator />
  ) : (
    <View className="flex-1 w-full relative ">
      <AddNewButton route="/manifests/new" text="Manifest" />
      <View>
        <CustomModal
          snapPoint="75%"
          visible={isVisible}
          onClose={() => setisVisible(false)}
        >
          <View className="flex-1 items-center z-50 px-5 py-6 bg-white rounded-t-3xl shadow-lg">
            {/* Header */}
            <View className="flex flex-row justify-between items-center w-full mb-4">
              <Text className="font-geistSemiBold text-2xl text-gray-900">
                Filters
              </Text>
              <Pressable onPress={() => setisVisible(false)}>
                <AntDesign name="closecircle" size={24} color="black" />
              </Pressable>
            </View>

            {/* Companies Filter */}
            <View className="w-full bg-gray-100 rounded-lg p-4 shadow-sm">
              <Text className="font-geistMedium text-lg text-gray-800 mb-3">
                Companies
              </Text>
              <View className="flex flex-row flex-wrap gap-2">
                {companies?.map((company) => (
                  <Pressable
                    key={company}
                    onPress={() => {
                      setSelectedCompanies((old) =>
                        old?.includes(company)
                          ? old.filter((comp) => company !== comp)
                          : [...old, company]
                      );
                    }}
                  >
                    <View
                      className={`border px-4 py-2 rounded-full ${
                        !selectedCompanies?.includes(company)
                          ? "bg-black text-white"
                          : "border-gray-500"
                      }`}
                    >
                      <Text
                        className={`text-base font-geistRegular ${
                          !selectedCompanies?.includes(company)
                            ? "text-white"
                            : "text-black"
                        }`}
                      >
                        {company}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View className="w-full bg-gray-100 rounded-lg p-4 shadow-sm mt-5">
              <Text className="font-geistMedium text-lg text-gray-800 mb-3">
                Status
              </Text>
              <View className="flex flex-row flex-wrap gap-2">
                {statuses?.map((stat, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setStatus((old) =>
                        old?.includes(stat)
                          ? old.filter((comp) => stat !== comp)
                          : [...old, stat]
                      );
                    }}
                  >
                    <View
                      className={`border px-4 py-2 rounded-full ${
                        !status?.includes(stat)
                          ? "bg-black text-white"
                          : "border-gray-500"
                      }`}
                    >
                      <Text
                        className={`text-base font-geistRegular ${
                          !status?.includes(stat) ? "text-white" : "text-black"
                        }`}
                      >
                        {stat}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Footer Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                position: "absolute",
                bottom: 25,
              }}
            >
              {/* Cancel Button */}
              <Pressable
                onPress={() => setisVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#E5E5E5",
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <Text
                  className="font-geistMedium"
                  style={{ fontSize: 18, color: "#333", fontWeight: "500" }}
                >
                  Cancel
                </Text>
              </Pressable>

              {/* Apply Button */}
              <Pressable
                onPress={handleFiltered}
                style={{
                  flex: 1,
                  backgroundColor: "#000",
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  className="font-geistMedium"
                  style={{
                    fontSize: 18,
                    color: "#FFF",
                    fontWeight: "500",
                  }}
                >
                  Apply
                </Text>
              </Pressable>
            </View>
          </View>
        </CustomModal>
      </View>
      <FlashList
        // stickyHeaderIndices={manifestsSortedByCompany?.companyPositions?.map((item)=>item?.)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        className="mb-1"
        ListEmptyComponent={
          <View className=" flex-1 items-center justify-center  p-5 bg-red-500">
            <AntDesign
              name="folderopen"
              size={40}
              color="#999"
              className="mb-2"
            />
            <Text className="text-lg font-medium text-gray-500 text-center">
              No manifests found based on active filters.
            </Text>
          </View>
        }
        data={filteredManifestsSortedByCompany}
        renderItem={({ item }) => {
          return typeof item === "string" ? (
            <StickyHeader
              title={item}
              onFilterPress={() => setisVisible(true)}
            />
          ) : (
            <ManifestInfoCard manifest={item} />
          );
        }}
        estimatedItemSize={1000}
        keyExtractor={(item) =>
          typeof item === "string" ? item : item?.id?.toString()
        }
      />
    </View>
  );
};

export default Manifests;
