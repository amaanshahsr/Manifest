import { Manifest } from "@/db/schema";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, Pressable } from "react-native";

interface ManifestInfoCardProps {
  manifest: Manifest;
}
const ManifestInfoCard: React.FC<ManifestInfoCardProps> = ({ manifest }) => {
  const router = useRouter();

  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="bg-white h-auto w-[92.5%] mt-5 rounded-xl p-6 mx-auto"
    >
      <View className="flex-row justify-between items-center">
        <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {manifest?.manifestId}
        </Text>
        {/* <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {companyName}
        </Text> */}
        <Pressable
          onPress={() =>
            router?.push({
              pathname: "/manifests",
              params: { id: manifest?.id }, // Push a valid ID as searchParams so the TruckSheet Component know's we are editing truck details
            })
          }
        >
          <Text>
            <Feather name="edit" size={24} color="#1e293b" /> {/* Edit Icon */}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ManifestInfoCard;
