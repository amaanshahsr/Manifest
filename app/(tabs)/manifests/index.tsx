import AddNewButton from "@/components/common/addNewButton";
import ManifestInfoCard from "@/components/cards/manifestInfoCard";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { useManifestStore } from "@/store/useManifestStore";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  SectionList,
  ScrollView,
} from "react-native";
import {
  Company,
  Manifest,
  companies as company_table,
  manifests as manifest_table,
} from "@/db/schema";
import { useCompanyStore } from "@/store/useCompanyStore";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { eq } from "drizzle-orm";
import { ManifestWithCompanies } from "@/types";

const Manifests = () => {
  const [search, setSearch] = useState("");
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const {
    fetchManifests,
    manifests,
    loading,
    manifestsSortedByCompany,
    fetchManifestsSortedByCompany,
  } = useManifestStore();
  useEffect(() => {
    fetchManifests(db);
    fetchManifestsSortedByCompany(db);
  }, []);
  const sortedHeaderIndices = Object?.values(
    manifestsSortedByCompany?.companyPositions
  )?.sort((a, b) => a - b);
  console.log("manifeasdas", sortedHeaderIndices);

  if (loading) {
    return (
      <View className="flex-1 w-full h-full  bg-yellow-200">
        <ActivityIndicator />
      </View>
    );
  }

  if (manifests === null || manifests.length === 0) {
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
            <View className=" bg-stone-300 py-3 flex items-center justify-center rounded-md">
              <Text className="text-2xl font-geistSemiBold text-stone-900 ">
                {item}
              </Text>
            </View>
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
