import AddNewButton from "@/components/common/addNewButton";
import CustomModal from "@/components/common/bareBoneModal";
import CustomBottomSheetModal, {
  TestFlashList,
} from "@/components/common/bottomSheetModal";
import CustomSearchBar from "@/components/common/searchBar";
import { ListComponent } from "@/components/manifest/listComponent";
import { useCompanyStore } from "@/store/useCompanyStore";
import {
  CompanyWithActiveManifests,
  ManifestWithAssignedVehicleRegistration,
} from "@/types";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Button, Modal } from "react-native";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";

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

  // const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const actionSheetRef = useRef<ActionSheetRef>(null);

  const handleModalOpen = useCallback((data: CompanyWithActiveManifests) => {
    console.log(
      "nkjndska",
      actionSheetRef?.current?.currentSnapIndex,
      actionSheetRef
    );
    setIsVisible(true);
    actionSheetRef?.current?.show();
    setModal(data);
  }, []);

  const [isVisible, setIsVisible] = useState(false);
  const [modal, setModal] = useState<CompanyWithActiveManifests | null>(null);

  // console.log("modamsdasdasda", typeof modal);
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
      {/* <Button
        title="asdjna"
        onPress={() => bottomSheetModalRef?.current?.present()}
      /> */}
      <CustomSearchBar search={search} setSearch={setSearch} />
      <AddNewButton text="Company" route="/companies/new" />
      <ListComponent
        handleModalOpen={handleModalOpen}
        comapaniesWithActiveManifests={comapaniesWithActiveManifests}
        fetchCompanyWithActiveManifests={fetchCompanyWithActiveManifests}
        search={search}
      />
      <CustomBottomSheetModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        data={modal}
        ref={actionSheetRef}
      />
    </View>
  );
};

export default Companies;
