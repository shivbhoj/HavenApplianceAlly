export type ApplianceCategory =
  | "refrigerator"
  | "washer"
  | "dryer"
  | "dishwasher"
  | "oven"
  | "microwave"
  | "air_conditioner"
  | "heater"
  | "water_heater"
  | "vacuum"
  | "television"
  | "other";

export interface Appliance {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: ApplianceCategory;
  purchaseDate: string;
  warrantyExpiry: string;
  lastMaintenanceDate: string;
  location: string;
  serialNumber: string;
  notes: string;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface MaintenanceRecord {
  id: string;
  applianceId: string;
  date: string;
  type: string;
  description: string;
  cost?: number;
}

export const CATEGORY_LABELS: Record<ApplianceCategory, string> = {
  refrigerator: "Refrigerator",
  washer: "Washing Machine",
  dryer: "Dryer",
  dishwasher: "Dishwasher",
  oven: "Oven / Range",
  microwave: "Microwave",
  air_conditioner: "Air Conditioner",
  heater: "Heater / Furnace",
  water_heater: "Water Heater",
  vacuum: "Vacuum Cleaner",
  television: "Television",
  other: "Other",
};

export const CATEGORY_ICONS: Record<ApplianceCategory, string> = {
  refrigerator: "🧊",
  washer: "👕",
  dryer: "🌀",
  dishwasher: "🍽️",
  oven: "🔥",
  microwave: "📡",
  air_conditioner: "❄️",
  heater: "🌡️",
  water_heater: "💧",
  vacuum: "🌪️",
  television: "📺",
  other: "🔧",
};

export const LOCATION_OPTIONS = [
  "Kitchen",
  "Laundry Room",
  "Living Room",
  "Bedroom",
  "Bathroom",
  "Basement",
  "Garage",
  "Utility Room",
  "Other",
];
