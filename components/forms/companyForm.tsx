import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { companies as company_table } from "@/db/schema";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useSaveToDatabase } from "@/hooks/useSaveToDatabase";
import InputField from "@/components/common/inputField";
import useReturnToHome from "@/hooks/useReturnToHome";
import { useSQLiteContext } from "expo-sqlite";
import useCleanupOnExit from "@/hooks/useCleanupOnExit";
import PageHeader from "../common/pageHeader";

export default function CompanyForm() {
  useReturnToHome({ route: "/companies" });
  const router = useRouter();
  const pathname = usePathname();
  const companyId = pathname?.split("/")[2];
  const { addToDatabase } = useSaveToDatabase();
  const db = useSQLiteContext();
  useCleanupOnExit(cleanUp);

  // This funtion will run on unfocus
  function cleanUp() {
    setCompanyName("");
  }
  const { companies, fetchCompanies, fetchCompanyWithActiveManifests } =
    useCompanyStore();

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
        await fetchCompanies(db);
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
      await fetchCompanyWithActiveManifests(db);
      await fetchCompanies(db);
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
    if (!companies.length) {
      fetchCompanies(db);
    }
    if (!companyId || companyId === "new") return;
    fetchActiveCompany(companyId).then((result) => {
      setCompanyName(result[0]?.companyName);
    });
  }, [companyId, companies?.length]);

  return (
    <View>
      <PageHeader
        backRoute="/(tabs)/manifests"
        title={`${
          companyId === "new" ? "Add New Company" : "Edit Company Details"
        }`}
      ></PageHeader>
      <View className="mt-5 px-6">
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
      </View>
    </View>
  );
}
