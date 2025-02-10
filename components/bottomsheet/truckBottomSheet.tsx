import { capitalizeWord } from "@/utils/utils";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { trucks as truck_table } from "@/db/schema";
import InputField from "../common/inputField";
import CustomBackdrop from "./backdrop";

interface TruckBottomSheetProps {
  refresh: () => Promise<void>;
  truckId?: string;
}
export function TruckBottomSheet({ refresh, truckId }: TruckBottomSheetProps) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const truckStatus = ["active", "repair"];
  const [registration, setRegistration] = useState("");
  const [driverName, setDriverName] = useState("");
  const [status, setStatus] = useState<"active" | "repair">("active");

  const handleSave = async () => {
    const trimmedRegistration = registration.trim();
    const trimmedDriverName = driverName.trim();

    // Validation checks
    if (!trimmedRegistration) {
      alert("Please enter a valid registration number.");
      return;
    }

    //! TODO - add regex for License validation
    // if (!/^[A-Z]{2}\d{1,2}[A-Z]{0,2}\d{4}$/.test(trimmedRegistration)) {
    //   alert("Registration format is invalid. Expected format: 'KL-43-P1234'.");
    //   return;
    // }

    if (!trimmedDriverName) {
      alert("Please enter a valid driver name.");
      return;
    }

    if (trimmedDriverName.length < 3) {
      alert("Driver name must be at least 3 characters long.");
      return;
    }

    if (!["active", "repair"].includes(status)) {
      alert("Please select a valid status.");
      return;
    }

    try {
      if (truckId && truckId !== "new") {
        // Update the existing truck
        await drizzleDb
          .update(truck_table)
          .set({
            driverName: trimmedDriverName,
            registration: trimmedRegistration,
            status: status,
          })
          .where(eq(truck_table.id, Number(truckId)));

        alert("Truck info updated successfully!");
      } else {
        // Insert a new truck
        await drizzleDb.insert(truck_table).values({
          driverName: trimmedDriverName,
          registration: trimmedRegistration,
          status: status,
        });

        alert("Truck info saved successfully!");
      }

      // Refresh or update the truck list after saving
      await refresh();
      //route back to the List UI
      router?.push("/trucks");
    } catch (error) {
      console.error("Error while saving truck info:", error);
      alert("An error occurred while saving the truck info.");
    }
  };
  const router = useRouter();

  // Fetch the truck details using the truckId in LocalSearchParams (passed as props)
  const fetchActiveTruck = async (id: string) => {
    const activeTruck = await drizzleDb
      .select()
      .from(truck_table)
      .where(eq(truck_table?.id, Number(id)));
    return activeTruck;
  };

  useEffect(() => {
    if (!truckId) return;
    fetchActiveTruck(truckId).then((result) => {
      setRegistration(result[0]?.registration);
      setStatus(result[0]?.status);
      setDriverName(result[0]?.driverName);
    });
  }, []);
  const snapPoints = useMemo(() => [450, 450, 600], []);
  return (
    <BottomSheet
      snapPoints={snapPoints}
      backdropComponent={CustomBackdrop}
      onClose={() => router?.push("/trucks")}
      enablePanDownToClose={true}
      ref={bottomSheetRef}
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.51,
        shadowRadius: 13.16,
        elevation: 20,
      }}
      onChange={handleSheetChanges}
    >
      <BottomSheetView className="px-6 min-h-[50vh] z-50">
        <InputField
          value={registration}
          onChangeText={setRegistration}
          key="registration"
          label="Registration"
        />
        <InputField
          value={driverName}
          onChangeText={setDriverName}
          key="name"
          label="Name"
        />
        <View className="flex flex-row gap-4 justify-stretch  mt-6">
          {truckStatus?.map((stat) => {
            return (
              <Pressable
                onPress={() => setStatus(stat as "active" | "repair")}
                className={` flex-1 border  rounded-md p-4 ${
                  status === stat ? "bg-black text-white" : ""
                } `}
              >
                <Text
                  className={`font-geistMedium ${
                    status === stat ? " text-white" : ""
                  } `}
                >
                  {capitalizeWord(stat)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={handleSave}
          className="bg-neutral-900 px-3 py-4 rounded-lg flex items-center justify-center mt-auto"
        >
          <Text className="text-white font-geistSemiBold ">Save</Text>
        </Pressable>
        <Pressable
          onPress={() => router?.push("/trucks")}
          className="bg-gray-100 px-3 py-4 rounded-lg flex items-center justify-center mt-3"
        >
          <Text className="text-neutral-600 font-geistSemiBold ">Back</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
