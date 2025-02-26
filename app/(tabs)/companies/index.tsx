import AddNewButton from "@/components/common/addNewButton";
import CustomSearchBar from "@/components/common/searchBar";
import SkeletonLoader from "@/components/common/skeletonLoader";
import {
  Company,
  companies as company_table,
  Manifest,
  manifests as manifest_table,
} from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { eq, and } from "drizzle-orm";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const Companies = () => {
  const [search, setSearch] = useState("");
  const { id } = useLocalSearchParams();

  const {
    data: companies,
    loading,
    refresh,
  } = useDataFetch<Company>({
    table: company_table,
  });

  console.log("comaapanies", companies);

  if (loading) {
    return (
      <View className="flex-1 w-full h-full  ">
        <FlashList
          data={Array(10).fill(null)}
          renderItem={() => <SkeletonLoader />}
          estimatedItemSize={10}
          keyExtractor={(_, index) => `skeleton-${index}`}
        />
      </View>
    );
  }

  if (companies === null || companies.length === 0) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center">
        <AddNewButton text="Company" route="/companies/new" />

        {/* <CompanySheet refresh={refresh} /> */}
      </View>
    );
  }
  return (
    <View className=" flex-1 w-full h-full">
      <CustomSearchBar search={search} setSearch={setSearch} />
      <AddNewButton text="Company" route="/companies/new" />
      <FlashList
        className="mb-1"
        data={companies?.filter((company) =>
          company?.companyName?.includes(search?.trim())
        )}
        renderItem={({ item }) => <CompanyInfoCard company={item} />}
        estimatedItemSize={500}
        keyExtractor={(company) => company?.id?.toString()}
        numColumns={1}
      />
    </View>
  );
};

export default Companies;

interface CompanyInfoCardProps {
  company: Company;
}

export const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  company,
}) => {
  const { companyName, id } = company;
  const router = useRouter();

  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="bg-white h-auto w-[92.5%] mt-5 rounded-xl p-6 mx-auto"
    >
      <View className="flex-row justify-between items-center">
        <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {companyName}
        </Text>
        <Pressable
          onPress={() => {
            router?.push({
              pathname: `/companies/view/[id]`,
              params: { id: id?.toString() },
            });
          }}
        >
          <Text>
            <Feather name="edit" size={24} color="#1e293b" /> {/* Edit Icon */}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router?.push({
              pathname: `/companies/[id]`,
              params: { id: id?.toString() },
            });
          }}
        >
          <Text>
            <Feather name="edit" size={24} color="#1e293b" /> {/* Edit Icon */}
          </Text>
        </Pressable>
      </View>
      <ActiveManifests companyId={Number(id)} />
    </View>
  );
};

interface ActiveManifestsProps {
  companyId: number;
}

export const ActiveManifests: React.FC<ActiveManifestsProps> = ({
  companyId,
}) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const {
    data: manifests,
    loading,
    refresh,
  } = useDataFetch<Manifest>({
    table: manifest_table,
  });

  const [activeManifests, setActiveManifests] = useState<Manifest[]>([]);
  const fetchFilteredManifests = async () => {
    const results = await drizzleDb
      .select()
      .from(manifest_table)
      .where(
        and(
          eq(manifest_table.companyId, companyId),
          eq(manifest_table.status, "active")
        )
      );
    setActiveManifests(results); // ✅ Now setting state with actual data
  };
  useEffect(() => {
    if (!manifests?.length) {
      refresh();
      return;
    }

    fetchFilteredManifests();
  }, [companyId, manifests?.length]);

  return (
    <Text className="font-geistSemiBold text-lg text-neutral-900">
      Active Manifests: {activeManifests.length}
    </Text>
  );
};
