import AddNewButton from "@/components/common/addNewButton";
import CustomSearchBar from "@/components/common/searchBar";
import { ListComponent } from "@/components/manifest/listComponent";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

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

  if (loading) {
    return (
      <View className="flex-1 w-full h-full  ">
        <Text>Loading...</Text>
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
      <ListComponent
        comapaniesWithActiveManifests={comapaniesWithActiveManifests}
        fetchCompanyWithActiveManifests={fetchCompanyWithActiveManifests}
        search={search}
      />
    </View>
  );
};

export default Companies;
