import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type ValidRoutes = "/trucks/new" | "/companies/new" | "/manifests/new";
interface AddNewButtonProps {
  text: string;
  route: ValidRoutes;
}
const AddNewButton = ({ text, route }: AddNewButtonProps) => {
  const router = useRouter();
  const scale = useSharedValue(1); // Default scale value is 1

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 10, stiffness: 100 }); // Shrink with spring effect
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 100 }); // Expand back smoothly
      }}
      onPress={() => {
        router?.push({
          pathname: route,
        });
      }}
      style={{ width: "100%" }}
    >
      <Animated.View
        style={[modalStyle]}
        className={
          "px-3 py-4 rounded-lg w-11/12 bg-neutral-900 mx-auto flex flex-row gap-2 items-center justify-center "
        }
      >
        <Text className="text-white font-geistSemiBold ">Add New {text}</Text>
        <Text>
          <Ionicons name="add-circle-sharp" size={18} color="white" />
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export default AddNewButton;
