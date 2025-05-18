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
import FilterModal from "@/components/manifest/filterModal";

const Manifests = () => {
  const db = useSQLiteContext();

  const { loading, manifestsSortedByCompany, fetchManifestsSortedByCompany } =
    useManifestStore();

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchManifestsSortedByCompany(db);
  }, []);

  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true); // Start refreshing
    fetchManifestsSortedByCompany(db);
    setRefreshing(false); // Stop refreshing
  };

  const modalRef = useRef<ModalRef>(null);

  const handleFiltered = async (
    statuses: ManifestStatus[],
    selectedCompanies: string[]
  ) => {
    await fetchManifestsSortedByCompany(db, statuses, selectedCompanies);
    modalRef?.current?.close();
  };

  // Inside your component
  const selectedCompanies = useMemo(() => {
    return (
      manifestsSortedByCompany?.result.filter(
        (row) => typeof row === "string"
      ) || []
    );
  }, [manifestsSortedByCompany?.result]);

  const uniqueStatuses = useMemo(() => {
    const getUniqueStatuses = (
      data: Array<string | { status: string }>
    ): string[] => {
      const statusSet = new Set<string>();

      data.forEach((item) => {
        if (typeof item === "object" && item !== null && "status" in item) {
          statusSet.add(item.status);
        }
      });

      return Array.from(statusSet);
    };

    return getUniqueStatuses(manifestsSortedByCompany?.result || []);
  }, [manifestsSortedByCompany?.result]);

  console.log("asjndkajnsldnsa", manifestsSortedByCompany);
  // if (
  //   !manifestsSortedByCompany?.result ||
  //   manifestsSortedByCompany?.result?.length === 0
  // ) {
  //   return (
  //     <View className="flex-1 w-full h-full items-center justify-center">
  //       <NoResultsFound text="No manifests found" />

  //       <AddNewButton route="/manifests/new" text="Add New Manifest" />
  //     </View>
  //   );
  // }

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
        data={manifestsSortedByCompany?.result}
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
      <CustomModal ref={modalRef}>
        <FilterModal
          initialStatus={uniqueStatuses as ManifestStatus[]}
          initialCompanies={selectedCompanies}
          handleFiltered={handleFiltered}
          closeFn={() => modalRef?.current?.close()}
        />
      </CustomModal>
    </View>
  );
};

export default Manifests;
