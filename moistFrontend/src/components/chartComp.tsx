import { Line } from "react-chartjs-2";
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

const moistDataDays: { id: number; day: string; soilMoisture: number }[] = [
  { id: 1, day: "Mon", soilMoisture: 68 },
  { id: 2, day: "Tue", soilMoisture: 55 },
  { id: 3, day: "Wed", soilMoisture: 48 },
  { id: 4, day: "Thu", soilMoisture: 42 },
  { id: 5, day: "Fri", soilMoisture: 50 },
  { id: 6, day: "Sat", soilMoisture: 72 },
  { id: 7, day: "Sun", soilMoisture: 66 },
];

const moistDataHour: { id: number; hour: string; soilMoisture: number }[] = [
  { id: 1, hour: "12 AM", soilMoisture: 62 },
  { id: 2, hour: "2 AM", soilMoisture: 61 },
  { id: 3, hour: "4 AM", soilMoisture: 60 },
  { id: 4, hour: "6 AM", soilMoisture: 78 },
  { id: 5, hour: "8 AM", soilMoisture: 75 },
  { id: 6, hour: "10 AM", soilMoisture: 70 },
  { id: 7, hour: "12 PM", soilMoisture: 65 },
  { id: 8, hour: "2 PM", soilMoisture: 58 },
  { id: 9, hour: "4 PM", soilMoisture: 53 },
  { id: 10, hour: "6 PM", soilMoisture: 50 },
  { id: 11, hour: "8 PM", soilMoisture: 49 },
  { id: 12, hour: "10 PM", soilMoisture: 48 },
];

const moistDataMonth: { id: number; month: string; soilMoisture: number }[] = [
  { id: 1, month: "Jan", soilMoisture: 68 },
  { id: 2, month: "Feb", soilMoisture: 71 },
  { id: 3, month: "Mar", soilMoisture: 79 },
  { id: 4, month: "Apr", soilMoisture: 84 },
  { id: 5, month: "May", soilMoisture: 76 },
  { id: 6, month: "Jun", soilMoisture: 52 },
  { id: 7, month: "Jul", soilMoisture: 41 },
  { id: 8, month: "Aug", soilMoisture: 43 },
  { id: 9, month: "Sep", soilMoisture: 61 },
  { id: 10, month: "Oct", soilMoisture: 75 },
  { id: 11, month: "Nov", soilMoisture: 81 },
  { id: 12, month: "Dec", soilMoisture: 73 },
];

export default function LineChart({ wantedData }: { wantedData: string }) {
  let labels: string[] = [];
  let chartValues: number[] = [];

  if (wantedData === "hour") {
    labels = moistDataHour.map((data: { id: number; hour: string; soilMoisture: number }) => data.hour);
    chartValues = moistDataHour.map((data: { id: number; hour: string; soilMoisture: number }) => data.soilMoisture);
  } else if (wantedData === "month") {
    labels = moistDataMonth.map((data: { id: number; month: string; soilMoisture: number }) => data.month);
    chartValues = moistDataMonth.map((data: { id: number; month: string; soilMoisture: number }) => data.soilMoisture);
  } else {
    labels = moistDataDays.map((data: { id: number; day: string; soilMoisture: number }) => data.day);
    chartValues = moistDataDays.map((data: { id: number; day: string; soilMoisture: number }) => data.soilMoisture);
  }

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Soil Moisture (%)",
        data: chartValues,
        tension: 0.4,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        pointBackgroundColor: "#ecfdf5",
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
          color: "#d1fae5",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#a7f3d0" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
      y: {
        ticks: { color: "#a7f3d0" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
    },
  };

  return (
    <div className="w-full h-72 md:h-80">
      <Line data={data} options={option} />
    </div>
  );
}
