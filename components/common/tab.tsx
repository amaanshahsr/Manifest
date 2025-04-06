import { useLinkBuilder, useTheme } from "@react-navigation/native";
import React from "react";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { TabProps } from "@/types";
import { tabBarIcons } from "@/constants";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { capitalizeWord } from "@/utils/utils";
import * as Haptics from "expo-haptics";

const Tab: React.FC<TabProps> = ({
  navigation,
  route,
  index,
  state,
  descriptors,
  setTabDimensions,
}) => {
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
  const translateYDistance = useSharedValue(10);
  const labelScale = useSharedValue(1);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isFocused ? 1.8 : 1, { duration: 100 }),
        },
        {
          translateY: withSpring(isFocused ? 5 : 1, { duration: 150 }),
        },
      ],
    };
  });

  const animatedScaleStyle = useAnimatedStyle(() => {
    const scaleX = withTiming(isFocused ? 0 : 1, {
      duration: 100,
      easing: Easing.out(Easing.exp), // Smooth exponential easing
    });
    return {
      transform: [{ scaleX }],
    };
  });

  const passTabDimensionsToParent = (e: LayoutChangeEvent) => {
    const dimensions = e?.nativeEvent?.layout;
    setTabDimensions((prev) => ({
      ...prev,
      [route.name]: dimensions, // Store dimensions for the tab in the dimensions object
    }));
  };

  const slicedLabel = String(label)?.includes("/")
    ? String(label)?.split("/")[0]
    : String(label);

  // Hide sub routes eg :- trucks/new,trucks/manage from the bottom navigator
  const isHiddenRoute =
    String(label)?.split("/")[1] === "new" ||
    String(label)?.split("/")[1] === "[id]" ||
    String(label)?.split("/")[1] === "manage";
  return (
    <PlatformPressable
      android_ripple={{ color: "transparent" }} // No ripple effect on Android
      href={buildHref(route.name, route.params)}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        display: isHiddenRoute ? "none" : "flex",
      }}
      onLayout={passTabDimensionsToParent}
    >
      <Animated.View style={[animatedStyles]}>
        {tabBarIcons[slicedLabel as keyof typeof tabBarIcons]({
          color: isFocused ? "#1c1917" : "#737373",
          size: 16,
        })}
      </Animated.View>
      <Animated.View style={[animatedScaleStyle]}>
        <Text
          style={[
            {
              fontFamily: "Geist-Medium",
              fontSize: 12,
              fontWeight: isFocused ? "600" : "400",
              color: isFocused ? "#1c1917" : "#737373",
            },
          ]}
        >
          {capitalizeWord(slicedLabel)}
        </Text>
      </Animated.View>
    </PlatformPressable>
  );
};

export default Tab;
