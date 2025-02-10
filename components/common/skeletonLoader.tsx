import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import "../../globals.css";

// TODO - add support for varying width & heights, linear gradient

const SkeletonLoader = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 600 }),
      -1, // Infinite loop
      true // Reverse the animation (1 → 0 → 1)
    );
  }, []);

  const animatedBackground = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#f3f4f6", "#d4d4d8"]
    );

    return { backgroundColor };
  });

  return (
    <Animated.View
      style={[
        {
          shadowColor: "#FFFFF", // Shadow color
          shadowOffset: { width: 0, height: -2 }, // Negative height for top shadow
          shadowOpacity: 1, // Shadow opacity
          shadowRadius: 3, // Shadow blur radius
          elevation: 4, // Required for Android (optional for top shadow)
        },

        [animatedBackground],
      ]}
      className="h-44 overflow-scroll w-11/12   rounded-md mt-5 mx-auto"
    ></Animated.View>
  );
};

export default SkeletonLoader;
