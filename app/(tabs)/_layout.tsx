import { View, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import "../../globals.css";
import Tab from "@/components/common/tab";
import * as NavigationBar from "expo-navigation-bar";

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  NavigationBar.setBackgroundColorAsync("white"); // ** This turns the bg of the navbar on andoid to white to match app theme
  return (
    <View
      style={styles?.shadowProp}
      className=" bg-neutral-100 border-t-[0.5px] border-t-neutral-300  flex flex-row  " // Styles for BottomTab Container
    >
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

const styles = StyleSheet.create({
  shadowProp: {
    backgroundColor: "white",
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: -2 }, // Negative height for top shadow
    shadowOpacity: 1, // Shadow opacity
    shadowRadius: 3, // Shadow blur radius
    elevation: 3, // Required for Android (optional for top shadow)
  },
});
