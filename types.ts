import { manifests } from "@/db/schema";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationRoute, ParamListBase } from "@react-navigation/native";
import { SharedValue } from "react-native-reanimated";
import { Company, Manifest, Truck } from "./db/schema";

// ** Navigation Types Go here

export type TabProps = Pick<
  BottomTabBarProps,
  "navigation" | "descriptors" | "state" // we only need these three
> & {
  route: NavigationRoute<ParamListBase, string>;
  index: number;
  setTabDimensions: React.Dispatch<
    React.SetStateAction<Record<string, TabDimensions>>
  >;
};

export type TabDimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type GenericRecord = Record<string, any>;

// This is for passing styles incase of animating tab icons when it is focused
export type TabIconStyle = {
  size: number;
  color: string;
};
export type ManifestStatus = "unassigned" | "active" | "completed";

// Table types
export type TableItem = Company | Manifest | Truck;
export type ManifestWithCompanies = {
  manifests: Manifest;
  companies: Company | null;
};
// export type TruckWithActiveManifests = {
//   id: number;
//   driverName: string;
//   manifestCount: number | null;
//   registration: string;
//   status: "active" | "repair";
// };

export type ManifestWithRegistration = Manifest & { truckRegistration: string };
export interface CompanyWithActiveManifests extends Company {
  manifests: ManifestWithRegistration[];
}
export type ValidRoutes = "/trucks/new" | "/companies/new" | "/manifests/new";

export type UnassignedManifests =
  | string
  | {
      id: number;
      manifestId: number;
      status: "completed" | "active" | "unassigned";
      assignedTo: number | null;
      companyId: number | null;
      createdAt: string;
    };

export interface ManifestWithCompanyName
  extends Omit<Manifest, "createdAt" | "completedOn"> {
  companyName: string | null;
}
export interface TrucksWithActiveManifests extends Truck {
  manifests: ManifestWithCompanyName[];
}

export interface ManifestWithAssignedVehicleRegistration {
  vehicleRegistration: string;
  id: number;
  status: "active" | "completed" | "unassigned";
  manifestId: number;
  assignedTo: number | null;
  companyId: number | null;
  createdAt: Date;
  completedOn: Date | null;
}
[];

export interface CompletedManifests {
  manifestId: number;
  status: "completed" | "active" | "unassigned";
  completedOn: Date | null;
  createdAt: Date;
  companyId: number | null;
  assignedTo: number | null;
  registration: string;
  companyName: string;
}

export type DayItem = {
  date: number;
  day: string;
  fullDate: string;
  isToday: boolean;
  isOverflowDate: boolean;
};
