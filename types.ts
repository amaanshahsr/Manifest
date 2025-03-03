import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationRoute, ParamListBase } from "@react-navigation/native";
import { SharedValue } from "react-native-reanimated";
import { Company, Manifest, Truck } from "./db/schema";

// ** Navigation Types Go here

export type TabProps = Pick<
  BottomTabBarProps,
  "navigation" | "descriptors" | "state" // we only need these three
> & {
  route: NavigationRoute<ParamListBase, string>;
  index: number;
  setTabDimensions: React.Dispatch<
    React.SetStateAction<Record<string, TabDimensions>>
  >;
};

export type TabDimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// This is for passing styles incase of animating tab icons when it is focused
export type TabIconStyle = {
  size: number;
  color: string;
};

// Table types
export type TableItem = Company | Manifest | Truck;
export type ManifestWithCompanies = {
  manifests: Manifest;
  companies: Company | null;
};
