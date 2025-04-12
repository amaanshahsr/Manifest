import { days } from "@/constants";
import { DayItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import { Pressable, Text } from "react-native-gesture-handler";

interface DatePickerProps {
  handlePress: (val: DayItem) => void;
  initialDate?: string;
}

const DatePicker = React.memo(
  ({ handlePress, initialDate }: DatePickerProps) => {
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState<string | null>(
      initialDate || null
    );

    const generateCalendarArray = useCallback(
      (month: dayjs.Dayjs): (DayItem | string | null)[] => {
        const startOfMonth = month.startOf("month");
        const endOfMonth = month.endOf("month");
        const daysInMonth = endOfMonth.date();
        const startDayOfWeek = startOfMonth.day(); // 0 (Sun) - 6 (Sat)

        const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
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
      },
      []
    );

    const dates = useMemo(
      () => generateCalendarArray(currentMonth),
      [currentMonth, generateCalendarArray]
    );

    const goToPreviousMonth = useCallback(
      () => setCurrentMonth((prev) => prev.subtract(1, "month")),
      []
    );

    const goToNextMonth = useCallback(
      () => setCurrentMonth((prev) => prev.add(1, "month")),
      []
    );

    const onPress = useCallback(
      (item: DayItem) => {
        setSelectedDate(item?.fullDate);
        handlePress(item);
      },
      [handlePress]
    );

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
              className={`aspect-square flex-1 m-[2px] rounded-xl items-center justify-center border 
                ${
                  item?.fullDate === selectedDate
                    ? "bg-black"
                    : item?.isToday
                    ? ""
                    : "bg-white border-neutral-200"
                } 
              `}
            >
              <Text
                className={`  ${
                  item?.fullDate === selectedDate
                    ? "font-geistMedium text-white"
                    : item?.isToday
                    ? "font-geistRegular text-black"
                    : "font-geistRegular text-black"
                } text-lg  font-semibold `}
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
  }
);

export default DatePicker;
