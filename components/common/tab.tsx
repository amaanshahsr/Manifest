import { useLinkBuilder, useTheme } from "@react-navigation/native";
import React from "react";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { TabProps } from "@/types";
import { tabBarIcons } from "@/constants";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
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

  const iconScale = useSharedValue(1);
  const iconTranslateY = useSharedValue(0);
  const labelOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (isFocused) {
      iconScale.value = withTiming(1.8, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
      iconTranslateY.value = withTiming(5, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
      labelOpacity.value = withTiming(0, { duration: 50 });
    } else {
      iconScale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
      iconTranslateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
      labelOpacity.value = withTiming(1, { duration: 50 });
    }
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: iconScale.value },
        { translateY: iconTranslateY.value },
      ],
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    return {
      opacity: labelOpacity.value,
    };
  });

  const passTabDimensionsToParent = (e: LayoutChangeEvent) => {
    const dimensions = e?.nativeEvent?.layout;
    setTabDimensions((prev) => ({
      ...prev,
      [route.name]: dimensions,
    }));
  };

  const slicedLabel = String(label)?.includes("/")
    ? String(label)?.split("/")[0]
    : String(label);

  const isHiddenRoute =
    String(label)?.split("/")[1] === "new" ||
    String(label)?.split("/")[1] === "[id]" ||
    String(label)?.split("/")[1] === "manage";

  return (
    <PlatformPressable
      android_ripple={{ color: "transparent" }}
      href={buildHref(route.name, route.params)}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        display: isHiddenRoute ? "none" : "flex",
      }}
      onLayout={passTabDimensionsToParent}
    >
      <Animated.View style={iconStyle}>
        {tabBarIcons[slicedLabel as keyof typeof tabBarIcons]({
          color: isFocused ? "#1c1917" : "#737373",
          size: 16,
        })}
      </Animated.View>
      <Animated.View style={labelStyle}>
        <Text
          style={{
            fontFamily: "Geist-Medium",
            fontSize: 12,
            fontWeight: isFocused ? "600" : "400",
            color: isFocused ? "#1c1917" : "#737373",
          }}
        >
          {capitalizeWord(slicedLabel)}
        </Text>
      </Animated.View>
    </PlatformPressable>
  );
};

export default Tab;
