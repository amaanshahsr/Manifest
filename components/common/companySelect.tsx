import { CompanyInfoCard } from "@/app/(tabs)/companies";
import { Company, companies as company_table, Manifest } from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import SearchBar from "./searchBar";

interface SelectProps {
  handleSelect: (id: number) => void;
}
const CompanySelect: React.FC<SelectProps> = ({ handleSelect }) => {
  const {
    data: companies,
    loading,
    refresh,
  } = useDataFetch<Company>({
    table: company_table,
  });
  const [search, setSearch] = useState("");

  return (
    <View className="min-h-40  w-full  ">
      <SearchBar search={search} setSearch={setSearch} />
      <FlashList
        className="mb-1 max-h-40"
        data={companies?.filter((company) =>
          company?.companyName?.includes(search?.trim())
        )}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleSelect(item?.id)}>
            <View className="p-3 bg-white border-y">
              <Text>{item?.companyName}</Text>
            </View>
          </Pressable>
        )}
        estimatedItemSize={200}
        keyExtractor={(company) => company?.id?.toString()}
        numColumns={1}
      />
    </View>
  );
};

export default CompanySelect;
