import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect } from "react";
import "../globals.css";
import * as SQLite from "expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, Text } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../drizzle/migrations";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toasts } from "@backpackapp-io/react-native-toast";
const expo = SQLite.openDatabaseSync("data.db");
const db = drizzle(expo);
const RootLayout = () => {
  SplashScreen.preventAutoHideAsync();
  const { success, error } = useMigrations(db, migrations); // ! TODO  - Make better use of this
  useDrizzleStudio(expo);
  const [loaded] = useFonts({
    "Geist-Light": require("../assets/fonts/Geist-Light.ttf"),
    "Geist-Regular": require("../assets/fonts/Geist-Regular.ttf"),
    "Geist-Medium": require("../assets/fonts/Geist-Medium.ttf"),
    "Geist-SemiBold": require("../assets/fonts/Geist-SemiBold.ttf"),

    "Geist-ExtraBold": require("../assets/fonts/Geist-ExtraBold.ttf"),
    "Geist-Bold": require("../assets/fonts/Geist-Bold.ttf"),
    "Geist-Black": require("../assets/fonts/Geist-Black.ttf"),
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
  if (error) {
    return (
      <View>
        <Text>Migration Error </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <Suspense
        fallback={
          <View className="w-full h-full flex-1">
            <ActivityIndicator size="large" />
          </View>
        }
      >
        <SQLiteProvider
          databaseName="data.db"
          options={{ enableChangeListener: true }}
          useSuspense
        >
          <SafeAreaProvider>
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
            <Toasts />
          </SafeAreaProvider>
        </SQLiteProvider>
        <StatusBar style="inverted" />
      </Suspense>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
