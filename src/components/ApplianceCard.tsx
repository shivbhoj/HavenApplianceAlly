"use client";

import {
  Appliance,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CATEGORY_BADGE_COLORS,
  CATEGORY_BG_COLORS,
} from "@/types";

interface ApplianceCardProps {
  appliance: Appliance;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
  onAsk: (appliance: Appliance) => void;
}

function getWarrantyLabel(warrantyExpiry: string): string {
  if (!warrantyExpiry) return "";
  const expiry = new Date(warrantyExpiry);
  const daysLeft = Math.floor(
    (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (daysLeft < 0) return "Expired";
  const year = expiry.getFullYear();
  const month = expiry.toLocaleString("en-US", { month: "short" });
  return `${month} ${year}`;
}

function getMaintenanceInfo(lastMaintenanceDate: string): {
  label: string;
  isDue: boolean;
} {
  if (!lastMaintenanceDate) {
    return { label: "No maintenance recorded", isDue: true };
  }
  const daysAgo = Math.floor(
    (Date.now() - new Date(lastMaintenanceDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const isDue = daysAgo > 365;
  if (daysAgo < 1) return { label: "Maintained today", isDue: false };
  if (daysAgo === 1) return { label: "Maintained yesterday", isDue: false };
  if (daysAgo < 30)
    return { label: `Last Maint: ${daysAgo}d ago`, isDue: false };
  if (daysAgo < 365)
    return {
      label: `Last Maint: ${Math.floor(daysAgo / 30)}mo ago`,
      isDue: false,
    };
  return {
    label: `Maintenance Due: ${daysAgo}d ago`,
    isDue: true,
  };
}

export default function ApplianceCard({
  appliance,
  onEdit,
  onDelete,
  onAsk,
}: ApplianceCardProps) {
  const icon = CATEGORY_ICONS[appliance.category] ?? "🔧";
  const categoryLabel =
    CATEGORY_LABELS[appliance.category] ?? appliance.category;
  const badgeColor =
    CATEGORY_BADGE_COLORS[appliance.category] ?? "bg-gray-100 text-gray-600";
  const bgGradient =
    CATEGORY_BG_COLORS[appliance.category] ?? "from-gray-50 to-gray-100";
  const warrantyLabel = getWarrantyLabel(appliance.warrantyExpiry);
  const { label: maintenanceLabel, isDue } = getMaintenanceInfo(
    appliance.lastMaintenanceDate,
  );

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${
        isDue ? "border-2 border-orange-300" : "border border-gray-200"
      }`}
    >
      {/* Top content */}
      <div className="p-4 flex gap-3">
        {/* Image / icon thumbnail */}
        <div
          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center text-3xl shrink-0`}
        >
          {icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-[15px] leading-tight">
              {appliance.name}
            </h3>
            {isDue && (
              <span className="text-orange-500 shrink-0 mt-0.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5 truncate">
            {[appliance.brand, appliance.model].filter(Boolean).join(" ")}
            {appliance.location ? ` • ${appliance.location}` : ""}
          </p>
          {/* Category badge */}
          <span
            className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeColor}`}
          >
            {categoryLabel}
          </span>

          {/* Dates row */}
          <div className="flex flex-wrap gap-3 mt-2">
            {appliance.purchaseDate && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Bought: {new Date(appliance.purchaseDate).getFullYear()}
              </span>
            )}
            {warrantyLabel && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                {warrantyLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`px-4 py-2.5 border-t flex items-center justify-between ${
          isDue
            ? "border-orange-200 bg-orange-50"
            : "border-gray-100 bg-gray-50/50"
        }`}
      >
        <span
          className={`text-sm font-medium ${isDue ? "text-orange-600" : "text-gray-500"}`}
        >
          {maintenanceLabel}
        </span>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onAsk(appliance)}
            className="p-2 text-gray-400 hover:text-haven-600 hover:bg-haven-50 rounded-lg transition-colors"
            title="Ask AI"
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
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete "${appliance.name}"?`))
                onDelete(appliance.id);
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
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
    </div>
  );
}
