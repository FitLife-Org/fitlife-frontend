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
}

export interface EquipmentSummary {
  total: number;
  active: { count: number; percentage: number };
  maintenance: { count: number; percentage: number };
  inactive: { count: number; percentage: number };
  upcomingMaintenance: { count: number; timeFrame: string };
}
