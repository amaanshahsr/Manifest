import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputFieldProps<T extends string | number> {
  label: string;
  value: T;
  onChangeText: (text: T) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
}

const InputField = <T extends string | number>({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder = "Enter here...", // Default placeholder
}: InputFieldProps<T>) => {
  const handleTextChange = (text: string) => {
    const parsedValue = (typeof value === "number" ? Number(text) : text) as T;
    onChangeText(parsedValue);
  };
  return (
    <View className="mb-4">
      <Text className="text-lg text-neutral-800 font-geistMedium">{label}</Text>
      <View className="relative rounded-lg">
        <TextInput
          keyboardType={keyboardType}
          placeholder={placeholder}
          className="border-[0.7px] relative text-base rounded-lg p-4 h-14 border-zinc-300 bg-white mt-2 placeholder:text-gray-400 font-geistMedium"
          onChangeText={handleTextChange}
          value={String(value)}
        />
      </View>
    </View>
  );
};

export default InputField;
