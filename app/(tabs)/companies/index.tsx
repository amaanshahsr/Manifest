import { CompanyInfoCard } from "@/components/cards/companyInfoCard";
import AddNewButton from "@/components/common/addNewButton";
import CustomSearchBar from "@/components/common/searchBar";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { useCompanyStore } from "@/store/useCompanyStore";
import { FlashList } from "@shopify/flash-list";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { useIsFocused } from "@react-navigation/native";

const Companies = () => {
  const [search, setSearch] = useState("");
  const db = useSQLiteContext();
  const {
    loading,
    fetchCompanyWithActiveManifests,
    comapaniesWithActiveManifests,
  } = useCompanyStore();

  useEffect(() => {
    fetchCompanyWithActiveManifests(db);
  }, []);

  // console.log("comapaniesWithActiveManifests", comapaniesWithActiveManifests);
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

  if (
    comapaniesWithActiveManifests === null ||
    comapaniesWithActiveManifests.length === 0
  ) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center">
        <AddNewButton text="Company" route="/companies/new" />
      </View>
    );
  }
  return (
    <View className=" flex-1 w-full h-full">
      <CustomSearchBar search={search} setSearch={setSearch} />
      <AddNewButton text="Company" route="/companies/new" />
      <FlashList
        className="mb-1"
        data={comapaniesWithActiveManifests?.filter((company) =>
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
