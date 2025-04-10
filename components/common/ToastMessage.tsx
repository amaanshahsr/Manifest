import { Toast } from "@backpackapp-io/react-native-toast";
import React from "react";
import { View, Text } from "react-native";

interface ToastMessageProps {
  toast: Toast;
  message: string;
  type: "error" | "success" | "warning";
}

const colors = {
  error: "bg-red-500",
  success: "bg-emerald-500",
  warning: "bg-orange-500",
};

export const ToastMessage = ({ toast, type, message }: ToastMessageProps) => {
  return (
    <View
      style={{
        width: toast.width,
      }}
      className="bg-white rounded-xl shadow-md flex-row items-center space-x-2 overflow-hidden"
    >
      {/* Green success accent */}
      <View className={`h-full w-1 ${colors[type]}  rounded-l-xl`} />

      {/* Main message */}
      <Text className="text-neutral-700 p-5 font-geistSemiBold text-lg">
        {message}
      </Text>
    </View>
  );
};

export default ToastMessage;
