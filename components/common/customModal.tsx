import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  ViewStyle,
  Text,
  Pressable,
} from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
  Pressable as Presable,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CustomModalProps {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  backdropOpacity?: number;
  snapPoint?: "25%" | "50%" | "60%" | "75%" | "90%" | "100%";
}

export type ModalRef = {
  open: () => void;
  close: () => void;
};

const CustomModal = forwardRef<ModalRef, CustomModalProps>(
  (
    { children, snapPoint = "50%", backdropOpacity = 0.5, containerStyle },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false);
    const translateY = useSharedValue(Dimensions.get("window").height);
    const progress = useSharedValue(0);

    const springConfig = {
      damping: 30,
      mass: 0.2,
      stiffness: 300,
    };

    const modalHeight =
      (Dimensions.get("window").height * parseFloat(snapPoint)) / 100;

    // Expose open/close methods via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
        translateY.value = withSpring(0, springConfig);
        progress.value = withSpring(1, springConfig);
      },
      close: () => {
        translateY.value = withSpring(modalHeight + 50, springConfig);
        progress.value = withSpring(0, springConfig);
        setTimeout(() => setVisible(false), 200);
      },
    }));

    useEffect(() => {
      if (visible) {
        translateY.value = withSpring(0, springConfig);
        progress.value = withSpring(1, springConfig);
      } else {
        translateY.value = withSpring(
          Dimensions.get("window").height,
          springConfig
        );
        progress.value = withSpring(0, springConfig);
      }
    }, [visible]);

    const modalStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => {
      return {
        backgroundColor: interpolateColor(
          progress.value,
          [0, 1],
          ["rgba(0,0,0,0)", `rgba(0,0,0,${backdropOpacity})`]
        ),
      };
    });

    const handleClose = () => {
      translateY.value = withSpring(modalHeight + 50, springConfig);
      progress.value = withSpring(0, springConfig);
      setTimeout(() => setVisible(false), 200);
    };

    const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        if (e.translationY > 0) {
          translateY.value = e.translationY;
        } else {
          translateY.value = withSpring(-15, springConfig);
        }
      })
      .onEnd((e) => {
        if (e.translationY > modalHeight / 5) {
          translateY.value = withSpring(modalHeight, springConfig);
          progress.value = withSpring(0, springConfig);
          runOnJS(setVisible)(false);
        } else {
          translateY.value = withSpring(0, springConfig);
        }
      });

    return (
      <Modal visible={visible} transparent={true} onRequestClose={handleClose}>
        <GestureHandlerRootView style={{ flex: 1, zIndex: 999 }}>
          <AnimatedPressable
            style={[
              backdropStyle,
              {
                height: Dimensions.get("window").height,
                width: Dimensions.get("window").width,
              },
            ]}
            onPress={handleClose}
            className="relative flex z-50 items-center justify-end"
          >
            <AnimatedPressable
              style={[modalStyle, { height: modalHeight }, containerStyle]}
              onPressIn={(e) => e?.stopPropagation()}
              className="w-[98%] bottom-0 absolute flex-1 bg-white items-center rounded-2xl"
            >
              <GestureDetector gesture={panGesture} touchAction="pan-y">
                <AnimatedPressable className="p-4 flex items-center w-full justify-center">
                  <Pressable className="w-14 bg-neutral-500 h-[6px] rounded-xl" />
                </AnimatedPressable>
              </GestureDetector>

              <Pressable className="flex-1 w-full z-50">{children}</Pressable>
            </AnimatedPressable>
          </AnimatedPressable>
        </GestureHandlerRootView>
      </Modal>
    );
  }
);

export default CustomModal;
