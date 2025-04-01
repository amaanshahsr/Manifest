import AddNewButton from "@/components/common/addNewButton";
import CustomModal from "@/components/common/customModal";
import CustomBottomSheetModal, {
  TestFlashList,
} from "@/components/common/bottomSheetModal";
import CustomSearchBar from "@/components/common/searchBar";
import { ListComponent } from "@/components/manifest/listComponent";
import { useCompanyStore } from "@/store/useCompanyStore";
import { CompanyWithActiveManifests } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Button, Modal } from "react-native";

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

  const handleModalOpen = useCallback((data: CompanyWithActiveManifests) => {
    setIsVisible(true);
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
      />
    </View>
  );
};

export default Companies;
