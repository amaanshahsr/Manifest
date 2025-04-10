import { capitalizeWord } from "@/utils/utils";
import { ReactNode, useEffect, useState } from "react";
import { View, Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface SwitchProps<T extends string> {
  status: T;
  handleStatus: (T: string) => void;
  options: readonly T[];
  children?: ReactNode;
}

export const Switch = <T extends string>({
  status,
  handleStatus,
  options,
  children,
}: SwitchProps<T>) => {
  const [width, setWidth] = useState(0);

  const value = useSharedValue(0);

  useEffect(() => {
    if (width > 0) {
      const index = options.indexOf(status); // Get the index of the active option
      value.value = withSpring(index * width, {
        damping: 305, // Adjusted for a snappier feel
        stiffness: 1000,
        mass: 1,
      });
    }
  }, [status, width]);

  const animatedLeftStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: value.value }],
    };
  });

  return (
    <View className="flex flex-row w-full justify-stretch relative my-6 bg-neutral-100 rounded-2xl shadow-sm">
      {/* Sliding Animated Background */}
      <Animated.View
        style={[
          animatedLeftStyle,
          {
            width: width,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 4,
          },
        ]}
        className="absolute top-0 rounded-2xl bg-white h-full z-40 pointer-events-none"
      >
        {children}
      </Animated.View>

      {/* Buttons */}
      {options?.map((stat, index) => (
        <Pressable
          key={stat}
          onLayout={(e) =>
            index === 0 ? setWidth(e.nativeEvent.layout.width) : null
          }
          onPress={() => handleStatus(stat)}
          className="flex-1 justify-center items-center z-50 py-3 rounded-2xl"
        >
          <Text
            className={`text-base ${
              stat === status
                ? "font-geistSemiBold text-neutral-900"
                : "font-geistMedium text-neutral-500"
            }`}
          >
            {capitalizeWord(stat)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
