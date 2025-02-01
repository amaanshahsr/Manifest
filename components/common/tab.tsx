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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

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

  const scale = useSharedValue(2);
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isFocused
          ? (scale.value = withTiming(isFocused ? 1.5 : 1, {
              duration: 100,
            }))
          : withTiming(1, {
              duration: 100,
            }),
      },
    ],
  }));

  return (
    <PlatformPressable
      href={buildHref(route.name, route.params)}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        gap: 4,
      }}
      className="items-center justify-center p-3 flex gap-1 bg-blue-500 "
    >
      <Animated.View style={[animatedStyles]}>
        {tabBarIcons[label as keyof typeof tabBarIcons]({
          color: isFocused ? colors.primary : colors.text,
          size: 18,
        })}
      </Animated.View>
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
