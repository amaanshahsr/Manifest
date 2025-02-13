import InputField from "@/components/common/inputField";
import {
  companies,
  Company,
  Manifest,
  manifests,
  TableTypes,
  Truck,
} from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { View, Text } from "react-native";
import { useSaveToDatabase } from "@/hooks/useSaveToDatabase";
import useReturnToHome from "@/hooks/useReturnToHome";

const New = () => {
  useReturnToHome({ route: "/manifests" });

  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const companyIdRef = useRef<number | null>(null);

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
      alert("Company Select cheyy myr");
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
    } catch (error) {
      console.log("Error While Adding Manifests", error);
    } finally {
      //   await refresh();
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

export default New;

interface DropDownProps<T extends Truck | Company | Manifest> {
  handleUpdate: (value: string) => void;
  table: TableTypes;
  schema: {
    label: keyof T;
    value: keyof T;
  };
}

const DropDown = <T extends Truck | Company | Manifest>({
  handleUpdate,
  table,
  schema,
}: DropDownProps<T>) => {
  const { data } = useDataFetch<T>({ table });
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (data) {
      const transformedData = data.map((item) => ({
        label: String(item[schema.label]), // Ensure label is a string
        value: String(item[schema.value]), // Ensure value is a string
      }));
      setItems(transformedData);
    }
  }, [data]);

  return (
    <DropDownPicker
      style={{ marginBlock: 20 }}
      open={open}
      value={value}
      items={items}
      showBadgeDot={true}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      placeholder="Select an option"
      onChangeValue={(val) => (val ? handleUpdate(val) : null)}
    />
  );
};
