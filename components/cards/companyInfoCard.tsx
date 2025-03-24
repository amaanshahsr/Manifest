import { CompanyWithActiveManifests } from "@/types";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";

interface CompanyInfoCardProps {
  company: CompanyWithActiveManifests;
  handleModalOpen: (data: CompanyWithActiveManifests) => void;
}

export const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  company,
  handleModalOpen,
}) => {
  const { companyName, id } = company;
  const router = useRouter();
  const activeManifestCount = company?.manifests?.length;

  return (
    <Animated.View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="bg-white w-full h-auto  mt-5 rounded-xl p-6 mx-auto "
    >
      <View className="flex-row justify-between mb-5 items-center">
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
      <TouchableOpacity
        onPress={() => handleModalOpen(company)}
        className="flex flex-row  gap-3 items-center justify-between"
      >
        <ManifestCount count={activeManifestCount} />
        {activeManifestCount > 0 ? (
          <TouchableOpacity
            // onPress={spinChevron}
            activeOpacity={0.7}
            className="flex flex-row items-center  py-2 px-3  rounded-full bg-gray-200"
          >
            <Text
              className={`text-neutral-800 font-geistSemiBold text-base ${""}`}
            >
              View
            </Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface ManifestCountProps {
  count: number;
}

function ManifestCount({ count }: ManifestCountProps) {
  return (
    <Text className="font-geistSemiBold text-base   flex flex-row items-center text-neutral-900">
      <Text className="text-neutral-500">Active Manifests: </Text>
      <Text className="text-xl">{count}</Text>
    </Text>
  );
}
