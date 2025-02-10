import { CompanyBottomSheet } from "@/components/bottomsheet/companyBottomSheet";
import CustomSearchBar from "@/components/common/searchBar";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { Company, companies as company_table } from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { Feather, Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Companies = () => {
  const db = useSQLiteContext();
  const [search, setSearch] = useState("");
  const { id } = useLocalSearchParams();
  console.log("ajdnkasjndasdna", id);
  const {
    data: companies,
    loading,
    refresh,
  } = useDataFetch<Company>({
    db,
    table: company_table,
  });
  if (loading) {
    return (
      <View className="flex-1 w-full h-full  ">
        <FlashList
          data={Array(10).fill(null)}
          renderItem={() => <SkeletonLoader />}
          estimatedItemSize={10}
          keyExtractor={(_, index) => `skeleton-${index}`}
        />
      </View>
    );
  }

  if (companies === null || companies.length === 0) {
    return (
      <GestureHandlerRootView>
        <View className="flex-1 w-full h-full items-center justify-center">
          <AddNewButton />
          <CompanySheet refresh={refresh} />
        </View>
      </GestureHandlerRootView>
    );
  }
  return (
    <GestureHandlerRootView>
      <View className=" flex-1 w-full h-full">
        // Search Bar
        <CustomSearchBar search={search} setSearch={setSearch} />
        <AddNewButton />
        //Truck List
        <FlashList
          className="mb-1"
          data={companies?.filter((company) =>
            company?.companyName?.includes(search?.trim())
          )}
          renderItem={({ item }) => (
            <CompanyInfoCard company={item} handleUpdate={refresh} />
          )}
          estimatedItemSize={500}
          keyExtractor={(company) => company?.id?.toString()}
          numColumns={1}
        />
        // Drawer for Adding and Editing trucks
        <CompanySheet refresh={refresh} />
      </View>
    </GestureHandlerRootView>
  );
};

export default Companies;

const AddNewButton = () => {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        router?.push({
          pathname: "/companies",
          params: { id: "new" },
        });
      }}
      className="bg-neutral-900 px-3 py-4 rounded-lg w-11/12 mx-auto flex flex-row gap-2 items-center justify-center "
    >
      <Text className="text-white font-geistSemiBold ">Add New Company</Text>
      <Ionicons name="add-circle-sharp" size={18} color="white" />
    </Pressable>
  );
};

interface CompanyInfoCardProps {
  company: Company;
  handleUpdate: () => Promise<void>;
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
          onPress={() =>
            router?.push({
              pathname: "/companies",
              params: { id: id }, // Push a valid ID as searchParams so the TruckSheet Component know's we are editing truck details
            })
          }
        >
          <Feather name="edit" size={24} color="#1e293b" /> {/* Edit Icon */}
        </Pressable>
      </View>
    </View>
  );
};

interface CompanySheetProps {
  refresh: () => Promise<void>;
}

const CompanySheet: React.FC<CompanySheetProps> = ({ refresh }) => {
  const { id } = useLocalSearchParams();
  console.log("localsearchparsms", id);
  return id ? (
    <CompanyBottomSheet refresh={refresh} companyId={id as string} />
  ) : null;
};
