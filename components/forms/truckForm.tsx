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
import PageHeader from "../common/pageHeader";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import {
  resolveValue,
  toast,
  ToastPosition,
} from "@backpackapp-io/react-native-toast";
import ToastMessage from "../common/ToastMessage";

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
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Invalid Registration number.  ⚠️"
            toast={toast}
            type="warning"
          />
        ),
      });
      return false;
    }

    //! TODO - add regex for License validation
    // if (!/^[A-Z]{2}\d{1,2}[A-Z]{0,2}\d{4}$/.test(trimmedRegistration)) {
    //   alert("Registration format is invalid. Expected format: 'KL-43-P1234'.");
    //   return false;
    // }

    if (!trimmedDriverName) {
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Please enter a valid driver name.  ⚠️"
            toast={toast}
            type="warning"
          />
        ),
      });
      return false;
    }

    if (trimmedDriverName.length < 3) {
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Name must be atleast 3 characters long.  ⚠️"
            toast={toast}
            type="warning"
          />
        ),
      });
      return false;
    }

    if (!["active", "repair"].includes(status)) {
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Please select a valid status.  ⚠️"
            toast={toast}
            type="warning"
          />
        ),
      });
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
      // Update the loading toast to a success toast
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Truck info saved successfully 🎉"
            toast={toast}
            type="success"
          />
        ),
      });

      setTimeout(() => {
        router?.push("/trucks");
      }, 25);
    } catch (error) {
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Error while saving truck info  ❌"
            toast={toast}
            type="error"
          />
        ),
      });
      console.error("Error while saving truck info:", error);
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
    <View>
      <PageHeader
        backRoute="/(tabs)/trucks"
        title={`${truckId === "new" ? "Add New Truck" : "Edit Truck Details"}`}
      ></PageHeader>
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
          className="bg-neutral-900 px-4 py-4 rounded-2xl flex-row items-center justify-center gap-2 space-x-2"
        >
          <MaterialCommunityIcons
            name="content-save-outline"
            size={18}
            color="white"
          />
          <Text className="text-white font-geistSemiBold text-base">Save</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router?.push("/trucks");
          }}
          className="bg-gray-100 px-4 py-4 rounded-2xl flex-row items-center justify-center gap-2 space-x-2"
        >
          <Ionicons name="arrow-back-sharp" size={24} color="black" />

          <Text className="text-neutral-700 font-geistSemiBold text-base">
            Back
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TruckForm;
