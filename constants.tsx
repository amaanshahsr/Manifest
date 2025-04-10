import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { TabIconStyle } from "./types";
import { Octicons } from "@expo/vector-icons";
import { TableTypes } from "./db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

const defaultIconStyle = { size: 24, color: "black" };

export const tabBarIcons = {
  index: (
    customStyles?: TabIconStyle // ? Swap the default styles for a Custom size and color recieved as arguments
  ) => (
    <Ionicons
      name="home-outline"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  companies: (customStyles?: TabIconStyle) => (
    <Octicons
      name="people"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  trucks: (customStyles?: TabIconStyle) => (
    <Feather
      name="truck"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  manifests: (customStyles?: TabIconStyle) => (
    <Ionicons
      name="clipboard-outline"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  reports: (customStyles?: TabIconStyle) => (
    <Ionicons
      name="documents-outline"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
};

export const manifestStatus = ["unassigned", "active", "completed"];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
