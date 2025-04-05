import { companies, manifests, trucks } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { eq, sql } from "drizzle-orm";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { Button, View, Text, Platform } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import CustomModal from "@/components/common/customModal";
import { Pressable } from "react-native-gesture-handler";
import { AntDesign, Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system"; // For Android
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
interface CompletedManifests {
  manifestId: number;
  status: "completed" | "active" | "unassigned";
  completedOn: Date | null;
  createdAt: Date;
  companyId: number | null;
  assignedTo: number | null;
  truckName: string;
  companyName: string;
}

const Index = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  function formatDateToDDMMYYYY(passedDate: string): string {
    return passedDate?.split("-")?.reverse()?.join("-");
  }
  const [currentDate, setCurrentDate] = useState(
    formatDateToDDMMYYYY(new Date()?.toISOString()?.split("T")[0])
  );

  const [completedManifests, setCompletedManifests] = useState<
    CompletedManifests[]
  >([]);

  const handlePress = async (selectedDate: DateData) => {
    setCurrentDate(formatDateToDDMMYYYY(selectedDate?.dateString));
    // Create start and end of day boundaries
    const startOfDay = new Date(selectedDate?.timestamp);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate?.timestamp);
    endOfDay.setHours(23, 59, 59, 999);

    // Convert to Unix timestamps (seconds)
    const startTimestamp = Math.floor(startOfDay.getTime() / 1000);
    const endTimestamp = Math.floor(endOfDay.getTime() / 1000);
    const results = await drizzleDb
      .select({
        manifestId: manifests.manifestId,
        status: manifests.status,
        completedOn: manifests.completedOn,
        createdAt: manifests.createdAt,
        companyId: manifests.companyId,
        assignedTo: manifests.assignedTo,
        truckName: trucks.registration, // Getting truck name
        companyName: companies.companyName, // Getting truck name
      })
      .from(manifests)
      .innerJoin(trucks, eq(manifests?.assignedTo, trucks?.id)) // Joining on assignedTo = truck.id
      .innerJoin(companies, eq(manifests?.companyId, companies?.id)) // Joining on assignedTo = truck.id

      .where(
        sql`${manifests.completedOn} BETWEEN ${startTimestamp} AND ${endTimestamp}`
      )
      .execute();
    setCompletedManifests(results);
    console.log("resultsss", results);
  };

  const handleDownload = async () => {
    try {
      const sampleData = [
        { manifestId: 17, truckName: "KL430UYY", companyName: "Studio Ghibli" },
        { manifestId: 18, truckName: "KL430UYY", companyName: "Studio Ghibli" },
      ];

      const csvHeaders = Object.keys(sampleData[0]).join(",") + "\n";
      const csvRows = sampleData
        .map((item) =>
          Object.values(item)
            .map((val) => `"${val}"`)
            .join(",")
        )
        .join("\n");
      const csvContent = csvHeaders + csvRows;

      // Create file in document directory
      const filename = "manifests.csv";
      // 2. Get cache directory path
      if (!FileSystem.cacheDirectory) {
        throw new Error("Cache directory not available");
      }

      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      // 3. Create and write file (single operation)
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      await saveFile(fileInfo?.uri, "tests.csv", "text/csv");

      console.log("File shared successfully");
    } catch (error) {
      console.error("Error saving CSV:", error);
      alert("Error saving CSV file! ❌");
    }
  };

  async function saveFile(uri: string, filename: string, mimetype: string) {
    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          mimetype
        )
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          })
          .catch((e) => console.log(e));
      } else {
        shareAsync(uri);
      }
    } else {
      shareAsync(uri);
    }
  }

  console.log("ajsdnkansd");
  const [isVisible, setisVisible] = useState(false);
  return (
    <View className="flex-1 w-full relative">
      <View className="flex flex-row items-center justify-between py-2 px-4">
        <Text className="font-geistMedium text-lg text-gray-700">
          {currentDate}
        </Text>
        <Pressable onPress={() => setisVisible(true)} className="p-2">
          <AntDesign name="calendar" size={28} color="black" />
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center">
        {completedManifests?.length === 0 ? (
          <View className="flex items-center justify-center p-6">
            <AntDesign name="inbox" size={40} color="#999" className="mb-3" />
            <Text className="text-lg font-geistMedium text-gray-600 text-center">
              No completed manifests for this date.
            </Text>
          </View>
        ) : (
          <View className="flex-1 w-full">
            <Pressable
              style={{
                marginBlock: 10,
                marginInline: "auto",
                flexDirection: "row",
                alignItems: "center",
                width: "95%",
                backgroundColor: "#262626", // neutral-800 ≈ #262626
                justifyContent: "center",
                paddingHorizontal: 16, // px-4 ≈ 16 (Tailwind: 1 unit = 4px)
                paddingVertical: 12, // py-3 ≈ 12
                borderRadius: 8, // rounded-lg ≈ 8
                shadowColor: "#000", // shadow-md (approximation)
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3, // Android shadow
              }}
              onPress={handleDownload}
            >
              <Feather
                name="download"
                size={20}
                color="white"
                className="mr-2"
              />
              <Text className="text-white font-geistSemiBold text-base">
                Export
              </Text>
            </Pressable>
            <FlashList
              data={completedManifests}
              keyExtractor={(item) => item.manifestId.toString()}
              renderItem={({ item }) => (
                <ManifestCard
                  truckName={item.truckName}
                  companyName={item.companyName}
                  manifestId={item.manifestId}
                />
              )}
              estimatedItemSize={80}
            />
          </View>
        )}
      </View>

      <View>
        <CustomModal
          onClose={() => setisVisible(false)}
          visible={isVisible}
          snapPoint="50%"
        >
          <Pressable>
            <Calendar
              onDayPress={handlePress}
              // Collection of dates that have to be marked. Default = {}
              markedDates={{
                "2012-05-16": {
                  selected: true,
                  marked: true,
                  selectedColor: "blue",
                },
                "2012-05-17": { marked: true },
                "2012-05-18": {
                  marked: true,
                  dotColor: "red",
                  activeOpacity: 0,
                },
                "2012-05-19": { disabled: true, disableTouchEvent: true },
              }}
            />
          </Pressable>
        </CustomModal>
      </View>
    </View>
  );
};

export default Index;

interface ManifestCardProps {
  truckName: string;
  companyName: string;
  manifestId: string | number;
}

const ManifestCard = ({
  truckName,
  companyName,
  manifestId,
}: ManifestCardProps) => {
  return (
    <View className="bg-white p-4 rounded-2xl shadow-md border border-gray-200 mb-3">
      <Text className="text-lg font-geistSemiBold text-gray-800">
        {truckName}
      </Text>
      <Text className="text-base text-gray-600">{companyName}</Text>
      <Text className="text-sm text-gray-500">Manifest ID: {manifestId}</Text>
    </View>
  );
};
