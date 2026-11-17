import React from "react";
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

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const MoistDataDays = [
  { id: 1, day: "Mon", SoilMoisture: 90 },
  { id: 2, day: "Tue", SoilMoisture: 50 },
  { id: 3, day: "Wed", SoilMoisture: 20 },
  { id: 4, day: "Thur", SoilMoisture: 5 },
  { id: 5, day: "Fri", SoilMoisture: 20 },
  { id: 6, day: "Sat", SoilMoisture: 100 },
  { id: 7, day: "Sun", SoilMoisture: 93 },
];
const MoistDataHour = [
  { id: 1, hour: '12:00 AM', SoilMoisture: 620 },
  { id: 2, hour: '1:00 AM', SoilMoisture: 615 },
  { id: 3, hour: '2:00 AM', SoilMoisture: 610 },
  { id: 4, hour: '3:00 AM', SoilMoisture: 605 },
  { id: 5, hour: '4:00 AM', SoilMoisture: 600 },
  { id: 6, hour: '5:00 AM', SoilMoisture: 595 },
  { id: 7, hour: '6:00 AM', SoilMoisture: 780 }, // Morning watering spike
  { id: 8, hour: '7:00 AM', SoilMoisture: 765 },
  { id: 9, hour: '8:00 AM', SoilMoisture: 750 },
  { id: 10, hour: '9:00 AM', SoilMoisture: 730 },
  { id: 11, hour: '10:00 AM', SoilMoisture: 705 },
  { id: 12, hour: '11:00 AM', SoilMoisture: 680 },
  { id: 13, hour: '12:00 PM', SoilMoisture: 650 },
  { id: 14, hour: '1:00 PM', SoilMoisture: 615 },
  { id: 15, hour: '2:00 PM', SoilMoisture: 580 }, // Afternoon evaporation dip
  { id: 16, hour: '3:00 PM', SoilMoisture: 550 },
  { id: 17, hour: '4:00 PM', SoilMoisture: 530 },
  { id: 18, hour: '5:00 PM', SoilMoisture: 515 },
  { id: 19, hour: '6:00 PM', SoilMoisture: 505 },
  { id: 20, hour: '7:00 PM', SoilMoisture: 500 },
  { id: 21, hour: '8:00 PM', SoilMoisture: 495 },
  { id: 22, hour: '9:00 PM', SoilMoisture: 490 },
  { id: 23, hour: '10:00 PM', SoilMoisture: 488 },
  { id: 24, hour: '11:00 PM', SoilMoisture: 485 },
];
const MoistDataMonth = [
  { id: 1, month: 'Jan', SoilMoisture: 680 },
  { id: 2, month: 'Feb', SoilMoisture: 710 },
  { id: 3, month: 'Mar', SoilMoisture: 790 },
  { id: 4, month: 'Apr', SoilMoisture: 840 },
  { id: 5, month: 'May', SoilMoisture: 760 },
  { id: 6, month: 'Jun', SoilMoisture: 520 },
  { id: 7, month: 'Jul', SoilMoisture: 410 },
  { id: 8, month: 'Aug', SoilMoisture: 430 },
  { id: 9, month: 'Sep', SoilMoisture: 610 },
  { id: 10, month: 'Oct', SoilMoisture: 750 },
  { id: 11, month: 'Nov', SoilMoisture: 810 },
  { id: 12, month: 'Dec', SoilMoisture: 730 },
];


//add the prop to pass the active data in the range to mark it as active

const LineChart = ({wantedData}: {wantedData :String}) => {
     let label = null;
  let chartValues = null;

  if (wantedData === 'hour') {
    label = MoistDataHour.map((data) => data.hour);
    chartValues = MoistDataHour.map((data) => data.SoilMoisture);

  } else if (wantedData === 'month') {
    label = MoistDataMonth.map((data) => data.month);
    chartValues = MoistDataMonth.map((data) => data.SoilMoisture);
  }
  else if(wantedData === "days"){
    label = MoistDataDays.map((data) => data.day);
    chartValues = MoistDataMonth.map((data) => data.SoilMoisture)
  }

  const data = {
    labels: label,
    datasets: [
      {
        label: "Soil Moisture Trends",
        data: chartValues,
        tension: 0.5, // Updated from lineTension
        backgroundColor: "#9F7AEA",
        borderColor: "#9F7AEA",
        pointBorderColor: "#B57295",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#D6BCFA",
        pointHoverBorderColor: "#D6BCFA",
        pointRadius: 3,
      },
    ],
  };

  const option = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ color: "#805AD5" }}>Soild Trending Chart</h1>
      <Line data={data} options={option} />
    </div>
  );
};

export default LineChart;
