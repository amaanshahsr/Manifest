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
    <View className="flex flex-row w-full  justify-stretch relative my-6 bg-gray-300  rounded-xl shadow-md ">
      <Animated.View
        style={[
          animatedLeftStyle,
          {
            width: width,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.27,
            shadowRadius: 4.65,

            elevation: 6,
          },
        ]}
        className="absolute top-0  rounded-xl  bg-white  h-full z-50 pointer-events-none"
      >
        {children}
      </Animated.View>
      {options?.map((stat, index) => {
        return (
          <Pressable
            onLayout={(e) => {
              index === 0 ? setWidth(e?.nativeEvent?.layout?.width) : null;
            }}
            key={stat}
            onPress={() => handleStatus(stat)}
            className={` flex-1 justify-center relative items-center  rounded-md p-4 z-[90] text-black `}
          >
            <Text
              className={`${
                stat === status ? "font-geistSemiBold" : "font-geistMedium "
              } `}
            >
              {capitalizeWord(stat) as string}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
