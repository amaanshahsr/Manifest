import { FlashList } from "@shopify/flash-list";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { CompanyInfoCard } from "../cards/companyInfoCard";
import { CompanyWithActiveManifests } from "@/types";
import NoResultsFound from "../common/noResultsFound";

interface ListComponentProps {
  fetchCompanyWithActiveManifests: (
    db: SQLiteDatabase,
    id?: number
  ) => Promise<void>;
  comapaniesWithActiveManifests: CompanyWithActiveManifests[];
  search: string;
  handleModalOpen: (data: CompanyWithActiveManifests) => void;
}

export const ListComponent = ({
  fetchCompanyWithActiveManifests,
  comapaniesWithActiveManifests,
  handleModalOpen,
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
      <View className="w-full flex-1 bg-red-600">
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <FlashList
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
      ListEmptyComponent={() => {
        return (
          <View className="w-full h-full ">
            <NoResultsFound text="No Companies found." />
          </View>
        );
      }}
      contentContainerStyle={{
        paddingTop: 12, // 👈 top space before the first item
        paddingBottom: 24, // 👈 bottom space after the last item (optional)
        paddingHorizontal: 16, // 👈 optional side padding
      }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      renderItem={({ item }) => (
        <CompanyInfoCard handleModalOpen={handleModalOpen} company={item} />
      )}
      estimatedItemSize={60}
      keyExtractor={(company) => company?.id?.toString()}
      numColumns={1}
    />
  );
};
