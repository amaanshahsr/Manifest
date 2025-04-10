import { Link, router } from "expo-router";
import { useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import * as SQLite from "expo-sqlite";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-geistSemiBold text-neutral-900 mb-2 text-center">
        Welcome to your Manifest Tracker 📦
      </Text>
      <Text className="text-base text-neutral-600 mb-6 text-center">
        Keep track of your daily manifests with ease.
      </Text>

      <Pressable
        onPress={() => router.push("/companies")}
        className="bg-black px-6 py-3 rounded-full"
      >
        <Text className="text-white font-geistMedium text-base">
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
