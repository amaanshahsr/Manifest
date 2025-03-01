import InputField from "@/components/common/inputField";
import { companies, Manifest, manifests } from "@/db/schema";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable } from "react-native";
import { View, Text } from "react-native";
import { useSaveToDatabase } from "@/hooks/useSaveToDatabase";
import { useManifestStore } from "@/store/useManifestStore";
import { DropDown } from "../common/dropdown";
import useReturnToHome from "@/hooks/useReturnToHome";
import { useSQLiteContext } from "expo-sqlite";
import { useCompanyStore } from "@/store/useCompanyStore";
import useCleanupOnExit from "@/hooks/useCleanupOnExit";

const ManifestForm = () => {
  useReturnToHome({ route: "/manifests" });
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const companyIdRef = useRef<number | null>(null);
  const db = useSQLiteContext();

  const { fetchManifests } = useManifestStore();
  const { companies } = useCompanyStore();

  // This function will reset inputs when screen goes out of focus
  function cleanUp() {
    setStart(0);
    setEnd(0);
    companyIdRef.current = null;
  }

  useCleanupOnExit(cleanUp);

  const { addToDatabase } = useSaveToDatabase();

  const validateInputs = (
    start: number,
    end: number,
    companyId: number | null
  ): boolean => {
    if (start === 0 && end === 0) {
      alert("Please enter a valid range.");
      return false;
    }
    if (end < start) {
      alert(
        "The start number must be less than the end number. Please enter a valid range."
      );
      return false;
    }
    if (!companyId) {
      alert("Please select a company to assign manifests to.");
      return false;
    }
    return true;
  };

  const generateManifestList = (
    start: number,
    end: number,
    companyId: number
  ): Omit<Manifest, "id">[] => {
    return Array.from({ length: end - start + 1 }, (_, index) => ({
      manifestId: start + index,
      status: "active",
      assignedTo: null,
      companyId,
    }));
  };

  const handleSave = async () => {
    const companyId = companyIdRef?.current;

    if (!validateInputs(start, end, companyId)) return;
    if (!companyId) return;
    const newManifests = generateManifestList(start, end, companyId);

    try {
      await addToDatabase({
        actionType: "new",
        item: newManifests,
        table: manifests,
      });

      alert("Manifests added successfully!");
    } catch (error) {
      console.error("Error while adding manifests:", error);
    } finally {
      // Reset states after addition
      setStart(0);
      setEnd(0);
      companyIdRef.current = null;

      // Refresh and navigate
      await fetchManifests(db);
      router?.push("/manifests");
    }
  };
  const router = useRouter();

  const handleUpdate = (value: string) => {
    companyIdRef.current = Number(value);
  };

  return (
    <View className="px-6 z-50 min-h-[50vh] ">
      <InputField
        value={start}
        onChangeText={setStart}
        key="start"
        keyboardType="numeric"
        label="Start Manifest Number"
      />
      <InputField
        value={end}
        keyboardType="numeric"
        onChangeText={setEnd}
        key="end"
        label="End Manifest Number"
      />

      <DropDown
        data={companies}
        handleUpdate={handleUpdate}
        schema={{ label: "companyName", value: "id" }}
      />

      <Pressable
        onPress={handleSave}
        className="bg-neutral-900 px-3 py-4 rounded-lg flex items-center justify-center "
      >
        <Text className="text-white font-geistSemiBold ">Save</Text>
      </Pressable>
      <Pressable
        onPress={() => router?.push("/manifests")}
        className="bg-gray-100 px-3 py-4 rounded-lg flexmb-auto items-center justify-center mt-3"
      >
        <Text className="text-neutral-600 font-geistSemiBold ">Back</Text>
      </Pressable>
    </View>
  );
};

export default ManifestForm;
