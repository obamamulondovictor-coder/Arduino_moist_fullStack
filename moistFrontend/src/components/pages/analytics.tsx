import { useEffect, useState } from "react";
import LineChart from "../chartComp";
import { fetchDevices, fetchReadings } from "../../services/api";

export default function AnalyticsPage() {
  const [range, setRange] = useState<string>("days");
  const [devices, setDevices] = useState<{ device_id: string; device_name: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [readings, setReadings] = useState<{ id: number; device_id: string; moisture: number; temperature: number; mode: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        const d = await fetchDevices();
        setDevices(d.map((x: { device_id: string; device_name: string }) => ({ device_id: x.device_id, device_name: x.device_name })));
        setSelectedDevice((prev: string) => (prev ? prev : (d.length > 0 ? d[0].device_id : "")));
        setError("");
      } catch {
        setError("Unable to load devices from backend");
      }
    };
    const id: number = window.setTimeout(() => { void run(); }, 0);
    return () => { window.clearTimeout(id); };
  }, []);

  useEffect(() => {
    if (!selectedDevice) {
      const id: number = window.setTimeout(() => {
        setReadings([]);
        setLoading(false);
      }, 0);
      return () => { window.clearTimeout(id); };
    }
    let cancelled: boolean = false;
    const run = async (): Promise<void> => {
      try {
        const r = await fetchReadings(selectedDevice, 200);
        if (cancelled) return;
        setReadings(r);
        setError("");
      } catch {
        if (!cancelled) setError("Unable to load readings from backend");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const start: number = window.setTimeout(() => {
      setLoading(true);
      void run();
    }, 0);
    const timer: number = window.setInterval(() => { void run(); }, 8000);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [selectedDevice]);

  const avgMoisture: string = readings.length
    ? (readings.reduce((sum: number, r: { moisture: number }) => sum + Number(r.moisture || 0), 0) / readings.length).toFixed(1) + "%"
    : "--";
  const avgTemp: string = readings.length
    ? (readings.reduce((sum: number, r: { temperature: number }) => sum + Number(r.temperature || 0), 0) / readings.length).toFixed(1) + "°C"
    : "--";
  const latest: { moisture: number; temperature: number; created_at: string } | null = readings.length ? readings[0] : null;

  const cards: { label: string; value: string; note: string }[] = [
    { label: "Average Moisture", value: avgMoisture, note: "Selected device" },
    { label: "Average Temperature", value: avgTemp, note: "Selected device" },
    { label: "Readings Count", value: String(readings.length), note: "Latest records" },
    { label: "Latest Moisture", value: latest ? Number(latest.moisture).toFixed(1) + "%" : "--", note: latest ? new Date(latest.created_at).toLocaleString() : "No data" },
  ];

  return (
    <div className="w-full text-[var(--text)]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Real-time soil moisture trends and readings from backend.</p>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">Device</label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-emerald-500"
          >
            {devices.length === 0 ? <option value="">No devices</option> : null}
            {devices.map((d: { device_id: string; device_name: string }) => (
              <option key={d.device_id} value={d.device_id} className="text-black">
                {d.device_name || d.device_id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-red-300 mb-4">{error}</p> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((card: { label: string; value: string; note: string }) => (
          <div key={card.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4">
            <p className="text-xs text-[var(--text-muted)]">{card.label}</p>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
            <p className="text-xs text-[var(--text-soft)] mt-1">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">Moisture Trend</h2>
          <div className="flex gap-2">
            <button onClick={() => setRange("hour")} className={range === "hour" ? "px-3 py-1.5 rounded-lg bg-[var(--accent-strong)] text-white text-sm" : "rounded-lg bg-[var(--surface-soft)] text-[var(--text-muted)] text-sm"}>Hours</button>
            <button onClick={() => setRange("days")} className={range === "days" ? "px-3 py-1.5 rounded-lg bg-[var(--accent-strong)] text-white text-sm" : "rounded-lg bg-[var(--surface-soft)] text-[var(--text-muted)] text-sm"}>Days</button>
            <button onClick={() => setRange("month")} className={range === "month" ? "px-3 py-1.5 rounded-lg bg-[var(--accent-strong)] text-white text-sm" : "rounded-lg bg-[var(--surface-soft)] text-[var(--text-muted)] text-sm"}>Month</button>
          </div>
        </div>
        {loading ? <p className="text-sm text-[var(--text-muted)]">Loading readings...</p> : <LineChart wantedData={range} readings={readings} />}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 md:p-5">
        <h2 className="text-lg font-semibold mb-3">Recent Readings</h2>
        {readings.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No readings available.</p> : null}
        <div className="space-y-3 text-sm">
          {readings.slice(0, 5).map((r: { id: number; moisture: number; temperature: number; mode: string; created_at: string }) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-0 last:pb-0">
              <span>{new Date(r.created_at).toLocaleString()} - {r.mode}</span>
              <span className="text-[var(--accent)]">{Number(r.moisture).toFixed(1)}% / {Number(r.temperature).toFixed(1)}°C</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
