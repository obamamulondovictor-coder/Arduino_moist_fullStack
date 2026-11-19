import { useState } from "react";

export default function SettingPage() {
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [emailAlert, setEmailAlert] = useState<boolean>(true);
  const [smsAlert, setSmsAlert] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<string>("30");

  return (
    <div className="w-full text-white">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm text-emerald-100/70 mt-1">Configure irrigation preferences and alert behavior (static UI).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/10 border border-white/15 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Irrigation</h2>
          <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between gap-4">
              <span>Automatic irrigation mode</span>
              <input type="checkbox" checked={autoMode} onChange={() => setAutoMode(!autoMode)} className="accent-emerald-500 w-4 h-4" />
            </label>
            <label className="block">
              <span className="block mb-2">Moisture threshold (%)</span>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 focus:outline-none focus:border-emerald-400"
              />
            </label>
            <p className="text-xs text-emerald-100/60">Pump triggers when moisture falls below threshold in auto mode.</p>
          </div>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between gap-4">
              <span>Email alerts</span>
              <input type="checkbox" checked={emailAlert} onChange={() => setEmailAlert(!emailAlert)} className="accent-emerald-500 w-4 h-4" />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span>SMS alerts</span>
              <input type="checkbox" checked={smsAlert} onChange={() => setSmsAlert(!smsAlert)} className="accent-emerald-500 w-4 h-4" />
            </label>
            <label className="block">
              <span className="block mb-2">Alert email</span>
              <input type="email" value="admin@agrisense.local" readOnly className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-emerald-100/80" />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white/10 border border-white/15 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-2">System Info</h2>
        <div className="text-sm text-emerald-100/75 space-y-1">
          <p>Backend: http://localhost:3000 (not connected in static mode)</p>
          <p>Database: soil_monitoring_db</p>
          <p>Version: 0.1.0 (frontend demo)</p>
        </div>
      </div>
    </div>
  );
}