import { companies, manifests, trucks } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { eq, sql } from "drizzle-orm";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useRef, useState } from "react";
import { View, Platform } from "react-native";
import CustomModal, { ModalRef } from "@/components/common/customModal";
import { Pressable } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system"; // For Android
import * as Sharing from "expo-sharing";
import PageHeader from "@/components/common/pageHeader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import DatePicker from "@/components/common/datePicker";
import { CompletedManifests, DayItem } from "@/types";
import ListComponent from "@/components/reports/listComponent";
import ToastMessage from "@/components/common/ToastMessage";
import { toast } from "@backpackapp-io/react-native-toast";

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

  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true); // Start refreshing
    const { startTimestamp, endTimestamp } =
      getUnixDayRangeFromDateString(currentDate);
    const results = await getCompleteManifests(startTimestamp, endTimestamp);
    setCompletedManifests(results);
    setRefreshing(false); // Stop refreshing
  };

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

  const generateCSV = (data: CompletedManifests[], currentDate: string) => {
    const headers = ["Date", "Manifest Number", "Registration", "Company Name"];
    const csvHeaders = headers.join(",") + "\n";

    const csvRows = data
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

    return csvHeaders + csvRows;
  };

  const writeCSVToFile = async (filename: string, content: string) => {
    if (!FileSystem.cacheDirectory) {
      throw new Error("Cache directory not available");
    }

    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    return fileInfo.uri;
  };
  const handleDownload = async () => {
    try {
      const csvContent = generateCSV(completedManifests, currentDate);
      const filename = `${currentDate}_report.csv`;

      const fileUri = await writeCSVToFile(filename, csvContent);
      await saveFile(fileUri, filename, "text/csv");

      console.log("File shared successfully");
    } catch (error) {
      console.error("Error saving CSV:", error);
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Error saving CSV file! ❌"
            toast={toast}
            type="error"
          />
        ),
      });
    }
  };

  async function saveFile(uri: string, filename: string, mimetype: string) {
    try {
      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          console.warn("Storage permission denied. Falling back to sharing.");
          return await Sharing.shareAsync(uri);
        }

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const newFileUri =
          await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            filename,
            mimetype
          );

        await FileSystem.writeAsStringAsync(newFileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error("Error saving or sharing file:", error);
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Something went wrong while saving the file. ❌"
            toast={toast}
            type="error"
          />
        ),
      });
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
          <DatePicker handlePress={handlePress} initialDate={currentDate} />
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
      <ListComponent
        completedManifests={completedManifests}
        handleDownload={handleDownload}
        handleRefresh={handleRefresh}
        refreshing={refreshing}
        key="Reports"
      />
    </View>
  );
};

export default Index;
