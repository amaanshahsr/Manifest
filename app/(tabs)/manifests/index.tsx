import AddNewButton from "@/components/common/addNewButton";
import ManifestInfoCard from "@/components/cards/manifestInfoCard";
import SkeletonLoader from "@/components/common/skeletonLoader";
import { useManifestStore } from "@/store/useManifestStore";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useSQLiteContext } from "expo-sqlite";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  Pressable,
  Modal,
  TouchableOpacity,
} from "react-native";
import StickyHeader from "@/components/manifest/stickyHeader";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import CustomSearchBar from "@/components/common/searchBar";
import { CommonActions, useIsFocused } from "@react-navigation/native";
import { Manifest } from "@/db/schema";
import {
  CompanyWithActiveManifests,
  ManifestStatus,
  ManifestWithCompanyName,
} from "@/types";

const Manifests = () => {
  const db = useSQLiteContext();

  const { loading, manifestsSortedByCompany, fetchManifestsSortedByCompany } =
    useManifestStore();

  const [
    filteredManifestsSortedByCompany,
    setFilteredmanifestsSortedByCompany,
  ] = useState<(string | Manifest)[]>([]);
  useEffect(() => {
    fetchManifestsSortedByCompany(db);
  }, []);

  useEffect(() => {
    setFilteredmanifestsSortedByCompany(manifestsSortedByCompany?.result);
  }, [manifestsSortedByCompany?.result]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [status, setStatus] = useState<ManifestStatus[]>([]);

  const companies = manifestsSortedByCompany?.result.filter(
    (row) => typeof row === "string"
  );

  const statuses: ManifestStatus[] = ["active", "unassigned", "completed"];
  type ReducedObject = { [k: string]: Manifest[] };

  const handleFiltered = () => {
    let currentCompanyName = "";
    const transformedResult =
      manifestsSortedByCompany?.result?.reduce<ReducedObject>((acc, record) => {
        const isCompanyName = typeof record === "string";

        if (isCompanyName) {
          acc[record as string] = [];
          currentCompanyName = record;
        }
        if (!isCompanyName) {
          acc[currentCompanyName]?.push(record);
        }

        return acc;
      }, {});
    for (let i = 0; i < selectedCompanies.length; i++) {
      const key = selectedCompanies[i];
      delete transformedResult[key];
    }
    // Convert the object into  array format
    const resultArray = Object.entries(transformedResult).flatMap(
      ([companyName, manifests]) => [
        companyName, // Add the company name
        ...manifests, // Add all the manifests for this company
      ]
    );

    const finalArray = resultArray.filter((record) => {
      // Skip if the record is a string (company name)
      if (typeof record === "string") return true;

      // Filter manifests based on their status
      return !status.includes(record.status);
    });

    console.log("finalArray", finalArray);

    setFilteredmanifestsSortedByCompany(finalArray);
  };

  // console.log("manifestss", manifestsSortedByCompany);

  // if (loading) {
  //   return (
  //     <View className="flex-1 w-full h-full  bg-yellow-200">
  //       <ActivityIndicator />
  //     </View>
  //   );
  // }

  if (
    manifestsSortedByCompany?.result === null ||
    manifestsSortedByCompany?.result.length === 0
  ) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center">
        <AddNewButton route="/manifests/new" text="Manifest" />
      </View>
    );
  }

  return loading ? (
    <ActivityIndicator />
  ) : (
    <View className="flex-1 w-full relative">
      <AddNewButton route="/manifests/new" text="Manifest" />

      <Button
        onPress={handlePresentModalPress}
        title="Present Modal"
        color="black"
      />
      <BottomSheetModal ref={bottomSheetModalRef} onChange={handleSheetChanges}>
        <BottomSheetView className="flex-1 items-center h-96">
          <View className="flex relative flex-row justify-center items-center  w-full ">
            <Text className="font-geistSemiBold text-2xl ">Filter</Text>

            <TouchableOpacity
              className=" absolute right-4"
              onPress={() => bottomSheetModalRef?.current?.close()}
            >
              <AntDesign name="closecircle" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View>
            <Text className="font-geistMedium text-lg ">Companies</Text>
            <View className="w-full flex flex-row gap-2 flex-wrap max-h-32 m-10 border border-neutral-500">
              {companies?.map((company) => {
                return (
                  <Pressable
                    key={company}
                    onPress={() => {
                      setSelectedCompanies((old) =>
                        old?.includes(company)
                          ? [...old?.filter((comp) => company !== comp)]
                          : [...old, company]
                      );
                    }}
                  >
                    <View
                      className={`border ${
                        selectedCompanies?.includes(company)
                          ? "bg-stone-900 text-white"
                          : "border-gray-500"
                      } rounded-full  p-2`}
                    >
                      <Text
                        className={`text-base  ${
                          selectedCompanies?.includes(company)
                            ? " text-white"
                            : ""
                        } font-geistRegular`}
                      >
                        {company}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
              <Button onPress={handleFiltered} title="click me"></Button>
            </View>
          </View>
          <View>
            <Text className="font-geistMedium text-lg ">Status</Text>
            <View className="w-full flex flex-row gap-2 flex-wrap max-h-32 m-10 border border-neutral-500">
              {statuses?.map((stat, index) => {
                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setStatus((old) =>
                        old?.includes(stat)
                          ? [...old?.filter((comp) => stat !== comp)]
                          : [...old, stat]
                      );
                    }}
                  >
                    <View
                      className={`border ${
                        status?.includes(stat as ManifestStatus)
                          ? "bg-stone-900 text-white"
                          : "border-gray-500"
                      } rounded-full  p-2`}
                    >
                      <Text
                        className={`text-base  ${
                          status?.includes(stat as ManifestStatus)
                            ? " text-white"
                            : ""
                        } font-geistRegular`}
                      >
                        {stat}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
              <Button onPress={handleFiltered} title="click me"></Button>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <Button
        title="Open Modal"
        onPress={() => bottomSheetModalRef?.current?.present()}
      />
      {filteredManifestsSortedByCompany?.length ? (
        <FlashList
          className="mb-1"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size={"small"} />
            </View>
          }
          // stickyHeaderIndices={sortedHeaderIndices}
          data={filteredManifestsSortedByCompany}
          renderItem={({ item }) => {
            return typeof item === "string" ? (
              <StickyHeader title={item} />
            ) : (
              <ManifestInfoCard manifest={item} />
            );
          }}
          estimatedItemSize={1000}
          keyExtractor={(item) =>
            typeof item === "string" ? item : item?.id?.toString()
          }
        />
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
};

export default Manifests;
