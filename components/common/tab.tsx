import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  NavigationRoute,
  ParamListBase,
  useLinkBuilder,
  useTheme,
} from "@react-navigation/native";
import React from "react";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { TabProps } from "@/types";
import { tabBarIcons } from "@/constants";
import { View } from "react-native";

const Tab: React.FC<TabProps> = ({
  navigation,
  route,
  index,
  state,
  descriptors,
}) => {
  const { colors } = useTheme();

  const { options } = descriptors[route.key];
  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  const { buildHref } = useLinkBuilder();

  const onLongPress = () => {
    navigation;
    navigation.emit({
      type: "tabLongPress",
      target: route.key,
    });
  };
  const isFocused = state.index === index;

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  return (
    <PlatformPressable
      href={buildHref(route.name, route.params)}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ flex: 1 }}
      className="items-center justify-center p-3 flex "
    >
      {/* <View> */}
      {tabBarIcons[label as keyof typeof tabBarIcons]({
        color: isFocused ? colors.primary : colors.text,
        size: 16,
      })}
      {/* </View> */}
      <Text
        className="font-inter"
        style={{
          fontSize: 14,
          //   fontWeight: "800",
          color: isFocused ? colors.primary : colors.text,
          fontFamily: "Inter-Variable",
        }}
      >
        {label as string}
      </Text>
    </PlatformPressable>
  );
};

export default Tab;
