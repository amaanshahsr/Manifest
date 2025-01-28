import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useRef } from "react";
import { Text, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Users = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <View className="h-screen">
      <Text>udjhabsjhd</Text>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheet ref={bottomSheetRef} onChange={handleSheetChanges}>
          <BottomSheetView style={styles.contentContainer}>
            <Text className="font-inter text-3xl">Awesome 🎉</Text>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
};

export default Users;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 400,

    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    height: 400,

    alignItems: "center",
  },
});
