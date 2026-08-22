export type EquipmentStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

export interface Equipment {
  id: string;
  name: string;
  image?: string;
  category: string;
  area: string;
  status: EquipmentStatus;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  daysToNextMaintenance?: number | null;
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
  description?: string | null;
}

export interface EquipmentSummary {
  total: number;
  active: { count: number; percentage: number };
  maintenance: { count: number; percentage: number };
  inactive: { count: number; percentage: number };
  upcomingMaintenance: { count: number; timeFrame: string };
}

export interface AdminEquipmentCreateRequest {
  equipmentCode: string;
  name: string;
  category?: string;
  area?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  status?: string;
  description?: string;
  image?: string;
}

export interface AdminEquipmentUpdateRequest {
  name: string;
  category?: string;
  area?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  status?: string;
  description?: string;
  image?: string;
}

export interface EquipmentAreaRequest {
  name: string;
  description?: string;
}

export interface EquipmentAreaResponse {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
