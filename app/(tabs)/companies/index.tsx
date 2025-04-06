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
import { AddTruckButton } from "@/components/truck/addTruckButton";
import { useTruckStore } from "@/store/useTruckStore";

const Companies = () => {
  const [search, setSearch] = useState("");
  const db = useSQLiteContext();

  const {
    loading,
    fetchCompanyWithActiveManifests,
    comapaniesWithActiveManifests,
  } = useCompanyStore();
  const { trucksWithActiveManifests, fetchTrucksWithActiveManifests } =
    useTruckStore();

  const modalRef = useRef<CustomBottomSheetModalRef>(null);
  useEffect(() => {
    fetchCompanyWithActiveManifests(db);
  }, []);

  const handleModalOpen = useCallback((data: CompanyWithActiveManifests) => {
    loadManifestDataIntoModal(data);
  }, []);

  const loadManifestDataIntoModal = (
    data: CompanyWithActiveManifests | null
  ) => {
    if (!trucksWithActiveManifests) {
      fetchTrucksWithActiveManifests(db)?.then(() => {
        loadManifestDataIntoModal(data);
      });
    }

    const truckMap = trucksWithActiveManifests.reduce<GenericRecord>(
      (acc, truck) => {
        acc[truck.id] = truck.registration;
        return acc;
      },
      {}
    );

    const updatedManifests = data?.manifests.map((manifest) => ({
      ...manifest,
      vehicleRegistration: truckMap[manifest.assignedTo || ""] || "",
    }));
    modalRef?.current?.open(updatedManifests);
  };

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
        {/* <AddNewButton text="Company" route="/companies/new" /> */}
      </View>
    );
  }
  return (
    <View className=" flex-1 w-full h-full">
      <PageHeader
        title="Companies"
        headerRightItem={<AddTruckButton route="/companies/new" />}
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
