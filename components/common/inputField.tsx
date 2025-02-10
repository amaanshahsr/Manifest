import React from "react";
import { Text, TextInput, View } from "react-native";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "Enter here...", // Default placeholder
}) => {
  return (
    <View className="mb-4">
      <Text className="text-base text-neutral-800 font-geistMedium">
        {label}
      </Text>
      <View className="relative rounded-lg">
        <TextInput
          placeholder={placeholder}
          className="border-[0.7px] relative rounded-lg p-4 h-14 border-zinc-300 bg-white mt-2 placeholder:text-gray-400 font-geistMedium"
          onChangeText={onChangeText}
          value={value}
        />
      </View>
    </View>
  );
};

export default InputField;
