// Asset Management Module — Type Definitions

export type AssetRole = "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE" | "IT_ADMIN";

export type AssetStatus = "ASSIGNED" | "AVAILABLE" | "MAINTENANCE" | "RETIRED" | "LOST";

export type AssetCategory =
  | "LAPTOP"
  | "DESKTOP"
  | "MONITOR"
  | "PHONE"
  | "HEADSET"
  | "KEYBOARD"
  | "MOUSE"
  | "TABLET"
  | "FURNITURE"
  | "ACCESS_CARD"
  | "OTHER";

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseValue: number;
  currentValue: number;
  status: AssetStatus;
  assignedTo: string | null;
  assignedToAvatar: string | null;
  department: string | null;
  location: string;
  warrantyExpiry: string | null;
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  notes: string;
}

export interface AssetRequest {
  id: string;
  requestedBy: string;
  requestedByAvatar: string;
  department: string;
  assetCategory: AssetCategory;
  description: string;
  justification: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED";
  requestDate: string;
  responseDate: string | null;
  respondedBy: string | null;
}

export interface AssetKPIs {
  totalAssets: number;
  assignedAssets: number;
  availableAssets: number;
  maintenanceAssets: number;
  totalValue: string;
  pendingRequests: number;
}

export interface AssetActivity {
  id: string;
  action: "ASSIGNED" | "RETURNED" | "MAINTENANCE" | "RETIRED" | "REQUESTED" | "APPROVED";
  assetName: string;
  assetTag: string;
  performedBy: string;
  performedByAvatar: string;
  targetEmployee: string | null;
  timestamp: string;
}
