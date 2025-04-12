import { ManifestCard } from "@/components/cards/manifestInfoCard";
import { useManifestStore } from "@/store/useManifestStore";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ActivityIndicator, RefreshControl } from "react-native";
import StickyHeader from "@/components/manifest/stickyHeader";

import { Manifest } from "@/db/schema";
import { ManifestStatus } from "@/types";
import CustomModal, { ModalRef } from "@/components/common/customModal";
import { Pressable } from "react-native-gesture-handler";
import PageHeader from "@/components/common/pageHeader";
import { AddNewButton } from "@/components/truck/addNewButton";
import CustomSearchBar from "@/components/common/searchBar";
import NoResultsFound from "@/components/common/noResultsFound";

const Manifests = () => {
  const db = useSQLiteContext();

  const { loading, manifestsSortedByCompany, fetchManifestsSortedByCompany } =
    useManifestStore();

  const [search, setSearch] = useState("");

  const [
    filteredManifestsSortedByCompany,
    setFilteredmanifestsSortedByCompany,
  ] = useState<(string | Manifest)[]>([]);
  useEffect(() => {
    fetchManifestsSortedByCompany(db);
  }, []);

  useEffect(() => {
    // setFilteredmanifestsSortedByCompany(manifestsSortedByCompany?.result);
    handleFiltered();
  }, [manifestsSortedByCompany?.result]);

  // const stickyHeaderIndices = useMemo(() => {
  //   return Object.keys(manifestsSortedByCompany?.companyPositions || {}).map(
  //     (company) => manifestsSortedByCompany.companyPositions[company]
  //   );
  // }, [manifestsSortedByCompany]);

  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true); // Start refreshing
    fetchManifestsSortedByCompany(db);
    setRefreshing(false); // Stop refreshing
  };

  const modalRef = useRef<ModalRef>(null);

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

    // console.log("finalArray", finalArray);

    setFilteredmanifestsSortedByCompany(finalArray);
    modalRef?.current?.close();
  };

  if (
    !manifestsSortedByCompany?.result ||
    manifestsSortedByCompany?.result?.length === 0
  ) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center">
        <NoResultsFound text="No manifests found" />

        <AddNewButton route="/manifests/new" text="Add New Manifest" />
      </View>
    );
  }

  return loading ? (
    <ActivityIndicator />
  ) : (
    <View className="flex-1 w-full relative ">
      <PageHeader
        title="Manifests"
        headerRightItem={<AddNewButton route="/manifests/new" />}
      >
        <View className="flex flex-row mt-5 mb-2 gap-3">
          <CustomSearchBar
            search={search}
            setSearch={setSearch}
            placeholder="Search Manifests"
            toggleFilter={() => modalRef?.current?.open()}
          />
        </View>
      </PageHeader>

      <FlashList
        // stickyHeaderIndices={stickyHeaderIndices}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        className="mb-1"
        ListEmptyComponent={
          <View className="flex-1 my-5">
            <NoResultsFound text="No manifests found matching the active filters." />
          </View>
        }
        data={filteredManifestsSortedByCompany}
        renderItem={({ item }) => {
          return typeof item === "string" ? (
            <StickyHeader title={item} />
          ) : (
            <ManifestCard manifest={item} />
          );
        }}
        contentContainerStyle={{
          paddingTop: 12, // 👈 top space before the first item
          paddingBottom: 24, // 👈 bottom space after the last item (optional)
          paddingHorizontal: 16, // 👈 optional side padding
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        estimatedItemSize={1000}
        keyExtractor={(item) =>
          typeof item === "string" ? item : item?.id?.toString()
        }
      />
      <View>
        <CustomModal
          snapPoint="75%"
          // visible={isVisible}
          ref={modalRef}
          // onClose={() => setisVisible(false)}
        >
          <View className="flex-1 z-50 px-5 pt-6 pb-28 bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-geistSemiBold text-neutral-900">
                Filters
              </Text>
              <Pressable onPress={() => modalRef?.current?.close()}>
                <AntDesign name="closecircle" size={24} color="black" />
              </Pressable>
            </View>

            {/* Companies Filter Section */}
            <View className="w-full bg-neutral-950 rounded-xl p-5 space-y-4">
              <Text className="text-lg font-geistMedium text-white">
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
                        className={`px-4 py-2 rounded-full flex flex-row items-center gap-1 ${
                          isActive
                            ? "bg-white border border-neutral-300"
                            : "bg-neutral-800"
                        }`}
                      >
                        <Text
                          className={`text-sm font-geistMedium ${
                            isActive ? "text-black" : "text-white"
                          }`}
                        >
                          {company}
                        </Text>
                        <Ionicons
                          name="close"
                          size={14}
                          color={isActive ? `black` : "#262626"}
                        />
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
                        setStatus((prev) =>
                          isActive
                            ? prev.filter((s) => s !== stat)
                            : [...prev, stat]
                        )
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
                onPress={() => modalRef?.current?.close()}
                // className="flex-1 bg-neutral-200 py-3 rounded-xl items-center"
              >
                <Text className="text-base font-geistMedium text-neutral-800">
                  Cancel
                </Text>
              </Pressable>

              {/* Apply */}
              <Pressable
                onPress={handleFiltered}
                style={{
                  flex: 1,
                  backgroundColor: "#000000",
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
                // className="flex-1 bg-black py-3 rounded-xl items-center"
              >
                <Text className="text-base font-geistMedium text-white">
                  Apply
                </Text>
              </Pressable>
            </View>
          </View>
        </CustomModal>
      </View>
    </View>
  );
};

export default Manifests;
