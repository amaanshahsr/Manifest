import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  ViewStyle,
  DimensionValue,
  Pressable,
} from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  backdropOpacity?: number;
  animationType?: "none" | "slide" | "fade";
}

const CustomModal = ({
  visible,
  onClose,
  children,
  containerStyle = {},
  backdropOpacity = 0.2,
  animationType = "fade",
}: CustomModalProps) => {
  const [height, setheight] = useState("50%");

  const position = useSharedValue(0);
  const flingGesture = Gesture.Fling()
    .direction(Directions.UP)
    .onStart((e) => {
      console.log("started");
      position.value = withTiming(position.value + 10, { duration: 100 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <View style={styles.centeredView}>
        <GestureDetector gesture={flingGesture}>
          <View
            style={[
              styles.modalContainer,
              containerStyle,
              animatedStyle,
              { height: height as DimensionValue },
            ]}
          >
            <Pressable className="bg-neutral-700 w-1/5 mx-auto mb-5 rounded-xl h-1"></Pressable>
            {children}
          </View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: "black",
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    width: Dimensions.get("window").width * 0.95,
    // height: "50%",
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default CustomModal;
