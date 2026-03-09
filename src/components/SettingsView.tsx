"use client";

interface SettingsViewProps {
  onClearData: () => void;
}

export default function SettingsView({ onClearData }: SettingsViewProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">App preferences and data</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* About */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">About</h2>
          </div>
          <div className="px-4 py-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-haven-500 to-haven-700 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-3xl">🏠</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">HavenApplianceAlly</p>
              <p className="text-sm text-gray-500">Version 1.0.0</p>
              <p className="text-xs text-gray-400 mt-0.5">Powered by Claude Opus 4.6</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Track your home appliances, monitor warranties and maintenance schedules, and get AI-powered help from HavenAlly.
            </p>
          </div>
        </section>

        {/* AI Assistant */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">AI Assistant</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <SettingRow
              icon="🤖"
              title="HavenAlly Model"
              value="Claude Opus 4.6"
            />
            <SettingRow
              icon="🔒"
              title="Data Privacy"
              value="Appliance data stays on device"
            />
            <SettingRow
              icon="⚡"
              title="Response Mode"
              value="Streaming (real-time)"
            />
          </div>
        </section>

        {/* Data */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Data</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <SettingRow
              icon="💾"
              title="Storage"
              value="Browser localStorage"
            />
          </div>
          <div className="px-4 py-3">
            <button
              onClick={onClearData}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              Clear All Appliance Data
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              This will permanently delete all your appliances
            </p>
          </div>
        </section>

        {/* Maintenance guide */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Quick Guide</h2>
          </div>
          <div className="px-4 py-4 space-y-3">
            {[
              { icon: "🟢", label: "Maintained ≤ 6 months ago", desc: "All good" },
              { icon: "🟡", label: "Maintained 6–12 months ago", desc: "Consider scheduling" },
              { icon: "🔴", label: "Maintained 12+ months ago", desc: "Maintenance due" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-4" />
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-800">{title}</span>
      </div>
      <span className="text-sm text-gray-500 text-right">{value}</span>
    </div>
  );
}
