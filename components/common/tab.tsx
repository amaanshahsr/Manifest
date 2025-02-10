import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import React from "react";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { TabProps } from "@/types";
import { tabBarIcons } from "@/constants";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { capitalizeWord } from "@/utils/utils";

const Tab: React.FC<TabProps> = ({
  navigation,
  route,
  index,
  state,
  descriptors,
  setTabDimensions,
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
          ? (scale.value = withSpring(isFocused ? 1.5 : 1, {
              duration: 100,
            }))
          : withSpring(1, {
              duration: 100,
            }),
      },
    ],
  }));

  const passTabDimensionsToParent = (e: LayoutChangeEvent) => {
    const dimensions = e?.nativeEvent?.layout;
    setTabDimensions((prev) => ({
      ...prev,
      [route.name]: dimensions, // Store dimensions for the tab in the dimensions object
    }));
  };

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
        padding: 10,
        gap: 4,
      }}
      onLayout={passTabDimensionsToParent}
    >
      <Animated.View style={[animatedStyles]}>
        {tabBarIcons[label as keyof typeof tabBarIcons]({
          color: isFocused ? "#1c1917" : "#737373",
          size: 16,
        })}
      </Animated.View>
      <Text
        style={{
          fontFamily: "Geist-Medium",
          fontSize: 13,
          fontWeight: isFocused ? "600" : "400",
          color: isFocused ? "#1c1917" : "#737373",
          opacity: 1,
        }}
      >
        {capitalizeWord(label as string)}
      </Text>
    </PlatformPressable>
  );
};

export default Tab;
