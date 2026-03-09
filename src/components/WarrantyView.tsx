"use client";

import { Appliance, CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_BG_COLORS } from "@/types";

function getWarrantyStatus(warrantyExpiry: string): {
  label: string;
  sublabel: string;
  color: "green" | "amber" | "red" | "gray";
} {
  if (!warrantyExpiry)
    return { label: "No Info", sublabel: "No warranty on record", color: "gray" };

  const expiry = new Date(warrantyExpiry);
  const daysLeft = Math.floor((expiry.getTime() - Date.now()) / 86400000);
  const formatted = expiry.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (daysLeft < 0)
    return { label: "Expired", sublabel: `Expired ${formatted}`, color: "red" };
  if (daysLeft <= 30)
    return { label: `${daysLeft}d left`, sublabel: `Expires ${formatted}`, color: "red" };
  if (daysLeft <= 90)
    return { label: `${Math.round(daysLeft / 30)}mo left`, sublabel: `Expires ${formatted}`, color: "amber" };
  return {
    label: "Active",
    sublabel: `Valid until ${formatted}`,
    color: "green",
  };
}

const STATUS_COLORS = {
  green: {
    badge: "bg-green-100 text-green-700",
    bar: "bg-green-500",
    dot: "bg-green-500",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  red: {
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
  gray: {
    badge: "bg-gray-100 text-gray-500",
    bar: "bg-gray-300",
    dot: "bg-gray-400",
  },
};

export default function WarrantyView({ appliances }: { appliances: Appliance[] }) {
  const sorted = [...appliances].sort((a, b) => {
    if (!a.warrantyExpiry && !b.warrantyExpiry) return 0;
    if (!a.warrantyExpiry) return 1;
    if (!b.warrantyExpiry) return -1;
    return new Date(a.warrantyExpiry).getTime() - new Date(b.warrantyExpiry).getTime();
  });

  const stats = {
    active: appliances.filter((a) => {
      if (!a.warrantyExpiry) return false;
      return new Date(a.warrantyExpiry) > new Date();
    }).length,
    expiringSoon: appliances.filter((a) => {
      if (!a.warrantyExpiry) return false;
      const d = (new Date(a.warrantyExpiry).getTime() - Date.now()) / 86400000;
      return d > 0 && d <= 90;
    }).length,
    expired: appliances.filter((a) => {
      if (!a.warrantyExpiry) return false;
      return new Date(a.warrantyExpiry) < new Date();
    }).length,
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Warranty Tracker</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor your appliance warranties</p>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
            <p className="text-[10px] font-bold tracking-widest text-green-600 uppercase">Active</p>
            <p className="text-3xl font-extrabold text-green-700 mt-0.5">{stats.active}</p>
          </div>
          <div className={`rounded-2xl border p-3 text-center ${stats.expiringSoon > 0 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Expiring</p>
            <p className={`text-3xl font-extrabold mt-0.5 ${stats.expiringSoon > 0 ? "text-amber-600" : "text-gray-400"}`}>
              {stats.expiringSoon}
            </p>
          </div>
          <div className={`rounded-2xl border p-3 text-center ${stats.expired > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Expired</p>
            <p className={`text-3xl font-extrabold mt-0.5 ${stats.expired > 0 ? "text-red-600" : "text-gray-400"}`}>
              {stats.expired}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="text-5xl">🛡️</span>
            <p className="font-semibold text-gray-700">No appliances yet</p>
            <p className="text-sm text-gray-500">Add appliances to track warranties</p>
          </div>
        ) : (
          sorted.map((a) => {
            const { label, sublabel, color } = getWarrantyStatus(a.warrantyExpiry);
            const styles = STATUS_COLORS[color];
            const icon = CATEGORY_ICONS[a.category] ?? "🔧";
            const catLabel = CATEGORY_LABELS[a.category] ?? a.category;
            const bgGradient = CATEGORY_BG_COLORS[a.category] ?? "from-gray-50 to-gray-100";

            return (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center text-2xl shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-[15px] truncate">{a.name}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${styles.badge}`}>
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {a.brand} {a.model}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
                      <span className="text-xs text-gray-500">{sublabel}</span>
                    </div>
                  </div>
                </div>
                {/* Progress bar (visual warranty timeline) */}
                {a.purchaseDate && a.warrantyExpiry && (
                  <div className="px-4 pb-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${styles.bar} transition-all`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              ((Date.now() - new Date(a.purchaseDate).getTime()) /
                                (new Date(a.warrantyExpiry).getTime() -
                                  new Date(a.purchaseDate).getTime())) *
                                100,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">
                        {new Date(a.purchaseDate).getFullYear()}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(a.warrantyExpiry).getFullYear()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div className="h-2" />
      </div>
    </div>
  );
}
