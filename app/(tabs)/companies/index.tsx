import CustomModal, { ModalRef } from "@/components/common/customModal";
import CustomBottomSheetModal, {
  CustomBottomSheetModalRef,
} from "@/components/common/bottomSheetModal";
import CustomSearchBar from "@/components/common/searchBar";
import { ListComponent } from "@/components/manifest/listComponent";
import { useCompanyStore } from "@/store/useCompanyStore";
import { CompanyWithActiveManifests, GenericRecord } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import PageHeader from "@/components/common/pageHeader";
import { AddNewButton } from "@/components/truck/addNewButton";
import NoResultsFound from "@/components/common/noResultsFound";
import { useIsFocused } from "@react-navigation/native";

const Companies = () => {
  const [search, setSearch] = useState("");
  const db = useSQLiteContext();

  const {
    loading,
    fetchCompanyWithActiveManifests,
    comapaniesWithActiveManifests,
  } = useCompanyStore();

  const modalRef = useRef<CustomBottomSheetModalRef>(null);

  // const isFocused = useIsFocused();
  useEffect(() => {
    fetchCompanyWithActiveManifests(db);
  }, []);
  console.log("ascnjansdkjasda", comapaniesWithActiveManifests[0]?.manifests);

  const handleModalOpen = useCallback((data: CompanyWithActiveManifests) => {
    modalRef?.current?.open(data?.manifests);
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
    comapaniesWithActiveManifests?.length === 0
  ) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center">
        <NoResultsFound text="No Companies found" />
        <AddNewButton route="/companies/new" text="Add New Company" />
      </View>
    );
  }
  return (
    <View className=" flex-1 w-full h-full relative">
      <PageHeader
        title="Companies"
        headerRightItem={<AddNewButton route="/companies/new" />}
      >
        <View className="flex flex-row mt-5 mb-2">
          <CustomSearchBar search={search} setSearch={setSearch} />
        </View>
      </PageHeader>
      <ListComponent
        handleModalOpen={handleModalOpen}
        comapaniesWithActiveManifests={comapaniesWithActiveManifests}
        fetchCompanyWithActiveManifests={fetchCompanyWithActiveManifests}
        search={search}
      />
      <CustomBottomSheetModal ref={modalRef} />
    </View>
  );
};

export default Companies;
