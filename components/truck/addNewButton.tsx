import { ValidRoutes } from "@/types";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

interface AddNewButtonProps {
  route: ValidRoutes;
  text?: string;
}

export const AddNewButton = React.memo(({ route, text }: AddNewButtonProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router?.push(route)}
      className={` bg-neutral-800 ${
        text ? "rounded-lg p-4" : "rounded-full p-3"
      }  flex flex-row items-center gap-2`}
    >
      {text && <Text className="font-geistMedium text-white ">{text}</Text>}
      <MaterialIcons name="post-add" size={20} color="white" />
    </Pressable>
  );
});
