import { Line } from "react-chartjs-2";
import { useTheme } from "../hooks/useTheme";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function toDate(value: string): Date {
  const d: Date = new Date(value);
  return d;
}

function formatHour(value: string): string {
  const d: Date = toDate(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleTimeString([], { hour: "numeric" });
}

function formatDay(value: string): string {
  const d: Date = toDate(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString([], { weekday: "short" });
}

function formatMonth(value: string): string {
  const d: Date = toDate(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString([], { month: "short" });
}

function buildSeries(readings: { moisture: number; created_at: string }[], wantedData: string): { labels: string[]; values: number[] } {
  const items: { moisture: number; created_at: string }[] = Array.isArray(readings) ? [...readings] : [];
  items.sort((a: { moisture: number; created_at: string }, b: { moisture: number; created_at: string }) => {
    return toDate(a.created_at).getTime() - toDate(b.created_at).getTime();
  });

  if (wantedData === "hour") {
    const slice: { moisture: number; created_at: string }[] = items.slice(-12);
    return {
      labels: slice.map((r: { moisture: number; created_at: string }) => formatHour(r.created_at)),
      values: slice.map((r: { moisture: number; created_at: string }) => Number(r.moisture || 0)),
    };
  }

  if (wantedData === "month") {
    const map: { [key: string]: { label: string; total: number; count: number; time: number } } = {};
    items.forEach((r: { moisture: number; created_at: string }) => {
      const d: Date = toDate(r.created_at);
      if (isNaN(d.getTime())) return;
      const key: string = d.getFullYear() + "-" + d.getMonth();
      if (!map[key]) {
        map[key] = { label: formatMonth(r.created_at), total: 0, count: 0, time: new Date(d.getFullYear(), d.getMonth(), 1).getTime() };
      }
      map[key].total += Number(r.moisture || 0);
      map[key].count += 1;
    });
    const groups: { label: string; total: number; count: number; time: number }[] = Object.keys(map).map((k: string) => map[k]);
    groups.sort((a: { time: number }, b: { time: number }) => a.time - b.time);
    const slice: { label: string; total: number; count: number }[] = groups.slice(-12);
    return {
      labels: slice.map((g: { label: string }) => g.label),
      values: slice.map((g: { total: number; count: number }) => (g.count ? Math.round((g.total / g.count) * 10) / 10 : 0)),
    };
  }

  const map: { [key: string]: { label: string; total: number; count: number; time: number } } = {};
  items.forEach((r: { moisture: number; created_at: string }) => {
    const d: Date = toDate(r.created_at);
    if (isNaN(d.getTime())) return;
    const key: string = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
    if (!map[key]) {
      map[key] = { label: formatDay(r.created_at), total: 0, count: 0, time: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() };
    }
    map[key].total += Number(r.moisture || 0);
    map[key].count += 1;
  });
  const groups: { label: string; total: number; count: number; time: number }[] = Object.keys(map).map((k: string) => map[k]);
  groups.sort((a: { time: number }, b: { time: number }) => a.time - b.time);
  const slice: { label: string; total: number; count: number }[] = groups.slice(-7);
  return {
    labels: slice.map((g: { label: string }) => g.label),
    values: slice.map((g: { total: number; count: number }) => (g.count ? Math.round((g.total / g.count) * 10) / 10 : 0)),
  };
}

export default function LineChart({ wantedData, readings }: { wantedData: string; readings?: { moisture: number; created_at: string }[] }) {
  const series: { labels: string[]; values: number[] } = buildSeries(readings || [], wantedData);
  const hasData: boolean = series.values.length > 0;
  const { isDark } = useTheme();
  const textColor: string = isDark ? "#e8f3ea" : "#475569";
  const gridColor: string = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,60,30,0.08)";
  const pointBackgroundColor: string = isDark ? "#0b1f12" : "#ecfdf5";

  const data = {
    labels: hasData ? series.labels : ["No data"],
    datasets: [
      {
        label: "Soil Moisture (%)",
        data: hasData ? series.values : [0],
        tension: 0.4,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        pointBackgroundColor,
        pointBorderColor: "#10b981",
        pointBorderWidth: 2,
        pointRadius: 3,
        fill: true,
      },
    ],
  };

  const option = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
  };

  return (
    <div className="w-full h-72 md:h-80">
      <Line data={data} options={option} />
    </div>
  );
}
