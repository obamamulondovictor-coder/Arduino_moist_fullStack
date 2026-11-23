import { useEffect, useState } from "react";
import { fetchDevices, fetchLatestReadings } from "../../services/api";

export default function DevicePage() {
  const [devices, setDevices] = useState<{ device_id: string; device_name: string; ip_address: string | null; operating_mode: string; pump_state: string; location: string | null; status: string; registered_at: string }[]>([]);
  const [latest, setLatest] = useState<{ id: number; device_id: string; device_name: string | null; moisture: number; temperature: number; mode: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled: boolean = false;
    const load = async (): Promise<void> => {
      try {
        const [d, l] = await Promise.all([fetchDevices(), fetchLatestReadings()]);
        if (cancelled) return;
        setDevices(d);
        setLatest(l);
        setError("");
      } catch {
        if (!cancelled) setError("Unable to load devices from backend");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const start: number = window.setTimeout(() => { void load(); }, 0);
    const timer: number = window.setInterval(() => { void load(); }, 5000);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, []);

  const latestByDevice: { [key: string]: { id: number; device_id: string; device_name: string | null; moisture: number; temperature: number; mode: string; created_at: string } } = {};
  latest.forEach((r: { id: number; device_id: string; device_name: string | null; moisture: number; temperature: number; mode: string; created_at: string }) => {
    latestByDevice[r.device_id] = r;
  });

  const onlineCount: number = devices.filter((d: { status: string }) => d.status === "active").length;
  const offlineCount: number = Math.max(0, devices.length - onlineCount);

  return (
    <div className="w-full p-1 md:p-2 text-[var(--text)]">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Device Management</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Manage connected ESP32 devices and irrigation controllers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4">
          <p className="text-xs text-[var(--text-muted)]">Total Devices</p>
          <p className="text-2xl font-bold mt-2">{devices.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4">
          <p className="text-xs text-[var(--text-muted)]">Active</p>
          <p className="text-2xl font-bold mt-2 text-[var(--accent)]">{onlineCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4">
          <p className="text-xs text-[var(--text-muted)]">Inactive</p>
          <p className="text-2xl font-bold mt-2 text-[var(--danger)]">{offlineCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Registered Devices</h2>
          <span className="text-xs text-[var(--text-soft)]">Auto-refresh 5s</span>
        </div>
        {error ? <p className="text-sm text-[var(--danger)] mb-3">{error}</p> : null}
        {loading ? <p className="text-sm text-[var(--text-muted)]">Loading devices...</p> : null}
        {!loading && devices.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No devices registered yet.</p> : null}
        {devices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="py-3 pr-3">Device ID</th>
                  <th className="py-3 pr-3">Name</th>
                  <th className="py-3 pr-3">Location</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-3">Moisture</th>
                  <th className="py-3 pr-3">Pump</th>
                  <th className="py-3 pr-3">Last Reading</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device: { device_id: string; device_name: string; location: string | null; status: string; pump_state: string }) => {
                  const reading: { moisture: number; created_at: string } | undefined = latestByDevice[device.device_id];
                  return (
                    <tr key={device.device_id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-3 pr-3 font-medium">{device.device_id}</td>
                      <td className="py-3 pr-3">{device.device_name || "-"}</td>
                      <td className="py-3 pr-3">{device.location || "-"}</td>
                      <td className="py-3 pr-3">
                        <span className={device.status === "active" ? "text-[var(--accent)]" : "text-[var(--danger)]"}>{device.status}</span>
                      </td>
                      <td className="py-3 pr-3">{reading ? Number(reading.moisture).toFixed(1) + "%" : "--"}</td>
                      <td className="py-3 pr-3">{device.pump_state || "--"}</td>
                      <td className="py-3 pr-3 text-[var(--text-muted)]">{reading ? new Date(reading.created_at).toLocaleString() : "--"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
