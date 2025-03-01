import InputField from "@/components/common/inputField";
import { capitalizeWord } from "@/utils/utils";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTruckStore } from "@/store/useTruckStore";
import { useSaveToDatabase } from "@/hooks/useSaveToDatabase";
import { trucks as truck_table } from "@/db/schema";
import useReturnToHome from "@/hooks/useReturnToHome";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSQLiteContext } from "expo-sqlite";

const TruckForm = () => {
  useReturnToHome({ route: "/trucks" });
  const db = useSQLiteContext();

  const truckStatus = ["active", "repair"];
  const [registration, setRegistration] = useState("");
  const [driverName, setDriverName] = useState("");
  const [status, setStatus] = useState<"active" | "repair">("active");
  const router = useRouter();
  const pathname = usePathname();
  const truckId = pathname?.split("/")[2];
  const { addToDatabase } = useSaveToDatabase();
  const { trucks, fetchTrucks } = useTruckStore();

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
        await addToDatabase({
          actionType: "edit",
          item: {
            driverName: trimmedDriverName,
            registration: trimmedRegistration,
            status: status,
          },
          table: truck_table,
          id: truckId,
        });
        alert("Truck info updated successfully!");
      } else {
        // Insert a new truck
        await addToDatabase({
          actionType: "new",
          item: {
            driverName: trimmedDriverName,
            registration: trimmedRegistration,
            status: status,
          },
          table: truck_table,
        });
        alert("Truck info saved successfully!");
      }

      setDriverName("");
      setRegistration("");
      setStatus("active");
      //route back to the List UI
    } catch (error) {
      console.error("Error while saving truck info:", error);
      alert("An error occurred while saving the truck info.");
    } finally {
      // Refresh or update the truck list after saving

      await fetchTrucks(db);
      router?.push("/trucks");
    }
  };

  // Fetch the truck details using the truckId in LocalSearchParams
  const fetchActiveTruck = async (id: string) => {
    const activeTruck = trucks?.filter((truck) => truck?.id === Number(id));
    return activeTruck;
  };

  useEffect(() => {
    if (!truckId || truckId === "new") return;
    fetchActiveTruck(truckId).then((result) => {
      setRegistration(result[0]?.registration);
      setStatus(result[0]?.status);
      setDriverName(result[0]?.driverName);
    });
  }, [truckId]);

  const translateXValue = useSharedValue(0);
  const animatedLeftStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(status === "active" ? 0 : "100%", {
            damping: 100,
            stiffness: 500,
            mass: 1,
          }),
        },
        {
          translateY: -8,
        },
      ],
    };
  });

  return (
    <View className="px-6 min-h-[50vh] z-50">
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
      <View className="flex flex-row gap-4 justify-stretch relative mt-6">
        <Animated.View
          // style={[animatedLeftStyle]}
          className="absolute top-2 left-0  w-1/2 rounded-md   bg-red-400/40 h-full z-50"
        ></Animated.View>
        {truckStatus?.map((stat) => {
          return (
            <Pressable
              key={stat}
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
                {capitalizeWord(stat) as string}
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
    </View>
  );
};

export default TruckForm;
