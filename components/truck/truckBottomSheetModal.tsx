import { ManifestWithCompanyName } from "@/types";
import { memo, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, Text } from "react-native";
import CustomModal, { ModalRef } from "../common/customModal";
import TableList from "./tableList";
import { Pressable } from "react-native-gesture-handler";

export type TruckModalRef = {
  open: (data: ManifestWithCompanyName[]) => void;
  close: () => void;
};

const TruckBottomSheetModal = memo(
  forwardRef<TruckModalRef>((_, ref) => {
    const [modal, setmodal] = useState<ManifestWithCompanyName[]>([]);
    const modalRef = useRef<ModalRef>(null);

    // Expose open/close methods and pass the data for the table as argument through ref
    useImperativeHandle(ref, () => ({
      open: (data) => {
        setmodal(data);
        modalRef.current?.open();
      },
      close: () => modalRef.current?.close(),
    }));

    return (
      <View>
        <CustomModal ref={modalRef} backdropOpacity={0.7} snapPoint="75%">
          <TableList
            rows={modal}
            tableRowkeys={["manifestId", "companyName"]}
            columns={["Manifest No.", "Company Name"]}
            key="tablelist"
          />
        </CustomModal>
      </View>
    );
  }),
  // Simplified memo comparison since there are no props
  () => true // Always return true to prevent unnecessary re-renders
);

export default TruckBottomSheetModal;
