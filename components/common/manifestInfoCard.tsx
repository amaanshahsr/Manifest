import { Company, Manifest, companies as company_table } from "@/db/schema";
import { Feather } from "@expo/vector-icons";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { eq } from "drizzle-orm";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";

interface ManifestInfoCardProps {
  manifest: Manifest;
}
const ManifestInfoCard: React.FC<ManifestInfoCardProps> = ({ manifest }) => {
  const db = useSQLiteContext();

  const drizzleDb = drizzle(db);
  const router = useRouter();

  const [assignedCompany, setAssignedCompany] = useState<Company | null>(null);
  useEffect(() => {
    selectCompany(manifest?.companyId ?? 0)?.then((result) => {
      setAssignedCompany(result[0]);
    });
  }, [manifest]);

  // Memoize the database query function
  const selectCompany = useCallback(
    async (withId: number) => {
      return await drizzleDb
        .select()
        .from(company_table)
        .where(eq(company_table.id, withId));
    },
    [drizzleDb]
  );

  // Fallback incase of manifest not being assigned to a company
  const companyName = useMemo(
    () => assignedCompany?.companyName ?? "None",
    [assignedCompany]
  );

  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="bg-white h-auto w-[92.5%] mt-5 rounded-xl p-6 mx-auto"
    >
      <View className="flex-row justify-between items-center">
        <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {manifest?.manifestId}
        </Text>
        <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {companyName}
        </Text>
        <Pressable
          onPress={() =>
            router?.push({
              pathname: "/manifests",
              params: { id: manifest?.id }, // Push a valid ID as searchParams so the TruckSheet Component know's we are editing truck details
            })
          }
        >
          <Text>
            <Feather name="edit" size={24} color="#1e293b" /> {/* Edit Icon */}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ManifestInfoCard;
