import React from "react";
import CompanyForm from "@/components/forms/companyForm";
import CustomModal from "@/components/common/customModal";
import { View } from "react-native";

const Id = () => {
  return (
    <View>
      <CustomModal visible={true} onClose={() => {}}>
        <CompanyForm />
      </CustomModal>
    </View>
  );
};

export default Id;
