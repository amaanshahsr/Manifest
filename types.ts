import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationRoute, ParamListBase } from "@react-navigation/native";

// ** Navigation Types Go here

export type TabProps = Pick<
  BottomTabBarProps,
  "navigation" | "descriptors" | "state" // we only need these three
> & {
  route: NavigationRoute<ParamListBase, string>;
  index: number;
};

// This is for passing styles incase of animating tab icons when it is focused
export type TabIconStyle = {
  size: number;
  color: string;
};
