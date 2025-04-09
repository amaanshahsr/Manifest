import React from "react";
import { View, Text, Pressable, SafeAreaView } from "react-native";
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

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-2 pt-10">
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
    </SafeAreaView>
  );
};

export default ManageLayout;
