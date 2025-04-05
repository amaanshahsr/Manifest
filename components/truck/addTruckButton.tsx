import { ValidRoutes } from "@/types";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

interface AddNewButtonProps {
  route: ValidRoutes;
}

export const AddTruckButton = React.memo(({ route }: AddNewButtonProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router?.push("/trucks/new")}
      className="p-3 bg-neutral-800 rounded-full flex items"
    >
      <MaterialIcons name="post-add" size={20} color="white" />
    </Pressable>
  );
});
