import React, { useEffect } from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  ViewStyle,
  DimensionValue,
  Pressable,
  Text,
} from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  backdropOpacity?: number;
}

const CustomModal = ({
  visible,
  onClose,
  children,
  backdropOpacity = 0.3,
}: CustomModalProps) => {
  const translateY = useSharedValue(Dimensions.get("window").height);
  const progress = useSharedValue(0); // Tracks animation progress (0-1)

  const springConfig = {
    damping: 30,
    mass: 0.2,
    stiffness: 300,
  };

  const modalHeight = Dimensions.get("window").height / 2;

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

  // Changed from opacity to background color animation
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
    if (visible) {
      translateY.value = withSpring(modalHeight + 50, springConfig);
      progress.value = withSpring(0, springConfig);
    }
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow swipe down
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      // If swiped down more than 1/3 of modal height, close
      if (e.translationY > modalHeight / 5) {
        translateY.value = withSpring(modalHeight, springConfig);
        progress.value = withSpring(0, springConfig);
        runOnJS(onClose)();
      } else {
        // Return to original position
        translateY.value = withSpring(0, springConfig);
      }
    });

  return (
    <Modal visible={visible} transparent={true} onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AnimatedPressable
          style={[
            backdropStyle,
            {
              height: Dimensions.get("window").height,
              width: Dimensions.get("window").width,
            },
          ]}
          onPress={handleClose}
          className="relative flex bg-green-500  z-50  items-center justify-end "
        >
          <AnimatedPressable
            style={[modalStyle, { height: modalHeight }]}
            onPressIn={(e) => e?.stopPropagation()}
            className="w-[98%] bottom-0 absolute  flex-1  bg-white items-center rounded-t-2xl "
          >
            <GestureDetector gesture={panGesture} touchAction="pan-y">
              <AnimatedPressable className="p-4 flex items-center w-full  justify-center">
                <Pressable className="w-14 bg-neutral-500 h-[6px] rounded-xl" />
              </AnimatedPressable>
            </GestureDetector>

            <Pressable className="flex-1 w-full">{children}</Pressable>
          </AnimatedPressable>
        </AnimatedPressable>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default CustomModal;
