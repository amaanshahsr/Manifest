import InputField from "@/components/common/inputField";
import { Manifest, manifests } from "@/db/schema";
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
import PageHeader from "../common/pageHeader";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import ToastMessage from "../common/ToastMessage";
import { toast } from "@backpackapp-io/react-native-toast";

const ManifestForm = () => {
  useReturnToHome({ route: "/manifests" });
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const companyIdRef = useRef<number | null>(null);
  const db = useSQLiteContext();

  const { fetchManifests, fetchManifestsSortedByCompany } = useManifestStore();
  const { companies, fetchCompanies } = useCompanyStore();

  useEffect(() => {
    if (companies?.length) return;
    fetchCompanies(db);
  }, [companies?.length]);

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
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Please enter a valid range. ⚠️"
            toast={toast}
            type="warning"
          />
        ),
      });
      return false;
    }
    if (end < start) {
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="The start number must be less than the end number. Please enter a valid range. ⚠️"
            toast={toast}
            type="warning"
          />
        ),
      });

      return false;
    }
    if (!companyId) {
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Please select a company to assign manifests to. ⚠️"
            toast={toast}
            type="warning"
          />
        ),
      });
      return false;
    }
    return true;
  };

  const generateManifestList = (
    start: number,
    end: number,
    companyId: number
  ): Omit<Manifest, "id" | "createdAt" | "completedOn">[] => {
    return Array.from({ length: end - start + 1 }, (_, index) => ({
      manifestId: start + index,
      status: "unassigned",
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

      await fetchManifestsSortedByCompany(db);
    } catch (error) {
      console.error("Error while adding manifests:", error);
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage message={`${error}`} toast={toast} type="success" />
        ),
      });
    } finally {
      // Reset states after addition
      cleanUp();

      // Refresh and navigate
      await fetchManifests(db);
      toast("", {
        duration: 1500,
        customToast: (toast) => (
          <ToastMessage
            message="Manifest added successfully 🎉"
            toast={toast}
            type="success"
          />
        ),
      });
      router?.push("/manifests");
    }
  };
  const router = useRouter();

  const handleUpdate = (value: string) => {
    companyIdRef.current = Number(value);
  };

  return (
    <View>
      <PageHeader
        backRoute="/(tabs)/manifests"
        title={`Add New Manifests`}
      ></PageHeader>
      <View className="px-6 z-50 mt-5 ">
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
        <View className="mt-4">
          <DropDown
            data={companies}
            handleUpdate={handleUpdate}
            schema={{ label: "companyName", value: "id" }}
          />
        </View>
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
          onPress={() => router?.push("/manifests")}
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

export default ManifestForm;
