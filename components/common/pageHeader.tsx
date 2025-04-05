import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { ReactElement, ReactNode } from "react";
import { View, Text, StatusBar, Platform, Pressable } from "react-native";
// import { Pressable } from "react-native-gesture-handler";

interface PageHeaderProps {
  title: string;
  headerRightItem?: React.ReactNode; // Most flexible
  children?: ReactNode;
}

const PageHeader = ({ title, headerRightItem, children }: PageHeaderProps) => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        paddingTop:
          Platform.OS === "android"
            ? StatusBar.currentHeight
              ? StatusBar.currentHeight + 10
              : 0
            : 0,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
      }}
      className="bg-white  px-5 pb-5  rounded-b-xl "
    >
      <View className=" flex flex-row items-center justify-between">
        <Pressable
          onPress={() => navigation?.goBack()}
          className="flex items-center justify-center p-3 bg-neutral-200 rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="black" />
        </Pressable>
        <Text className="text-neutral-900 font-geistSemiBold text-2xl tracking-tight">
          {title}
        </Text>
        {headerRightItem && headerRightItem}
      </View>
      {children && <View>{children}</View>}
    </View>
  );
};

export default PageHeader;
