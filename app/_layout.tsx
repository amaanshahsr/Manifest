import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect, useState } from "react";
import "../globals.css";
import * as SQLite from "expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import { ActivityIndicator } from "react-native";
import { SQLiteProvider } from "expo-sqlite";

const expo = SQLite.openDatabaseSync("data.db");

const RootLayout = () => {
  SplashScreen.preventAutoHideAsync();
  useDrizzleStudio(expo);
  const [loaded] = useFonts({
    "Geist-Light": require("../assets/fonts/Geist-Light.ttf"),
    "Geist-Regular": require("../assets/fonts/Geist-Regular.ttf"),
    "Geist-Medium": require("../assets/fonts/Geist-Medium.ttf"),
    "Geist-SemiBold": require("../assets/fonts/Geist-SemiBold.ttf"),

    "Geist-ExtraBold": require("../assets/fonts/Geist-ExtraBold.ttf"),
    "Geist-Bold": require("../assets/fonts/Geist-Bold.ttf"),
    "Geist-Black": require("../assets/fonts/Geist-Black.ttf"),

    // "Inter-Variable": require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
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
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName="data.db"
        options={{ enableChangeListener: true }}
        useSuspense
      >
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </SQLiteProvider>
      <StatusBar style="inverted" />
    </Suspense>
  );
};

export default RootLayout;
