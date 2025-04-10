import { companies, manifests, trucks } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { eq, sql } from "drizzle-orm";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useRef, useState } from "react";
import { Button, View, Text, Platform, TouchableOpacity } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import CustomModal, { ModalRef } from "@/components/common/customModal";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { AntDesign, Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system"; // For Android
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import PageHeader from "@/components/common/pageHeader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import DatePicker from "@/components/common/datePicker";
import { DayItem } from "@/types";
interface CompletedManifests {
  manifestId: number;
  status: "completed" | "active" | "unassigned";
  completedOn: Date | null;
  createdAt: Date;
  companyId: number | null;
  assignedTo: number | null;
  registration: string;
  companyName: string;
}
dayjs.extend(customParseFormat);

const Index = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const modalRef = useRef<ModalRef>(null);

  // function formatDateToDDMMYYYY(passedDate: string): string {
  //   return passedDate?.split("-")?.reverse()?.join("-");
  // }
  const [currentDate, setCurrentDate] = useState(dayjs()?.format("DD-MM-YYYY"));

  const [completedManifests, setCompletedManifests] = useState<
    CompletedManifests[]
  >([]);

  function getUnixDayRangeFromDateString(dateString: string) {
    const start = dayjs(dateString, "DD-MM-YYYY").startOf("day").toDate();
    const end = dayjs(dateString, "DD-MM-YYYY").endOf("day").toDate();

    return {
      startTimestamp: Math.floor(start.getTime() / 1000),
      endTimestamp: Math.floor(end.getTime() / 1000),
    };
  }

  async function getCompleteManifests(
    startTimestamp: number,
    endTimestamp: number
  ) {
    try {
      const results = await drizzleDb
        .select({
          manifestId: manifests.manifestId,
          status: manifests.status,
          completedOn: manifests.completedOn,
          createdAt: manifests.createdAt,
          companyId: manifests.companyId,
          assignedTo: manifests.assignedTo,
          registration: trucks.registration, // Getting truck name
          companyName: companies.companyName, // Getting company name
        })
        .from(manifests)
        .innerJoin(trucks, eq(manifests.assignedTo, trucks.id))
        .innerJoin(companies, eq(manifests.companyId, companies.id))
        .where(
          sql`${manifests.completedOn} BETWEEN ${startTimestamp} AND ${endTimestamp}`
        )
        .execute();

      return results;
    } catch (error) {
      console.error("Error fetching complete manifests:", error);
      return [];
    }
  }

  const handlePress = async (selectedDate: DayItem) => {
    setCurrentDate(selectedDate?.fullDate);

    // Generate range of 12AM to 11:59PM
    const { endTimestamp, startTimestamp } = getUnixDayRangeFromDateString(
      selectedDate?.fullDate
    );

    const completedManifestsForDate = await getCompleteManifests(
      startTimestamp,
      endTimestamp
    );

    setCompletedManifests(completedManifestsForDate);
    modalRef?.current?.close();
  };

  const handleDownload = async () => {
    try {
      const csvHeaders =
        ["Date", "Manifest Number", "Registration", "Company Name"].join(",") +
        "\n";

      const csvRows = completedManifests
        .map((item) => {
          return [
            currentDate,
            item.manifestId,
            item.registration,
            item.companyName,
          ]
            .map((val) => String(val).replace(/"/g, "").trim())
            .join(",");
        })
        .join("\n");
      const csvContent = csvHeaders + csvRows;

      // Create file in document directory
      const filename = `${currentDate}_report.csv`;
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

      await saveFile(fileInfo?.uri, filename, "text/csv");

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

  useEffect(() => {
    const { endTimestamp, startTimestamp } =
      getUnixDayRangeFromDateString(currentDate);

    const fetchInitialCompletedManifest = async () => {
      const results = await getCompleteManifests(startTimestamp, endTimestamp);
      setCompletedManifests(results);
    };
    fetchInitialCompletedManifest();
  }, []);

  console.log("completefd manifests", completedManifests);

  return (
    <View className="flex-1 w-full h-full relative">
      <View>
        <CustomModal ref={modalRef} snapPoint="60%">
          <DatePicker handlePress={handlePress} />
        </CustomModal>
      </View>
      <PageHeader
        title={currentDate}
        headerRightItem={
          <Pressable onPress={() => modalRef?.current?.open()} className="p-2">
            <AntDesign name="calendar" size={28} color="black" />
          </Pressable>
        }
      ></PageHeader>

      {completedManifests?.length === 0 ? (
        <View className="flex items-center justify-center p-6">
          <AntDesign name="inbox" size={40} color="#999" className="mb-3" />
          <Text className="text-lg font-geistMedium text-gray-600 text-center">
            No completed trips for this date.
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-4">
          <Pressable
            style={{
              gap: 8,
              marginBlock: 10,
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
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
            <Text className="text-white font-geistSemiBold text-base">
              Export
            </Text>
            <Feather name="download" size={18} color="white" className="mr-2" />
          </Pressable>
          <FlashList
            data={completedManifests}
            keyExtractor={(item) => item.manifestId.toString()}
            renderItem={({ item }) => (
              <ManifestCard
                truckName={item.registration}
                companyName={item.companyName}
                manifestId={item.manifestId}
              />
            )}
            estimatedItemSize={80}
          />
        </View>
      )}
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
    <View className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 mb-3">
      {/* Header Row */}
      <View className="flex-row items-center gap-3 mb-3">
        <Text className="text-xl font-geistSemiBold text-neutral-900">
          {truckName}
        </Text>

        <View className="ml-auto bg-zinc-200 px-3 py-1 rounded-full">
          <Text className="text-base font-geistMedium text-neutral-700">
            Manifest No: {manifestId}
          </Text>
        </View>
      </View>

      {/* Company Row */}
      <View className="flex-row items-center gap-1 space-x-2 mt-1">
        <FontAwesome5 name="building" size={16} color="#4B5563" />
        <Text className="text-base font-geistMedium text-neutral-700">
          {companyName}
        </Text>
      </View>
    </View>
  );
};
