import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  NavigationRoute,
  ParamListBase,
  useLinkBuilder,
  useTheme,
} from "@react-navigation/native";
import React from "react";
import { Text, PlatformPressable } from "@react-navigation/elements";

const Tab = ({
  navigation,
  route,
  index,
  state,
  descriptors,
}: {
  state: BottomTabBarProps["state"];
  navigation: BottomTabBarProps["navigation"];
  route: NavigationRoute<ParamListBase, string>;
  descriptors: BottomTabBarProps["descriptors"];
  index: number;
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
      className="items-center justify-center border-2 p-5"
    >
      <Text
        style={{
          color: isFocused ? colors.primary : colors.text,
          fontFamily: "Inter-Variable",
        }}
      >
        {label ?? "hellow"}
      </Text>
    </PlatformPressable>
  );
};

export default Tab;
