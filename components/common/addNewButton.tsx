import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

type ValidRoutes = "/trucks/new" | "/companies/new" | "/manifests/new";
interface AddNewButtonProps {
  text: string;
  route: ValidRoutes;
}
const AddNewButton = ({ text, route }: AddNewButtonProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        router?.replace({
          pathname: route,
        });
      }}
      className="bg-neutral-900 px-3 py-4 rounded-lg w-11/12 mx-auto flex flex-row gap-2 items-center justify-center "
    >
      <Text className="text-white font-geistSemiBold ">Add New {text}</Text>
      <Text>
        <Ionicons name="add-circle-sharp" size={18} color="white" />
      </Text>
    </Pressable>
  );
};

export default AddNewButton;
