import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../globals.css";

const RootLayout = () => {
  SplashScreen.preventAutoHideAsync();

  const [loaded] = useFonts({
    "Inter-Variable": require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
  });

  // hide the splashscreen only after font has been loaded.
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="inverted" />
    </>
  );
};

export default RootLayout;
