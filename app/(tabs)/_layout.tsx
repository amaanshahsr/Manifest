import { View, StyleSheet, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs, usePathname } from "expo-router";
import "../../globals.css";
import Tab from "@/components/common/tab";
import * as NavigationBar from "expo-navigation-bar";
import { useState } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { TabDimensions } from "@/types";

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  NavigationBar.setBackgroundColorAsync("white"); // ** This turns the bg of the navbar on andoid to white to match app theme
  const [tabDimensions, setTabDimensions] = useState<
    //**  Store the x and y position of each tab to animate a sliding object across it
    Record<string, TabDimensions>
  >({ index: { x: 0, y: 0, width: 0, height: 0 } });

  const left = useSharedValue(0);

  const currentRouteName = state.routes[state.index].name;
  const animatedLeftStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(
            tabDimensions[currentRouteName]?.x + left.value,
            {
              damping: 20,
              stiffness: 250,
              mass: 1,
            }
          ),
        },
      ],
    };
  });

  return (
    <View
      style={{
        ...styles?.shadowProp,
        paddingBlock: 16,
        display: "flex",
        justifyContent: "space-evenly",
      }}
      className=" border-t-[0.5px]  border-t-neutral-300 relative  flex flex-row  bg-indigo-500" // Styles for BottomTab Container
    >
      <Animated.View
        style={[
          [animatedLeftStyle],
          {
            width: tabDimensions[currentRouteName]?.width,
            height: 4,
          },
        ]}
        className={` rounded-lg   bg-neutral-900  absolute bottom-0 left-0`}
      ></Animated.View>
      {state.routes.map((route, index: number) => {
        return (
          <Tab
            setTabDimensions={setTabDimensions}
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
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <MyTabBar {...props} />}
    ></Tabs>
  );
}

export default MyTabs;

const styles = StyleSheet.create({
  shadowProp: {
    backgroundColor: "white",
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: -2 }, // Negative height for top shadow
    shadowOpacity: 1, // Shadow opacity
    shadowRadius: 3, // Shadow blur radius
    elevation: 10, // Required for Android (optional for top shadow)
  },
});
