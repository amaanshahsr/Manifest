import Ionicons from "@expo/vector-icons/Ionicons";
import { TabIconStyle } from "./types";
import {
  AntDesign,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const defaultIconStyle = { size: 24, color: "black" };

export const tabBarIcons = {
  index: (
    customStyles?: TabIconStyle // ? Swap the default styles for a Custom size and color recieved as arguments
  ) => (
    <AntDesign
      name="home"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  companies: (customStyles?: TabIconStyle) => (
    <FontAwesome5
      name="building"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  trucks: (customStyles?: TabIconStyle) => (
    <FontAwesome6
      name="truck-front"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  manifests: (customStyles?: TabIconStyle) => (
    <Ionicons
      name="document-text-sharp"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  reports: (customStyles?: TabIconStyle) => (
    <MaterialCommunityIcons
      name="microsoft-excel"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  trips: (customStyles?: TabIconStyle) => (
    <FontAwesome6
      name="location-arrow"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
};

export const manifestStatus = ["unassigned", "active", "completed"];

export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
