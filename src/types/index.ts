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

export const CATEGORY_BADGE_COLORS: Record<ApplianceCategory, string> = {
  refrigerator: "bg-blue-100 text-blue-700",
  washer: "bg-purple-100 text-purple-700",
  dryer: "bg-violet-100 text-violet-700",
  dishwasher: "bg-teal-100 text-teal-700",
  oven: "bg-orange-100 text-orange-700",
  microwave: "bg-amber-100 text-amber-700",
  air_conditioner: "bg-cyan-100 text-cyan-700",
  heater: "bg-red-100 text-red-700",
  water_heater: "bg-sky-100 text-sky-700",
  vacuum: "bg-gray-100 text-gray-600",
  television: "bg-indigo-100 text-indigo-700",
  other: "bg-gray-100 text-gray-600",
};

export const CATEGORY_BG_COLORS: Record<ApplianceCategory, string> = {
  refrigerator: "from-sky-50 to-blue-100",
  washer: "from-violet-50 to-purple-100",
  dryer: "from-purple-50 to-violet-100",
  dishwasher: "from-teal-50 to-cyan-100",
  oven: "from-orange-50 to-amber-100",
  microwave: "from-amber-50 to-yellow-100",
  air_conditioner: "from-cyan-50 to-sky-100",
  heater: "from-red-50 to-orange-100",
  water_heater: "from-blue-50 to-indigo-100",
  vacuum: "from-gray-50 to-slate-100",
  television: "from-indigo-50 to-blue-100",
  other: "from-gray-50 to-zinc-100",
};

// Maps a category to its display group for the filter pills
export const CATEGORY_GROUP: Record<ApplianceCategory, string> = {
  refrigerator: "Kitchen",
  oven: "Kitchen",
  microwave: "Kitchen",
  dishwasher: "Kitchen",
  washer: "Laundry",
  dryer: "Laundry",
  air_conditioner: "HVAC",
  heater: "HVAC",
  water_heater: "HVAC",
  television: "Living Room",
  vacuum: "Other",
  other: "Other",
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
