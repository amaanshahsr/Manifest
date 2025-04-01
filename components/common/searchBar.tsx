import React, { memo, useCallback } from "react";
import { Pressable, TextInput, View, Text } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  search: string;
  setSearch: (text: string) => void;
  placeholder?: string;
}

const CustomSearchBar: React.FC<SearchBarProps> = memo(
  ({ search, setSearch, placeholder = "Search..." }) => {
    const handleClearSearch = useCallback(() => {
      setSearch("");
    }, [setSearch]);

    return (
      <View className="py-2 mx-6">
        <View style={{ elevation: 4 }} className="relative min-h-14 rounded-lg">
          <TextInput
            placeholder={placeholder}
            className="border-[0.7px] relative rounded-lg p-4 h-14 border-zinc-300 bg-white placeholder:text-gray-400 font-geistMedium"
            onChangeText={setSearch}
            value={search}
          />
          <View className="absolute top-1/4 right-3">
            {search?.length ? (
              <Pressable onPress={handleClearSearch}>
                <AntDesign name="closecircle" size={24} color="black" />
              </Pressable>
            ) : (
              <Ionicons name="search" size={24} color="black" />
            )}
          </View>
        </View>
      </View>
    );
  }
);

export default CustomSearchBar;
