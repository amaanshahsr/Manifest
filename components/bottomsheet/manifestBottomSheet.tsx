import { capitalizeWord } from "@/utils/utils";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Manifest, manifests } from "@/db/schema";
import InputField from "../common/inputField";
import CustomBackdrop from "./backdrop";
import CompanySelect from "../common/companySelect";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";

interface ManifestBottomSheetProps {
  refresh: () => Promise<void>;
  ManifestId?: string;
}
export function ManifestBottomSheet({
  refresh,
  ManifestId,
}: ManifestBottomSheetProps) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);

  const handleSave = async () => {
    if (end < start) {
      alert(
        "The start number must be less than the end number. Please enter a valid range."
      );
      return;
    }
    if (!companyRef?.current) {
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
        companyId: companyRef?.current,
      });
    }

    try {
      await drizzleDb?.insert(manifests).values(newManifests);
    } catch (error) {
      console.log("Error While Adding Manifests", error);
    } finally {
      await refresh();
      router?.push("/manifests");
    }

    console.log("manifestdssss", manifests);
  };
  const router = useRouter();
  const companyRef = useRef<number | null>(null);
  const changeCompanyRef = (id: number) => {
    companyRef.current = id;
    console.log("CompanyRefCHanged", companyRef?.current);
  };
  return (
    <Animated.View
      entering={SlideInDown.duration(175).easing(Easing.in(Easing.ease))}
      exiting={SlideOutDown.duration(200).easing(Easing.in(Easing.ease))}
      className="px-6 z-50 bg-fuchsia-500 rounded-t-2xl h-screen  w-screen fixed top-0 left-0"
    >
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
      <CompanySelect handleSelect={changeCompanyRef} />

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
    </Animated.View>
  );
}
