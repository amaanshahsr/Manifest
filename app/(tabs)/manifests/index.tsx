import AddNewButton from "@/components/common/addNewButton";
import ManifestInfoCard from "@/components/cards/manifestInfoCard";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { useManifestStore } from "@/store/useManifestStore";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import StickyHeader from "@/components/manifest/stickyHeader";

const Manifests = () => {
  const db = useSQLiteContext();

  const { loading, manifestsSortedByCompany, fetchManifestsSortedByCompany } =
    useManifestStore();

  useEffect(() => {
    fetchManifestsSortedByCompany(db);
  }, []);

  // `sortedHeaderIndices` is used in FlatList to render sticky headers at the correct positions
  const sortedHeaderIndices = useMemo(() => {
    return Object?.values(
      manifestsSortedByCompany?.companyPositions || {}
    )?.sort((a, b) => a - b);
  }, [manifestsSortedByCompany]);

  if (loading) {
    return (
      <View className="flex-1 w-full h-full  bg-yellow-200">
        <ActivityIndicator />
      </View>
    );
  }

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

  return (
    <View className="flex-1 w-full relative">
      <FlashList
        className="mb-1"
        stickyHeaderIndices={sortedHeaderIndices}
        data={manifestsSortedByCompany?.result}
        renderItem={({ item }) => {
          return typeof item === "string" ? (
            <StickyHeader title={item} />
          ) : (
            <ManifestInfoCard manifest={item} />
          );
        }}
        estimatedItemSize={200}
        keyExtractor={(item) =>
          typeof item === "string" ? item : item?.id?.toString()
        }
        numColumns={1}
      />
      <AddNewButton route="/manifests/new" text="Manifest" />
    </View>
  );
};

export default Manifests;
