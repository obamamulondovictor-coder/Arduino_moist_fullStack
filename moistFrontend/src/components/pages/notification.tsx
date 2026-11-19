export default function NotificationPage() {
  const alerts: { id: number; title: string; message: string; time: string; level: string }[] = [
    { id: 1, title: "Low Moisture", message: "Nursery Node C moisture dropped below 35%.", time: "2 min ago", level: "warning" },
    { id: 2, title: "Device Online", message: "ESP32-001 reconnected successfully.", time: "10 min ago", level: "success" },
    { id: 3, title: "Pump Activated", message: "Field Node B pump turned ON (auto mode).", time: "25 min ago", level: "info" },
    { id: 4, title: "Scheduled Check", message: "Daily sensor health check completed.", time: "1 hr ago", level: "info" },
  ];

  const levelClass = (level: string): string => {
    if (level === "warning") return "bg-orange-500/20 text-orange-300 border-orange-400/30";
    if (level === "success") return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
    return "bg-sky-500/20 text-sky-300 border-sky-400/30";
  };

  return (
    <div className="w-full text-white">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
        <p className="text-sm text-emerald-100/70 mt-1">Recent system alerts and activity updates (static).</p>
      </div>

      <div className="bg-white/10 border border-white/15 rounded-xl p-4 md:p-5">
        <div className="space-y-3">
          {alerts.map((alert: { id: number; title: string; message: string; time: string; level: string }) => (
            <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={"text-xs px-2 py-0.5 rounded-full border " + levelClass(alert.level)}>{alert.level}</span>
                  <h2 className="font-semibold">{alert.title}</h2>
                </div>
                <p className="text-sm text-emerald-100/75">{alert.message}</p>
              </div>
              <span className="text-xs text-emerald-100/60">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}