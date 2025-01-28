import { Link, router } from "expo-router";
import { Text, View, Pressable } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Pressable onPress={() => router?.push("/users")} className="bg-red-400">
        <Text>Press me</Text>
      </Pressable>
    </View>
  );
}
