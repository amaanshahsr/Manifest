import InputField from "@/components/common/inputField";
import { companies, Manifest, manifests } from "@/db/schema";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Pressable } from "react-native";
import { View, Text } from "react-native";
import { useSaveToDatabase } from "@/hooks/useSaveToDatabase";
import useReturnToHome from "@/hooks/useReturnToHome";
import { useManifestStore } from "@/store/useManifestStore";
import { DropDown } from "../common/dropdown";

const ManifestForm = () => {
  useReturnToHome({ route: "/manifests" });

  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const companyIdRef = useRef<number | null>(null);
  const { fetchManifests } = useManifestStore();

  const { addToDatabase } = useSaveToDatabase();

  const handleSave = async () => {
    if (end === 0 && start === 0) {
      alert("Please enter a valid range.");
      return;
    }
    if (end < start) {
      alert(
        "The start number must be less than the end number. Please enter a valid range."
      );
      return;
    }
    if (!companyIdRef?.current) {
      console.log("companyIdRef?", companyIdRef.current);
      alert("Please Select a company to Assign manifests to.");
      return;
    }

    let newManifests: Omit<Manifest, "id">[] = [];

    for (let i = start; i <= end; i++) {
      console.log(i);
      newManifests?.push({
        manifestId: i,
        status: "active",
        assignedTo: null,
        companyId: companyIdRef?.current,
      });
    }

    try {
      await addToDatabase({
        actionType: "new",
        item: newManifests,
        table: manifests,
      });
      alert("Manifests added Succesfully !");
    } catch (error) {
      console.log("Error While Adding Manifests", error);
    } finally {
      // Reset states after addition
      setStart(0);
      setEnd(0);
      companyIdRef.current = null;
      // Fetch the updated lists from DB and update store
      await fetchManifests();
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
        table={companies}
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
