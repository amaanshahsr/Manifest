import { eq } from "drizzle-orm";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import { companies as company_table } from "@/db/schema";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useSaveToDatabase } from "@/hooks/useSaveToDatabase";
import InputField from "@/components/common/inputField";

interface CompanyBottomSheetProps {
  refresh: () => Promise<void>;
  companyId?: string;
}
export default function CompanyBottomSheet({
  refresh,
  companyId,
}: CompanyBottomSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const truckId = pathname?.split("/")[2];
  const { addToDatabase } = useSaveToDatabase();
  const { companies, addCompany, fetchCompanies } = useCompanyStore();

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

        await addToDatabase({
          table: company_table,
          actionType: "edit",
          item: {
            companyName: trimmedCompanyName,
          },
          id: companyId,
        });
        await fetchCompanies();
        alert("Company info updated successfully!");
      } else {
        // Insert a new Company

        await addToDatabase({
          table: company_table,
          actionType: "new",
          item: {
            companyName: trimmedCompanyName,
          },
        });
        alert("Company info saved successfully!");
      }

      // Refresh or update the company list after saving
      await fetchCompanies();
      //route back to the List UI
      router?.push("/companies");
    } catch (error) {
      console.error("Error while saving truck info:", error);
      alert("An error occurred while saving the truck info.");
    }
  };

  // Fetch the truck details using the ComanyId in LocalSearchParams (passed as props)
  const fetchActiveCompany = async (id: string) => {
    const activeCompany = companies?.filter(
      (company) => company?.id === Number(id)
    );
    return activeCompany;
  };

  useEffect(() => {
    if (!companyId || companyId === "new") return;
    fetchActiveCompany(companyId).then((result) => {
      setCompanyName(result[0]?.companyName);
    });
  }, []);
  return (
    <>
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
    </>
  );
}
