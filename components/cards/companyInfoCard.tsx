import { Company } from "@/db/schema";
import { useManifestStore } from "@/store/useManifestStore";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";

interface CompanyInfoCardProps {
  company: Company;
}

export const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  company,
}) => {
  const { companyName, id } = company;
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
      <ManifestCount id={id} />
    </View>
  );
};

interface ManifestCountProps {
  id: number;
}

function ManifestCount({ id }: ManifestCountProps) {
  const { manifests } = useManifestStore();

  const manifestCount = manifests?.filter(
    (manifest) =>
      manifest?.companyId?.toString() === id?.toString() &&
      manifest?.status === "active"
  );

  return (
    <Text className="font-geistSemiBold text-base mt-2  text-neutral-900">
      <Text className="text-neutral-500">Active Manifests: </Text>
      <Text className="text-xl"> {manifestCount?.length}</Text>
    </Text>
  );
}
