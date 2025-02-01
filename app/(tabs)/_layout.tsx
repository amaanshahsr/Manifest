import { View, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import "../../globals.css";
import Tab from "@/components/common/tab";
import * as NavigationBar from "expo-navigation-bar";
import { useRef } from "react";

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  NavigationBar.setBackgroundColorAsync("white"); // ** This turns the bg of the navbar on andoid to white to match app theme

  const bottomTabRef = useRef<number>(0);
  return (
    <View
      onLayout={(e) => (bottomTabRef.current = e?.nativeEvent?.layout?.width)}
      style={styles?.shadowProp}
      className=" bg-pink-400 border-t-[0.5px] border-t-neutral-300 relative  flex flex-row  " // Styles for BottomTab Container
    >
      {/* <View
        style={{
          width: bottomTabRef?.current / 2,
          left: 0,
        }}
        className="h-[4] bg-red-500  absolute top-0"
      ></View> */}
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
  return (
    <Tabs
      // ** Enable this to add animations to screen changes
      // screenOptions={{
      //   animation: "shift",
      // }}

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
