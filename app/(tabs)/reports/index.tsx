import { companies, manifests, trucks } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { eq, sql } from "drizzle-orm";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useRef, useState } from "react";
import { Button, View, Text, Platform, TouchableOpacity } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import CustomModal, { ModalRef } from "@/components/common/customModal";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system"; // For Android
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import PageHeader from "@/components/common/pageHeader";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
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

  const handlePress = async (selectedDate: DayItem) => {
    setCurrentDate(selectedDate?.fullDate);
    // setCurrentDate(formatDateToDDMMYYYY(selectedDate?.dateString));
    // Create start and end of day boundaries
    const startOfDay = dayjs(selectedDate?.fullDate, "DD-MM-YYYY")
      .startOf("day")
      .toDate();

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = dayjs(selectedDate?.fullDate, "DD-MM-YYYY")
      .startOf("day")
      .toDate();
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
    modalRef?.current?.close();
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

      <View className="flex-1 flex items-center">
        {completedManifests?.length === 0 ? (
          <View className="flex items-center justify-center p-6">
            <AntDesign name="inbox" size={40} color="#999" className="mb-3" />
            <Text className="text-lg font-geistMedium text-gray-600 text-center">
              No completed trips for this date.
            </Text>
          </View>
        ) : (
          <View className="">
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
            <View className="flex-1 w-full">
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
          </View>
        )}
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

type DayItem = {
  date: number;
  day: string;
  fullDate: string;
  isToday: boolean;
  isOverflowDate: boolean;
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DatePickerProps {
  handlePress: (val: DayItem) => void;
}

const DatePicker = ({ handlePress }: DatePickerProps) => {
  const [dates, setDates] = useState<(DayItem | string | null)[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<DayItem | null>(null);

  const generateCalendarArray = (month: dayjs.Dayjs): (DayItem | null)[] => {
    const startOfMonth = month.startOf("month");
    const endOfMonth = month.endOf("month");
    const daysInMonth = endOfMonth.date();
    const startDayOfWeek = startOfMonth.day(); // 0 (Sun) - 6 (Sat)

    const monthDays: DayItem[] = Array.from({ length: daysInMonth }, (_, i) => {
      const date = startOfMonth.add(i, "day");
      return {
        date: date.date(),
        day: date.format("ddd"),
        fullDate: date.format("DD-MM-YYYY"),
        isToday: date.isSame(dayjs(), "day"),
        isOverflowDate: false,
      };
    });

    const paddedStart = Array(startDayOfWeek).fill(null);
    const totalGridSlots = 42;
    const paddedEnd = Array(
      totalGridSlots - paddedStart.length - monthDays.length
    ).fill(null);

    return [...days, ...paddedStart, ...monthDays, ...paddedEnd];
  };

  useEffect(() => {
    setDates(generateCalendarArray(currentMonth));
  }, [currentMonth]);

  const goToPreviousMonth = () =>
    setCurrentMonth((prev) => prev.subtract(1, "month"));
  const goToNextMonth = () => setCurrentMonth((prev) => prev.add(1, "month"));

  function onPress(item: DayItem) {
    setSelectedDate(item);
    handlePress(item);
  }
  return (
    <FlashList
      data={dates}
      numColumns={7}
      estimatedItemSize={70}
      contentContainerStyle={{
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 40,
      }}
      ListHeaderComponent={
        <View className="flex-row items-center justify-between mb-4 px-2">
          <Pressable
            onPress={goToPreviousMonth}
            style={{
              padding: 12,
              backgroundColor: "#e5e5e5",
              borderRadius: 9999,
            }}
          >
            <Ionicons name="chevron-back" size={20} color="black" />
          </Pressable>
          <Text className="text-neutral-900 font-geistSemiBold text-2xl tracking-tight">
            {currentMonth.format("MMMM YYYY")}
          </Text>
          <Pressable
            onPress={goToNextMonth}
            style={{
              padding: 12,
              backgroundColor: "#e5e5e5",
              borderRadius: 9999,
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="black" />
          </Pressable>
        </View>
      }
      renderItem={({ item }) =>
        !item ? (
          <View className="aspect-square flex-1 m-[2px] rounded-lg" />
        ) : typeof item === "string" ? (
          <View className="aspect-square flex-1 m-[2px] rounded-lg items-center justify-center">
            <Text className="text-base font-geistRegular font-semibold text-neutral-500">
              {item}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => onPress(item)}
            activeOpacity={0.7}
            className={`aspect-square flex-1 m-[2px] rounded-xl items-center justify-center border ${
              item.isToday
                ? "border-black font-geistMedium"
                : selectedDate?.fullDate === item?.fullDate
                ? "bg-black"
                : "border-neutral-200"
            }`}
          >
            <Text
              className={`${
                selectedDate?.fullDate === item?.fullDate
                  ? "font-geistMedium text-white"
                  : "font-geistRegular text-black"
              }    text-lg  font-semibold `}
            >
              {item.date}
            </Text>
          </TouchableOpacity>
        )
      }
      extraData={selectedDate}
      keyExtractor={(item, index) =>
        typeof item === "object" && item
          ? item?.fullDate + index
          : typeof item === "string"
          ? item
          : `empty-${index}`
      }
    />
  );
};
