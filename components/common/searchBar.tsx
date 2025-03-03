import React from "react";
import { Pressable, TextInput, View, Text } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  search: string;
  setSearch: (text: string) => void;
  placeholder?: string;
}

const CustomSearchBar: React.FC<SearchBarProps> = ({
  search,
  setSearch,
  placeholder = "Search...", // Default placeholder
}) => {
  return (
    <View className="py-2 mx-6">
      <View style={{ elevation: 4 }} className="relative rounded-lg">
        <TextInput
          placeholder={placeholder}
          className="border-[0.7px] relative rounded-lg p-4 h-14 border-zinc-300 bg-white placeholder:text-gray-400 font-geistMedium"
          onChangeText={setSearch}
          value={search}
        />
        <View className="absolute top-1/2 right-3 -translate-y-1/2">
          {search?.length ? (
            <Pressable onPress={() => setSearch("")}>
              <Text>
                <AntDesign name="closecircle" size={24} color="black" />
              </Text>
            </Pressable>
          ) : (
            <Text>
              <Ionicons name="search" size={24} color="black" />
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default CustomSearchBar;
