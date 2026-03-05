"use client";

import { useState, useEffect, useCallback } from "react";
import { Appliance, CATEGORY_ICONS, CATEGORY_LABELS } from "@/types";
import ApplianceCard from "@/components/ApplianceCard";
import ApplianceModal from "@/components/ApplianceModal";
import ChatInterface from "@/components/ChatInterface";

const STORAGE_KEY = "haven-appliances";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
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

function getSampleAppliances(): Appliance[] {
  const now = new Date();
  const year = now.getFullYear();
  return [
    {
      id: generateId(),
      name: "Kitchen Refrigerator",
      brand: "Samsung",
      model: "RF28R7351SG",
      category: "refrigerator",
      purchaseDate: `${year - 2}-03-15`,
      warrantyExpiry: `${year + 3}-03-15`,
      lastMaintenanceDate: `${year}-01-10`,
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
      purchaseDate: `${year - 1}-07-20`,
      warrantyExpiry: `${year + 4}-07-20`,
      lastMaintenanceDate: `${year - 1}-12-01`,
      location: "Laundry Room",
      serialNumber: "SN-WM40-002",
      notes: "Run cleaning cycle monthly",
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: "Central AC Unit",
      brand: "Carrier",
      model: "24ACC648A003",
      category: "air_conditioner",
      purchaseDate: `${year - 4}-05-10`,
      warrantyExpiry: `${year - 4 + 10}-05-10`,
      lastMaintenanceDate: `${year}-05-20`,
      location: "Utility Room",
      serialNumber: "SN-AC24-003",
      notes: "Annual professional service required",
      createdAt: new Date().toISOString(),
    },
  ];
}

export default function Home() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [chatInitialMsg, setChatInitialMsg] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"appliances" | "chat">(
    "appliances",
  );

  // Load from localStorage on mount
  useEffect(() => {
    setAppliances(loadAppliances());
    setMounted(true);
  }, []);

  // Persist to localStorage whenever appliances change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appliances));
    }
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
        const newAppliance: Appliance = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        setAppliances((prev) => [newAppliance, ...prev]);
      }
      setModalOpen(false);
      setEditingAppliance(null);
    },
    [editingAppliance],
  );

  const handleEdit = useCallback((appliance: Appliance) => {
    setEditingAppliance(appliance);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleAsk = useCallback(
    (appliance: Appliance) => {
      const category =
        CATEGORY_LABELS[appliance.category] ?? appliance.category;
      const msg = `Tell me about maintenance tips and common issues for my ${appliance.brand} ${appliance.model} (${category}) — ${appliance.name}.`;
      setChatInitialMsg(msg);
      setActiveTab("chat");
    },
    [],
  );

  // Filtered appliances
  const filteredAppliances = appliances.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const stats = {
    total: appliances.length,
    warrantyExpiringSoon: appliances.filter((a) => {
      if (!a.warrantyExpiry) return false;
      const days =
        (new Date(a.warrantyExpiry).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24);
      return days > 0 && days <= 90;
    }).length,
    maintenanceDue: appliances.filter((a) => {
      if (!a.lastMaintenanceDate) return true;
      const days =
        (Date.now() - new Date(a.lastMaintenanceDate).getTime()) /
        (1000 * 60 * 60 * 24);
      return days > 365;
    }).length,
  };

  const categories = [
    "all",
    ...Array.from(new Set(appliances.map((a) => a.category))),
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-haven-600 text-lg font-medium animate-pulse">
          Loading HavenApplianceAlly...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-haven-500 to-haven-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🏠</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-none">
                HavenApplianceAlly
              </h1>
              <p className="text-xs text-gray-500">Your home appliance hub</p>
            </div>
          </div>

          {/* Mobile tab switcher */}
          <div className="flex lg:hidden bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab("appliances")}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                activeTab === "appliances"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Appliances
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                activeTab === "chat"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              AI Chat
            </button>
          </div>

          <button
            onClick={() => {
              setEditingAppliance(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-haven-600 hover:bg-haven-700 text-white text-sm font-medium rounded-lg transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Add Appliance</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-100px)]">
          {/* Left panel — Appliances */}
          <div
            className={`flex-1 flex flex-col gap-4 min-w-0 ${activeTab === "chat" ? "hidden lg:flex" : "flex"}`}
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <div className="text-2xl font-bold text-haven-600">
                  {stats.total}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Total Appliances
                </div>
              </div>
              <div
                className={`rounded-xl border p-3 text-center ${
                  stats.warrantyExpiringSoon > 0
                    ? "bg-amber-50 border-amber-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`text-2xl font-bold ${
                    stats.warrantyExpiringSoon > 0
                      ? "text-amber-600"
                      : "text-gray-400"
                  }`}
                >
                  {stats.warrantyExpiringSoon}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Warranties Soon
                </div>
              </div>
              <div
                className={`rounded-xl border p-3 text-center ${
                  stats.maintenanceDue > 0
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`text-2xl font-bold ${
                    stats.maintenanceDue > 0 ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  {stats.maintenanceDue}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Maintenance Due
                </div>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-haven-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-haven-500 bg-white text-gray-700"
              >
                <option value="all">All categories</option>
                {categories
                  .filter((c) => c !== "all")
                  .map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_ICONS[c as keyof typeof CATEGORY_ICONS]}{" "}
                      {CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c}
                    </option>
                  ))}
              </select>
            </div>

            {/* Appliance grid */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {filteredAppliances.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <div className="text-5xl">🏠</div>
                  <div>
                    <p className="font-semibold text-gray-700">
                      {appliances.length === 0
                        ? "No appliances yet"
                        : "No appliances match your search"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {appliances.length === 0
                        ? "Add your first appliance to get started"
                        : "Try adjusting your search or filter"}
                    </p>
                  </div>
                  {appliances.length === 0 && (
                    <button
                      onClick={() => {
                        setEditingAppliance(null);
                        setModalOpen(true);
                      }}
                      className="px-4 py-2 bg-haven-600 hover:bg-haven-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      + Add Appliance
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
                  {filteredAppliances.map((appliance) => (
                    <ApplianceCard
                      key={appliance.id}
                      appliance={appliance}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAsk={handleAsk}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel — Chat */}
          <div
            className={`w-full lg:w-96 xl:w-[420px] shrink-0 ${
              activeTab === "appliances" ? "hidden lg:flex" : "flex"
            } flex-col`}
          >
            <ChatInterface
              appliances={appliances}
              initialMessage={chatInitialMsg}
              onClearInitial={() => setChatInitialMsg(undefined)}
            />
          </div>
        </div>
      </div>

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
