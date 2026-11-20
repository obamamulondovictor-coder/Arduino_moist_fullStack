import { useEffect, useState } from "react";
import { fetchAlerts } from "../../services/api";

export default function NotificationPage() {
  const [alerts, setAlerts] = useState<{ id: number; device_id: string; device_name: string | null; moisture_level: number; alert_message: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled: boolean = false;
    const load = async (): Promise<void> => {
      try {
        const data = await fetchAlerts(50);
        if (cancelled) return;
        setAlerts(data);
        setError("");
      } catch {
        if (!cancelled) setError("Unable to load alerts from backend");
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

  const levelFor = (moisture: number): string => {
    if (Number(moisture) < 20) return "critical";
    if (Number(moisture) < 30) return "warning";
    return "info";
  };

  const levelClass = (level: string): string => {
    if (level === "critical") return "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger-border)]";
    if (level === "warning") return "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)]";
    return "bg-[var(--info-soft)] text-[var(--info)] border-[var(--info-border)]";
  };

  return (
    <div className="w-full text-[var(--text)]">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Real-time soil alerts from backend (auto-refresh 5s).</p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 md:p-5">
        {error ? <p className="text-sm text-[var(--danger)] mb-3">{error}</p> : null}
        {loading ? <p className="text-sm text-[var(--text-muted)]">Loading alerts...</p> : null}
        {!loading && alerts.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No alerts yet.</p> : null}
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert: { id: number; device_id: string; device_name: string | null; moisture_level: number; alert_message: string; created_at: string }) => {
              const level: string = levelFor(alert.moisture_level);
              return (
                <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={"text-xs px-2 py-0.5 rounded-full border " + levelClass(level)}>{level}</span>
                      <h2 className="font-semibold">Low Moisture - {alert.device_name || alert.device_id}</h2>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{alert.alert_message} (moisture: {Number(alert.moisture_level).toFixed(1)}%)</p>
                  </div>
                  <span className="text-xs text-[var(--text-soft)]">{new Date(alert.created_at).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
