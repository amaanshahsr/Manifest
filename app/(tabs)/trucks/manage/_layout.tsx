import React from "react";
import { View, Text, Pressable } from "react-native";
import { Slot, Link, Route, useLocalSearchParams } from "expo-router"; // Import Slot and Link
import useReturnToHome from "@/hooks/useReturnToHome";

const ManageLayout = () => {
  const paths = [
    { link: "/trucks/manage/assign", text: "Assign" },
    {
      link: "/trucks/manage/edit",
      text: "Edit",
    },
  ];
  const { id } = useLocalSearchParams();

  useReturnToHome({ route: "/trucks" });

  return (
    <View className="flex-1 bg-gray-100 py-2">
      <View className="flex-row justify-between items-center  bg-stone-200 w-[95%]  mx-auto z-30  rounded-xl relative">
        <View className="w-1/2 absolute top-[1/5] left-0 h-4/5 mx-2 bg-stone-300 z-[35] rounded-xl "></View>
        {paths?.map((path) => {
          return <SwitchButton {...path} key={path?.text} id={id} />;
        })}
      </View>
      {/*Outlet that  Renders the nested route (assign.tsx or edit.tsx) */}
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  );
};

export default ManageLayout;

interface SwitchButtonProps {
  link: string;
  text: string;
  id: string | string[];
}
const SwitchButton = ({ link, text, id }: SwitchButtonProps) => {
  return (
    <Link
      href={{
        pathname: link as "/trucks/manage/assign" | "/trucks/manage/edit",
        params: { id: id },
      }}
      asChild
    >
      <Pressable className="py-3 font-geistMedium flex items-center justify-center w-1/2 rounded-lg z-40 ">
        <Text className="text-stone-900  text-base font-bold">{text}</Text>
      </Pressable>
    </Link>
  );
};
