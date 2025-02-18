import { Route, useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { BackHandler } from "react-native";

interface useReturnToHomeProps {
  route: Route;
}
// This hook navigates to parent route from child route eg:/trucks/new -> /trucks

const useReturnToHome = ({ route }: useReturnToHomeProps) => {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace(route as Route); // Navigate back to the trucks list
        return true; // Prevent default back behavior
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [router])
  );
};

export default useReturnToHome;
