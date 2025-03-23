import { FlashList } from "@shopify/flash-list";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { CompanyInfoCard } from "../cards/companyInfoCard";
import { CompanyWithActiveManifests } from "@/types";
import AddNewButton from "../common/addNewButton";

interface ListComponentProps {
  fetchCompanyWithActiveManifests: (
    db: SQLiteDatabase,
    id?: number
  ) => Promise<void>;
  comapaniesWithActiveManifests: CompanyWithActiveManifests[];
  search: string;
}

export const ListComponent = ({
  fetchCompanyWithActiveManifests,
  comapaniesWithActiveManifests,

  search,
}: ListComponentProps) => {
  const db = useSQLiteContext();

  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true); // Start refreshing
    await fetchCompanyWithActiveManifests(db); // Fetch new data
    setRefreshing(false); // Stop refreshing
  };

  if (refreshing) {
    return (
      <View className="w-full flex-1 ">
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <FlashList
      contentContainerStyle={{ paddingHorizontal: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing} // Pass the refreshing state
          onRefresh={handleRefresh} // Trigger refresh on pull-to-refresh
        />
      }
      className="mb-1"
      data={comapaniesWithActiveManifests?.filter((company) =>
        company?.companyName?.includes(search?.trim())
      )}
      renderItem={({ item }) => <CompanyInfoCard company={item} />}
      estimatedItemSize={60}
      keyExtractor={(company) => company?.id?.toString()}
      numColumns={1}
    />
  );
};
