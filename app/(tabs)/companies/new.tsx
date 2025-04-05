import CustomModal from "@/components/common/customModal";
import CompanyForm from "@/components/forms/companyForm";
import React from "react";
import { View } from "react-native";

const New = () => {
  return (
    <View>
      <CustomModal visible={true} onClose={() => {}}>
        <CompanyForm />
      </CustomModal>
    </View>
  );
};

export default New;
