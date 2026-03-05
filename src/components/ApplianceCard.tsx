"use client";

import { Appliance, CATEGORY_ICONS, CATEGORY_LABELS } from "@/types";

interface ApplianceCardProps {
  appliance: Appliance;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
  onAsk: (appliance: Appliance) => void;
}

function getWarrantyStatus(warrantyExpiry: string) {
  if (!warrantyExpiry) return { label: "No warranty info", color: "gray" };
  const expiry = new Date(warrantyExpiry);
  const now = new Date();
  const daysLeft = Math.floor(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysLeft < 0)
    return { label: "Warranty expired", color: "red", daysLeft };
  if (daysLeft <= 30)
    return {
      label: `Expires in ${daysLeft}d`,
      color: "amber",
      daysLeft,
    };
  if (daysLeft <= 90)
    return {
      label: `Expires in ${Math.round(daysLeft / 30)}mo`,
      color: "yellow",
      daysLeft,
    };
  return {
    label: `Warranty until ${expiry.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
    color: "green",
    daysLeft,
  };
}

function getMaintenanceStatus(lastMaintenanceDate: string) {
  if (!lastMaintenanceDate) return { label: "No maintenance recorded", color: "gray" };
  const last = new Date(lastMaintenanceDate);
  const now = new Date();
  const daysAgo = Math.floor(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysAgo > 365)
    return {
      label: `Maintained ${Math.floor(daysAgo / 365)}y ago`,
      color: "red",
    };
  if (daysAgo > 180)
    return { label: `Maintained ${Math.floor(daysAgo / 30)}mo ago`, color: "amber" };
  return {
    label: `Maintained ${daysAgo}d ago`,
    color: "green",
  };
}

const colorClasses = {
  gray: "bg-gray-100 text-gray-600",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
};

export default function ApplianceCard({
  appliance,
  onEdit,
  onDelete,
  onAsk,
}: ApplianceCardProps) {
  const warranty = getWarrantyStatus(appliance.warrantyExpiry);
  const maintenance = getMaintenanceStatus(appliance.lastMaintenanceDate);
  const icon = CATEGORY_ICONS[appliance.category] ?? "🔧";
  const categoryLabel = CATEGORY_LABELS[appliance.category] ?? appliance.category;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {appliance.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {appliance.brand} {appliance.model}
            </p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onAsk(appliance)}
            className="p-1.5 text-haven-600 hover:bg-haven-50 rounded-lg transition-colors"
            title="Ask AI about this appliance"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
          <button
            onClick={() => onEdit(appliance)}
            className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            title="Edit appliance"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Delete ${appliance.name}? This cannot be undone.`,
                )
              ) {
                onDelete(appliance.id);
              }
            }}
            className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
            title="Delete appliance"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs bg-haven-50 text-haven-700 px-2 py-0.5 rounded-full font-medium">
          {categoryLabel}
        </span>
        {appliance.location && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            📍 {appliance.location}
          </span>
        )}
        {appliance.purchaseDate && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            Bought {new Date(appliance.purchaseDate).getFullYear()}
          </span>
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-col gap-1.5">
        <div
          className={`text-xs px-2 py-1 rounded-lg font-medium ${colorClasses[warranty.color as keyof typeof colorClasses]}`}
        >
          🛡️ {warranty.label}
        </div>
        <div
          className={`text-xs px-2 py-1 rounded-lg font-medium ${colorClasses[maintenance.color as keyof typeof colorClasses]}`}
        >
          🔧 {maintenance.label}
        </div>
      </div>

      {/* Notes */}
      {appliance.notes && (
        <p className="text-xs text-gray-500 italic truncate border-t border-gray-100 pt-2">
          {appliance.notes}
        </p>
      )}
    </div>
  );
}
