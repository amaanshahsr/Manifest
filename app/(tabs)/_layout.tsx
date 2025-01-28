import { View, Platform } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import "../../globals.css";
import Tab from "@/components/common/tab";

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();

  return (
    <View className=" bg-sky-400 flex flex-row">
      {state.routes.map((route, index: number) => {
        return (
          <Tab
            key={route?.key}
            descriptors={descriptors}
            index={index}
            navigation={navigation}
            route={route}
            state={state}
          />
        );
      })}
    </View>
  );
}

function MyTabs() {
  return <Tabs tabBar={(props) => <MyTabBar {...props} />}></Tabs>;
}

export default MyTabs;
