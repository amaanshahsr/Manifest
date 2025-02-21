import { Company, Manifest, companies as company_table } from "@/db/schema";
import { AntDesign, Feather, Fontisto } from "@expo/vector-icons";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { eq } from "drizzle-orm";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  FadeIn,
  Easing,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface ManifestInfoCardProps {
  manifest: Manifest;
  checkedItemsRef: React.MutableRefObject<string[]>;
}
const ManifestInfoCard: React.FC<ManifestInfoCardProps> = ({
  manifest,
  checkedItemsRef,
}) => {
  const db = useSQLiteContext();

  const drizzleDb = drizzle(db);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const [assignedCompany, setAssignedCompany] = useState<Company | null>(null);
  useEffect(() => {
    selectCompany(manifest?.companyId ?? 0)?.then((result) => {
      setAssignedCompany(result[0]);
    });

    setChecked(
      checkedItemsRef?.current?.includes(manifest?.manifestId?.toString())
        ? true
        : false
    );
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
      className={`${
        checked ? "bg-gray-200" : "bg-white"
      } h-auto w-[92.5%] mt-5 rounded-xl p-6 mx-auto`}
    >
      <View className="flex-row justify-between items-center">
        <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {manifest?.manifestId}
        </Text>
        <Text className="font-geistSemiBold text-2xl text-neutral-900">
          {companyName}
        </Text>
        {/* <Pressable
          onPress={() =>
            router?.push({
              pathname: "/manifests",
              params: { id: manifest?.id }, // Push a valid ID as searchParams so the TruckSheet Component know's we are editing truck details
            })
          }
        >
          <Text>
            <Feather name="edit" size={24} color="#1e293b" /> 
          </Text>
        </Pressable> */}
        <View
          className={`${
            manifest?.status === "active" ? "bg-green-600" : "bg-orange-500"
          } p-2 rounded-full`}
        >
          <Text className="font-geistMedium text-sm text-white">
            {manifest?.status === "active" ? "Active" : "Completed"}
          </Text>
        </View>
        <Pressable
          className={`w-8 h-8 flex items-center justify-center `}
          onPress={() => {
            setChecked((prev) => !prev);

            const manifestId = manifest?.manifestId?.toString();
            if (!manifestId || !checkedItemsRef?.current) return;

            const isChecked = checkedItemsRef.current.includes(manifestId);

            checkedItemsRef.current = isChecked
              ? checkedItemsRef.current.filter((id) => id !== manifestId)
              : [...checkedItemsRef.current, manifestId];
          }}
        >
          {checked ? (
            <Animated.View exiting={FadeOut}>
              <MaterialCommunityIcons
                name="checkbox-marked-circle"
                size={24}
                color="black"
              />
            </Animated.View>
          ) : (
            // <Fontisto name="checkbox-passive" size={24} color="black" />
            <Animated.View exiting={FadeOut}>
              <MaterialCommunityIcons
                name="checkbox-blank-circle-outline"
                size={24}
                color="black"
              />
            </Animated.View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default ManifestInfoCard;

// const CheckBox: React.FC<ManifestInfoCardProps> = ({
//   manifest,
//   checkedItemsRef,
// }) => {
//   const [checked, setChecked] = useState(false);
//   useEffect(() => {
//     setChecked(
//       checkedItemsRef?.current?.includes(manifest?.manifestId?.toString())
//         ? true
//         : false
//     );
//   }, [checkedItemsRef]);

//   return (
//     <Pressable
//       className={`w-8 h-8 flex items-center justify-center `}
//       onPress={() => {
//         setChecked(!checked);
//         checkedItemsRef?.current?.includes(manifest?.manifestId?.toString())
//           ? checkedItemsRef?.current?.filter(
//               (manifestid) => manifestid !== manifest?.manifestId?.toString()
//             )
//           : checkedItemsRef?.current?.push(manifest?.manifestId?.toString());
//       }}
//     >
//       {checked ? (
//         <Fontisto name="checkbox-active" size={24} color="black" />
//       ) : (
//         <Fontisto name="checkbox-passive" size={24} color="black" />
//       )}
//     </Pressable>
//   );
// };
