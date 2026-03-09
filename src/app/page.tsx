"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Appliance,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_GROUP,
} from "@/types";
import ApplianceCard from "@/components/ApplianceCard";
import ApplianceModal from "@/components/ApplianceModal";
import ChatInterface from "@/components/ChatInterface";
import WarrantyView from "@/components/WarrantyView";
import SettingsView from "@/components/SettingsView";

type Tab = "home" | "appliances" | "assistant" | "warranty" | "settings";

const STORAGE_KEY = "haven-appliances-v2";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getSampleAppliances(): Appliance[] {
  const y = new Date().getFullYear();
  return [
    {
      id: generateId(),
      name: "Kitchen Fridge",
      brand: "Samsung",
      model: "RF28R7351SG",
      category: "refrigerator",
      purchaseDate: `${y - 2}-03-15`,
      warrantyExpiry: `${y + 3}-03-15`,
      lastMaintenanceDate: `${y}-01-10`,
      location: "Kitchen",
      serialNumber: "SN-RF28-001",
      notes: "Clean condenser coils every 6 months",
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: "Front-Load Washer",
      brand: "LG",
      model: "WM4000HWA",
      category: "washer",
      purchaseDate: `${y - 1}-07-20`,
      warrantyExpiry: `${y + 4}-07-20`,
      lastMaintenanceDate: `${y - 1}-12-01`,
      location: "Laundry Room",
      serialNumber: "SN-WM40-002",
      notes: "Run cleaning cycle monthly",
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: "Central AC",
      brand: "Carrier",
      model: "24ACC648A003",
      category: "air_conditioner",
      purchaseDate: `${y - 4}-05-10`,
      warrantyExpiry: `${y + 6}-05-10`,
      lastMaintenanceDate: `${y - 1}-05-20`,
      location: "Utility Room",
      serialNumber: "SN-AC24-003",
      notes: "Annual professional service required",
      createdAt: new Date().toISOString(),
    },
  ];
}

function loadAppliances(): Appliance[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getSampleAppliances();
  } catch {
    return getSampleAppliances();
  }
}

// ─── Home / Appliances list view ───────────────────────────────────────────
function ApplianceListView({
  appliances,
  showStats,
  onAdd,
  onEdit,
  onDelete,
  onAsk,
}: {
  appliances: Appliance[];
  showStats: boolean;
  onAdd: () => void;
  onEdit: (a: Appliance) => void;
  onDelete: (id: string) => void;
  onAsk: (a: Appliance) => void;
}) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All");

  // Compute available groups from current appliances
  const availableGroups = [
    "All",
    ...Array.from(
      new Set(appliances.map((a) => CATEGORY_GROUP[a.category] ?? "Other")),
    ),
  ];

  const filtered = appliances.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.brand.toLowerCase().includes(search.toLowerCase()) ||
      a.model.toLowerCase().includes(search.toLowerCase());
    const matchGroup =
      group === "All" || (CATEGORY_GROUP[a.category] ?? "Other") === group;
    return matchSearch && matchGroup;
  });

  const stats = {
    total: appliances.length,
    warrantySoon: appliances.filter((a) => {
      if (!a.warrantyExpiry) return false;
      const d =
        (new Date(a.warrantyExpiry).getTime() - Date.now()) /
        86400000;
      return d > 0 && d <= 90;
    }).length,
    maintDue: appliances.filter((a) => {
      if (!a.lastMaintenanceDate) return true;
      return (
        (Date.now() - new Date(a.lastMaintenanceDate).getTime()) / 86400000 >
        365
      );
    }).length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              HavenApplianceAlly
            </h1>
            <p className="text-sm text-gray-500">Your home appliance hub</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 bg-haven-600 hover:bg-haven-700 text-white text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors shadow-sm"
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
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add<br />Appliance
          </button>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatCard label="TOTAL" value={stats.total} color="default" />
            <StatCard label="WARRANTY" value={stats.warrantySoon} color={stats.warrantySoon > 0 ? "amber" : "default"} />
            <StatCard label="MAINT." value={stats.maintDue} color={stats.maintDue > 0 ? "orange" : "default"} />
          </div>
        )}

        {/* Search */}
        <div className="relative mt-3">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search appliances..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-haven-400 placeholder-gray-400"
          />
        </div>

        {/* Group pills */}
        {availableGroups.length > 1 && (
          <div className="flex gap-2 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
            {availableGroups.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  group === g
                    ? "bg-haven-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="text-5xl">🏠</span>
            <p className="font-semibold text-gray-700">
              {appliances.length === 0
                ? "No appliances yet"
                : "No results found"}
            </p>
            <p className="text-sm text-gray-500">
              {appliances.length === 0
                ? "Tap + Add Appliance to get started"
                : "Try a different search or category"}
            </p>
          </div>
        ) : (
          filtered.map((a) => (
            <ApplianceCard
              key={a.id}
              appliance={a}
              onEdit={onEdit}
              onDelete={onDelete}
              onAsk={onAsk}
            />
          ))
        )}
        {/* Bottom padding so last card isn't hidden behind nav */}
        <div className="h-2" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "default" | "amber" | "orange";
}) {
  const styles = {
    default: "bg-white border-gray-200 text-gray-900",
    amber: "bg-amber-50 border-amber-200 text-amber-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
  };
  return (
    <div
      className={`rounded-2xl border p-3 text-center shadow-sm ${styles[color]}`}
    >
      <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
        {label}
      </p>
      <p className={`text-3xl font-extrabold mt-0.5 ${color !== "default" ? "" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

// ─── Bottom navigation ─────────────────────────────────────────────────────
function BottomNav({
  active,
  onChange,
  maintDue,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  maintDue: number;
}) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "appliances",
      label: "Appliances",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
      ),
    },
    {
      id: "warranty",
      label: "Warranty",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors relative ${
              active === tab.id
                ? "text-haven-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "warranty" && maintDue > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-10px)] w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  const [chatInitialMsg, setChatInitialMsg] = useState<string | undefined>();

  useEffect(() => {
    setAppliances(loadAppliances());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(appliances));
  }, [appliances, mounted]);

  const handleSave = useCallback(
    (data: Omit<Appliance, "id" | "createdAt">) => {
      if (editingAppliance) {
        setAppliances((prev) =>
          prev.map((a) =>
            a.id === editingAppliance.id
              ? { ...data, id: a.id, createdAt: a.createdAt }
              : a,
          ),
        );
      } else {
        setAppliances((prev) => [
          { ...data, id: generateId(), createdAt: new Date().toISOString() },
          ...prev,
        ]);
      }
      setModalOpen(false);
      setEditingAppliance(null);
    },
    [editingAppliance],
  );

  const handleEdit = useCallback((a: Appliance) => {
    setEditingAppliance(a);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => setAppliances((prev) => prev.filter((a) => a.id !== id)),
    [],
  );

  const handleAsk = useCallback((a: Appliance) => {
    const cat = CATEGORY_LABELS[a.category] ?? a.category;
    setChatInitialMsg(
      `Give me maintenance tips and common issues for my ${a.brand} ${a.model} (${cat}) — "${a.name}".`,
    );
    setTab("assistant");
  }, []);

  const openAdd = useCallback(() => {
    setEditingAppliance(null);
    setModalOpen(true);
  }, []);

  const maintDue = appliances.filter((a) => {
    if (!a.lastMaintenanceDate) return true;
    return (Date.now() - new Date(a.lastMaintenanceDate).getTime()) / 86400000 > 365;
  }).length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-haven-600 font-semibold animate-pulse">
          Loading HavenApplianceAlly…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Content area */}
      <div className="flex-1 overflow-hidden pb-16">
        {tab === "home" && (
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <ApplianceListView
              appliances={appliances}
              showStats={true}
              onAdd={openAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAsk={handleAsk}
            />
          </div>
        )}

        {tab === "appliances" && (
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <ApplianceListView
              appliances={appliances}
              showStats={false}
              onAdd={openAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAsk={handleAsk}
            />
          </div>
        )}

        {tab === "assistant" && (
          <div className="h-[calc(100vh-64px)]">
            <ChatInterface
              appliances={appliances}
              initialMessage={chatInitialMsg}
              onClearInitial={() => setChatInitialMsg(undefined)}
            />
          </div>
        )}

        {tab === "warranty" && (
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <WarrantyView appliances={appliances} />
          </div>
        )}

        {tab === "settings" && (
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <SettingsView
              onClearData={() => {
                if (window.confirm("Delete all appliances? This cannot be undone.")) {
                  setAppliances([]);
                  localStorage.removeItem(STORAGE_KEY);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <BottomNav active={tab} onChange={setTab} maintDue={maintDue} />

      {/* Modal */}
      {modalOpen && (
        <ApplianceModal
          appliance={editingAppliance}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditingAppliance(null);
          }}
        />
      )}
    </div>
  );
}
