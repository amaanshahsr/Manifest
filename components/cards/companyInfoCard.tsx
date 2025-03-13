import { Company } from "@/db/schema";
import { useManifestStore } from "@/store/useManifestStore";
import { CompanyWithActiveManifests } from "@/types";
import { Feather } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";

interface CompanyInfoCardProps {
  company: CompanyWithActiveManifests;
}

export const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  company,
}) => {
  const { companyName, id } = company;
  const router = useRouter();
  const activeManifestCount = company?.manifests?.length;
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
          {companyName}
        </Text>
        <Pressable
          onPress={() => {
            router?.push({
              pathname: `/companies/[id]`,
              params: { id: id?.toString() },
            });
          }}
        >
          <Text>
            <Feather name="edit" size={24} color="#1e293b" /> {/* Edit Icon */}
          </Text>
        </Pressable>
      </View>
      <ManifestCount count={activeManifestCount} />
    </View>
  );
};

interface ManifestCountProps {
  count: number;
}

function ManifestCount({ count }: ManifestCountProps) {
  return (
    <Text className="font-geistSemiBold text-base mt-2  text-neutral-900">
      <Text className="text-neutral-500">Active Manifests: </Text>
      <Text className="text-xl"> {count}</Text>
    </Text>
  );
}
