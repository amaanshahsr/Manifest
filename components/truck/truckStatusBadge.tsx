import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
} from "react-native-reanimated";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const bgColor = useSharedValue(status === "active" ? 0 : 1);

  const animatedBadgeColor = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        bgColor.value,
        [0, 1], // Input range
        ["#22c55e", "#ef4444"] // Output colors
      ),
    };
  });

  useEffect(() => {
    bgColor.value = status === "active" ? 0 : 1;
  }, [status]);

  return (
    <Animated.View
      style={animatedBadgeColor}
      className=" w-2 h-2 absolute  rounded-md right-2 top-2"
    ></Animated.View>
  );
};
