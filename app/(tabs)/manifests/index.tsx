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
  const [manifestsWithCompany, setManifestsWithCompany] = useState<
    ManifestWithCompanies[]
  >([]);
  const { fetchManifests, manifests, loading } = useManifestStore();
  useEffect(() => {
    fetchManifests(db);
    fetchManifestsWithCompany().then((result) => {
      setManifestsWithCompany(result);
    });
  }, []);

  const fetchManifestsWithCompany = async () => {
    const result = await drizzleDb
      .select()
      .from(manifest_table)
      .leftJoin(company_table, eq(manifest_table.companyId, company_table.id)) // Join companies table
      .execute();

    return result;
  };

  const formattedResult = manifestsWithCompany?.reduce<{
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
  ).result;

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
        data={formattedResult}
        renderItem={({ item }) => {
          return typeof item === "string" ? (
            <View className="mt-5 bg-stone-300 py-3 flex items-center justify-center rounded-md">
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
