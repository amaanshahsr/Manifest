import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import TableList from "../truck/tableList";
import {
  ManifestWithAssignedVehicleRegistration,
  ManifestWithRegistration,
} from "@/types";

import { View } from "react-native";
import CustomModal from "./customModal";

export type CustomBottomSheetModalRef = {
  open: (data?: ManifestWithRegistration[]) => void;
  close: () => void;
};

const CustomBottomSheetModal = forwardRef<CustomBottomSheetModalRef>(
  (_, ref) => {
    const [
      manifestsWithVehicleRegistration,
      setManifestsWithVehicleRegistration,
    ] = useState<Array<ManifestWithRegistration>>([]);
    const modalRef = useRef<React.ElementRef<typeof CustomModal>>(null);

    // Expose open/close methods via ref
    useImperativeHandle(ref, () => ({
      open: (data) => {
        if (!data) return;
        setManifestsWithVehicleRegistration(data);
        modalRef.current?.open();
      },
      close: () => {
        modalRef.current?.close();
      },
    }));

    return (
      <View>
        <CustomModal ref={modalRef} backdropOpacity={0.7}>
          <TableList
            tableRowkeys={["manifestId", "truckRegistration"]}
            rows={manifestsWithVehicleRegistration}
            columns={["Manifest No.", "Registration"]}
          />
        </CustomModal>
      </View>
    );
  }
);

export default CustomBottomSheetModal;
