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
  interpolateColor,
  startMapper,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSQLiteContext } from "expo-sqlite";
import useCleanupOnExit from "@/hooks/useCleanupOnExit";
import { StatusBadge } from "../truck/truckStatusBadge";
import { Switch } from "../truck/switch";

const TruckForm = () => {
  useReturnToHome({ route: "/trucks" });
  const db = useSQLiteContext();

  const [registration, setRegistration] = useState("");
  const [driverName, setDriverName] = useState("");
  const [status, setStatus] = useState<"active" | "repair">("active");
  const router = useRouter();
  const pathname = usePathname();
  const truckId = pathname?.split("/")[2];
  const { addToDatabase } = useSaveToDatabase();
  const {
    trucksWithActiveManifests: trucks,
    fetchTrucks,
    fetchTrucksWithActiveManifests,
  } = useTruckStore();
  useCleanupOnExit(cleanUp);

  function cleanUp() {
    setDriverName("");
    setRegistration("");
    setStatus("active");
  }

  const validateInputs = (
    registration: string,
    driverName: string,
    status: string
  ): boolean => {
    const trimmedRegistration = registration.trim();
    const trimmedDriverName = driverName.trim();

    if (!trimmedRegistration) {
      alert("Please enter a valid registration number.");
      return false;
    }

    //! TODO - add regex for License validation
    // if (!/^[A-Z]{2}\d{1,2}[A-Z]{0,2}\d{4}$/.test(trimmedRegistration)) {
    //   alert("Registration format is invalid. Expected format: 'KL-43-P1234'.");
    //   return false;
    // }

    if (!trimmedDriverName) {
      alert("Please enter a valid driver name.");
      return false;
    }

    if (trimmedDriverName.length < 3) {
      alert("Driver name must be at least 3 characters long.");
      return false;
    }

    if (!["active", "repair"].includes(status)) {
      alert("Please select a valid status.");
      return false;
    }

    return true;
  };

  const handleDatabaseAction = async (
    actionType: "new" | "edit",
    item: object,
    id?: string
  ) => {
    await addToDatabase({ actionType, item, table: truck_table, id });
  };

  const handleSave = async () => {
    if (!validateInputs(registration, driverName, status)) return;

    const trimmedRegistration = registration.trim();
    const trimmedDriverName = driverName.trim();

    try {
      const truckData = {
        driverName: trimmedDriverName,
        registration: trimmedRegistration,
        status,
      };

      if (truckId && truckId !== "new") {
        await handleDatabaseAction("edit", truckData, truckId);
      } else {
        await handleDatabaseAction("new", truckData);
      }

      // Reset form fields
      setDriverName("");
      setRegistration("");
      setStatus("active");

      // Refresh and navigate
      await fetchTrucksWithActiveManifests(db);
      router?.push("/trucks");
      alert("Truck info saved successfully!");
    } catch (error) {
      console.error("Error while saving truck info:", error);
      alert("An error occurred while saving the truck info.");
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

    return () => {
      // Reset form fields
      setDriverName("");
      setRegistration("");
      setStatus("active");
    };
  }, [truckId]);

  const truckStatus = ["active", "repair"];

  const handleStatus = (status: string) => {
    setStatus(status as "active" | "repair");
  };

  return (
    <View className="px-6 z-50 mt-5">
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
      <Switch
        handleStatus={handleStatus}
        status={status}
        options={truckStatus as ("active" | "repair")[]}
      >
        <StatusBadge status={status} />
      </Switch>
      <Pressable
        onPress={handleSave}
        className="bg-neutral-900 px-3 py-4 rounded-lg mt-56 flex items-center justify-center "
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
