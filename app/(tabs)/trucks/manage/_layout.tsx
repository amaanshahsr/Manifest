import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  Slot,
  Link,
  Route,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router"; // Import Slot and Link
import useReturnToHome from "@/hooks/useReturnToHome";
import { Switch } from "@/components/truck/switch";
import { CurrentRenderContext } from "@react-navigation/native";
import { capitalizeWord } from "@/utils/utils";

const ManageLayout = () => {
  const paths = [
    { link: "/trucks/manage/assign", text: "assign" },
    {
      link: "/trucks/manage/edit",
      text: "edit",
    },
  ];
  const { id } = useLocalSearchParams();
  useReturnToHome({ route: "/trucks" });
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = pathname?.split("/")[3]?.toLowerCase() || "";

  const optionsForSwitch = paths?.map((path) => path?.text);
  const handleStatus = (link: string) => {
    router?.navigate({
      pathname:
        link === "assign"
          ? "/trucks/manage/assign"
          : ("/trucks/manage/edit" as
              | "/trucks/manage/assign"
              | "/trucks/manage/edit"),
      params: { id },
    });
  };
  console.log("oathskdjnlasd", optionsForSwitch);

  return (
    <View className="flex-1 bg-gray-100 p-2">
      <Switch
        key="bitch"
        options={optionsForSwitch}
        status={currentPath}
        handleStatus={handleStatus}
      />

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
