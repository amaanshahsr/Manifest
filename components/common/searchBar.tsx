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
      <View
        style={{ elevation: 2 }}
        className="relative flex-1 min-h-14 rounded-lg"
      >
        <TextInput
          placeholder={placeholder}
          className="relative rounded-lg p-3 h-14  bg-neutral-200 placeholder:text-neutral-600 font-geistMedium"
          onChangeText={setSearch}
          value={search}
        />
        <View className="absolute top-1/4 right-3">
          {search?.length ? (
            <Pressable onPress={handleClearSearch}>
              <AntDesign name="closecircle" size={24} color="#525252" />
            </Pressable>
          ) : (
            <Ionicons name="search" size={24} color="#525252" />
          )}
        </View>
      </View>
    );
  }
);

export default CustomSearchBar;
