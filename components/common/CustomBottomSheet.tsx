import { View, StyleSheet, Text, Button } from "react-native";
import React, { forwardRef, useMemo } from "react";
import BottomSheet, {
  BottomSheetView,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import ManifestForm from "../forms/manifestForm";
import CustomBackdrop from "../forms/backdrop";
export type Ref = BottomSheet;

interface Props {
  title: string;
}

const CloseBtn = () => {
  const { close } = useBottomSheet();

  return <Button title="Close" onPress={() => close()} />;
};

const CustomBottomSheet = forwardRef<Ref, Props>((props, ref) => {
  const snapPoints = useMemo(() => ["75%"], []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      handleIndicatorStyle={{ backgroundColor: "#fff" }}
      backgroundStyle={{ backgroundColor: "#1d0f4e" }}
    >
      <BottomSheetView style={{ flex: 1 }} className="flex-1 items-center">
        {/* <Text style={styles.containerHeadline}>{props.title}</Text> */}
        <ManifestForm />
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  containerHeadline: {
    fontSize: 24,
    fontWeight: "600",
    padding: 20,
    color: "#fff",
  },
});

export default CustomBottomSheet;
