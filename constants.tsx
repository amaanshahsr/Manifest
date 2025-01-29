import Ionicons from "@expo/vector-icons/Ionicons";
import { TabIconStyle } from "./types";

const defaultIconStyle = { size: 24, color: "black" };

export const tabBarIcons = {
  index: (
    customStyles?: TabIconStyle // ? Swap the default styles for a Custom size and color recieved as arguements
  ) => (
    <Ionicons
      name="home-outline"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
  users: (customStyles?: TabIconStyle) => (
    <Ionicons
      name="people-outline"
      {...(customStyles ? customStyles : defaultIconStyle)}
    />
  ),
};
