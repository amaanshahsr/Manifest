import { capitalizeWord } from "@/utils/utils";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text } from "react-native";
import { companies, trucks as truck_table } from "@/db/schema";
import InputField from "../common/inputField";
import CustomBackdrop from "./backdrop";

interface CompanyBottomSheetProps {
  refresh: () => Promise<void>;
  companyId?: string;
}
export function CompanyBottomSheet({
  refresh,
  companyId,
}: CompanyBottomSheetProps) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const [companyName, setCompanyName] = useState("");
  const handleSave = async () => {
    const trimmedCompanyName = companyName.trim();

    if (!trimmedCompanyName) {
      alert("Please enter a valid company name.");
      return;
    }

    if (trimmedCompanyName.length < 3) {
      alert("Company name must be at least 3 characters long.");
      return;
    }

    try {
      if (companyId && companyId !== "new") {
        // Update the existing truck
        await drizzleDb
          .update(companies)
          .set({
            companyName: trimmedCompanyName,
          })
          .where(eq(companies.id, Number(companyId)));

        alert("Truck info updated successfully!");
      } else {
        // Insert a new truck
        await drizzleDb.insert(companies).values({
          companyName: trimmedCompanyName,
        });

        alert("Truck info saved successfully!");
      }

      // Refresh or update the truck list after saving
      await refresh();
      //route back to the List UI
      router?.push("/companies");
    } catch (error) {
      console.error("Error while saving truck info:", error);
      alert("An error occurred while saving the truck info.");
    }
  };
  const router = useRouter();

  // Fetch the truck details using the truckId in LocalSearchParams (passed as props)
  const fetchActiveCompany = async (id: string) => {
    const activeCompany = await drizzleDb
      .select()
      .from(companies)
      .where(eq(companies?.id, Number(id)));
    return activeCompany;
  };

  useEffect(() => {
    if (!companyId || companyId === "new") return;
    fetchActiveCompany(companyId).then((result) => {
      setCompanyName(result[0]?.companyName);
    });
  }, []);
  const snapPoints = useMemo(() => [450, 450, 600], []);
  return (
    <BottomSheet
      snapPoints={snapPoints}
      backdropComponent={CustomBackdrop}
      onClose={() => router?.push("/companies")}
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
          value={companyName}
          onChangeText={setCompanyName}
          key="name"
          label="Company Name"
        />

        <Pressable
          onPress={handleSave}
          className="bg-neutral-900 px-3 py-4 rounded-lg flex items-center justify-center mt-auto"
        >
          <Text className="text-white font-geistSemiBold ">Save</Text>
        </Pressable>
        <Pressable
          onPress={() => router?.push("/companies")}
          className="bg-gray-100 px-3 py-4 rounded-lg flex items-center justify-center mt-3"
        >
          <Text className="text-neutral-600 font-geistSemiBold ">Back</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
