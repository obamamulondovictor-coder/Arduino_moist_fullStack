import { useState } from "react";
import LineChart from "../chartComp";

export default function AnalyticsPage() {
  const [range, setRange] = useState<string>("days");

  const cards: { label: string; value: string; note: string }[] = [
    { label: "Average Moisture", value: "56%", note: "Last 7 days" },
    { label: "Water Usage", value: "240 L", note: "Estimated" },
    { label: "Pump Runtime", value: "14 h", note: "This week" },
    { label: "Alerts Triggered", value: "3", note: "Low moisture" },
  ];

  return (
    <div className="w-full text-white">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-sm text-emerald-100/70 mt-1">Static overview of soil moisture trends and irrigation activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((card: { label: string; value: string; note: string }) => (
          <div key={card.label} className="bg-white/10 border border-white/15 rounded-xl p-4">
            <p className="text-xs text-emerald-100/70">{card.label}</p>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
            <p className="text-xs text-emerald-100/60 mt-1">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/10 border border-white/15 rounded-xl p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">Moisture Trend</h2>
          <div className="flex gap-2">
            <button onClick={() => setRange("hour")} className={range === "hour" ? "px-3 py-1.5 rounded-lg bg-emerald-600 text-sm" : "px-3 py-1.5 rounded-lg bg-white/10 text-sm"}>Hours</button>
            <button onClick={() => setRange("days")} className={range === "days" ? "px-3 py-1.5 rounded-lg bg-emerald-600 text-sm" : "px-3 py-1.5 rounded-lg bg-white/10 text-sm"}>Days</button>
            <button onClick={() => setRange("month")} className={range === "month" ? "px-3 py-1.5 rounded-lg bg-emerald-600 text-sm" : "px-3 py-1.5 rounded-lg bg-white/10 text-sm"}>Month</button>
          </div>
        </div>
        <LineChart wantedData={range} />
      </div>

      <div className="bg-white/10 border border-white/15 rounded-xl p-4 md:p-5">
        <h2 className="text-lg font-semibold mb-3">Recent Report Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span>Greenhouse Node A - moisture stable</span>
            <span className="text-emerald-300">Normal</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span>Field Node B - irrigation cycle completed</span>
            <span className="text-emerald-300">Good</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Nursery Node C - low moisture alert</span>
            <span className="text-orange-300">Warning</span>
          </div>
        </div>
      </div>
    </div>
  );
}