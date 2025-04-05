import { ManifestWithCompanyName } from "@/types";
import { memo, useCallback } from "react";
import { View, Text } from "react-native";
import CustomModal from "../common/customModal";
import TableList from "./tableList";
import { Pressable } from "react-native-gesture-handler";

interface TruckBottomSheetModalProps {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modalData: ManifestWithCompanyName[];
}

export const TruckBottomSheetModal = memo(
  ({ isVisible, modalData, setIsVisible }: TruckBottomSheetModalProps) => {
    const handleClose = useCallback(() => setIsVisible(false), [setIsVisible]);

    return (
      <View>
        <CustomModal
          backdropOpacity={0.7}
          visible={isVisible}
          key="trucks"
          onClose={handleClose}
        >
          <TableList
            rows={modalData}
            tableRowkeys={["manifestId", "companyName"]}
            columns={["Manifest No.", "Company Name"]}
            key="tablelist"
          />
        </CustomModal>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.modalData === nextProps.modalData
);
