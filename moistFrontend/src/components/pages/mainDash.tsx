import { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { MdDeviceUnknown, MdAutoDelete, MdWarning } from "react-icons/md";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import { CiWifiOn, CiWifiOff } from "react-icons/ci";
import { VscDebugRestart } from "react-icons/vsc";
import { IoSettingsOutline, IoSearch } from "react-icons/io5";
import LineChart from "../chartComp";
import { MetricCards } from "../MetricCards";
import { useDeviceSnapshot } from "../../hooks/useDeviceSnapshot";
import { useTheme } from "../../hooks/useTheme";
import { fetchHealth, fetchLatestReadings, fetchAlerts, fetchReadings } from "../../services/api";

export default function MainDash() {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [wantedData, setWantedData] = useState<string>("days");
  const [searchValue, setSearchValue] = useState<string>("");
  const { devices, deviceId, snapshot, now } = useDeviceSnapshot();
  const { isDark, toggleTheme } = useTheme();
  const [latest, setLatest] = useState<{ id: number; device_id: string; device_name: string | null; moisture: number; temperature: number; mode: string; created_at: string }[]>([]);
  const [alerts, setAlerts] = useState<{ id: number; device_id: string; device_name: string | null; moisture_level: number; alert_message: string; created_at: string }[]>([]);
  const [chartReadings, setChartReadings] = useState<{ id: number; device_id: string; moisture: number; temperature: number; mode: string; created_at: string }[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleWantedData = (data: string) => {
    setWantedData(data);
  };


  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement)?.tagName) &&
        !(event.target as HTMLElement)?.isContentEditable
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const value: string = searchValue.trim();
      if (!value) return;
      const prev: string[] = JSON.parse(localStorage.getItem("searchValue") || "[]");
      if (!prev.some((item: string) => item.toLowerCase() === value.toLowerCase())) {
        localStorage.setItem("searchValue", JSON.stringify([value, ...prev].slice(0, 8)));
      }
    }, 1200);
    return () => {
      clearTimeout(timer);
    };
  }, [searchValue]);

  useEffect(() => {
    let cancelled: boolean = false;
    const loadData = async (): Promise<void> => {
      try {
        const [health, lats, alts] = await Promise.all([
          fetchHealth(),
          fetchLatestReadings(),
          fetchAlerts(10),
        ]);
        if (cancelled) return;
        setIsOnline(health.ok);
        setLatest(lats);
        setAlerts(alts);

        const chartDeviceId: string = deviceId || (lats.length > 0 ? lats[0].device_id : "");
        if (chartDeviceId) {
          const readings = await fetchReadings(chartDeviceId, 200);
          if (!cancelled) setChartReadings(readings);
        } else {
          if (!cancelled) setChartReadings([]);
        }
      } catch {
        if (!cancelled) setIsOnline(false);
      }
    };
    const start: number = window.setTimeout(() => { void loadData(); }, 0);
    const timer: number = window.setInterval(() => { void loadData(); }, 5000);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [deviceId]);


  const latestByDevice: { [key: string]: { id: number; device_id: string; device_name: string | null; moisture: number; temperature: number; mode: string; created_at: string } } = {};
  latest.forEach((r: { id: number; device_id: string; device_name: string | null; moisture: number; temperature: number; mode: string; created_at: string }) => {
    latestByDevice[r.device_id] = r;
  });

  const featuredDevice: { device_id: string; device_name: string; ip_address: string | null; operating_mode: string; pump_state: string; location: string | null; status: string; registered_at: string } | null = devices.length > 0 ? devices[0] : null;
  const featuredReading: { id: number; device_id: string; device_name: string | null; moisture: number; temperature: number; mode: string; created_at: string } | null = featuredDevice && latestByDevice[featuredDevice.device_id] ? latestByDevice[featuredDevice.device_id] : (latest.length > 0 ? latest[0] : null);
  const featuredOnline: boolean = featuredDevice ? featuredDevice.status === "active" : false;

  return (
    <>
      <div className="w-full min-h-screen p-3 md:p-5  text-gray-900 dark:text-white transition-colors duration-300">
        <div className="w-full mb-7">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex items-center w-full max-w-md group">
              <IoSearch
                className="
    absolute left-4
    text-gray-400 dark:text-emerald-500/70
    text-lg pointer-events-none
    group-focus-within:text-emerald-600
    dark:group-focus-within:text-emerald-400
    transition-colors
  "
              />
              <input
                type="search"
                name="device"
                ref={searchRef}
                id="deviceName"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search devices, reports..."
                className="
      w-full pl-11 pr-16 py-3 rounded-xl
      bg-white dark:bg-green-950/60
      border border-gray-200 dark:border-white/10
      text-gray-800 dark:text-white
      placeholder-gray-400 text-sm
      focus:outline-none
      focus:border-emerald-500
      focus:ring-2 focus:ring-emerald-500/10
      transition-all shadow-sm
    "
              />
              <span
                className="
    absolute right-3
    flex items-center justify-center
    w-7 h-7 rounded-md
    text-xs font-semibold
    text-gray-500 dark:text-emerald-300/70
    bg-gray-100 dark:bg-green-900/70
    border border-gray-200 dark:border-white/10
    shadow-sm
    pointer-events-none
    group-focus-within:opacity-50
    transition-all
  "
              >
                /
              </span>
            </div>

            <div
              className="flex items-center gap-3 p-2 rounded-xl
              bg-white dark:bg-green-950/60
              border border-gray-200 dark:border-white/10 shadow-sm"
            >
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/10 transition-all cursor-pointer"
                title={isDark ? "Switch to light theme" : "Switch to dark theme"}
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              >
                {isDark ? <Sun className="text-lg" /> : <Moon className="text-lg" />}
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-white/10"></div>

              <div className="flex items-center gap-2 text-xs font-semibold px-3">
                <span className="relative flex h-2.5 w-2.5">
                  {isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isOnline ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  ></span>
                </span>
                <span
                  className={
                    isOnline
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500"
                  }
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </nav>
        </div>

        <div className="mb-7">
          <div className="mb-5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor your smart agriculture system and devices in real time.
            </p>
          </div>

          <MetricCards snapshot={snapshot} now={now} />
        </div>

        <div className="bg-white dark:bg-green-950/40 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm mb-7">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Device Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage and monitor your connected agricultural devices.
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:gap-3 transition-all">
              View All <FaArrowRight />
            </button>
          </div>

          <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-4 md:p-5 bg-gray-50 dark:bg-[#031b10]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-2xl">
                  <MdDeviceUnknown />
                </div>
                <div>
                  <h3 className="font-bold text-base">{featuredDevice ? featuredDevice.device_name : "No device"}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {featuredDevice ? featuredDevice.device_id : "Waiting for device telemetry"}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  featuredOnline
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                }`}
              >
                {featuredOnline ? <CiWifiOn className="text-lg" /> : <CiWifiOff className="text-lg" />}
                {featuredOnline ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-white/10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Device Location</p>
                <p className="text-sm font-semibold">{featuredDevice && featuredDevice.location ? featuredDevice.location : "--"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Seen</p>
                <p className="text-sm font-semibold">
                  {featuredReading ? new Date(featuredReading.created_at).toLocaleString() : (featuredDevice ? new Date(featuredDevice.registered_at).toLocaleString() : "--")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-all">
                <FaRegEye />
                View Details
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-white/10 text-sm font-semibold transition-all">
                <VscDebugRestart />
                Restart
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-white/10 text-sm font-semibold transition-all">
                <IoSettingsOutline />
                Configure
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-semibold transition-all">
                <MdAutoDelete />
                Remove
              </button>
            </div>
          </div>

          <div className="mt-7 bg-gray-50 dark:bg-[#031b10] p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg tracking-wide">Sensor Trend</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Monitor historical sensor measurements (real-time from backend).
                </p>
              </div>

              <div className="flex flex-row gap-1 w-fit h-fit p-1 bg-gray-200/70 dark:bg-green-950/80 rounded-xl">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    wantedData === "hour"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
                  }`}
                  onClick={() => handleWantedData("hour")}
                >
                  Hours
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    wantedData === "days"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
                  }`}
                  onClick={() => handleWantedData("days")}
                >
                  Days
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    wantedData === "month"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
                  }`}
                  onClick={() => handleWantedData("month")}
                >
                  Month
                </button>
              </div>
            </div>

            <div className="w-full overflow-hidden">
              <LineChart wantedData={wantedData} readings={chartReadings} />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#031b10] p-4 md:p-5 mt-7 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl">
                  <MdWarning />
                </span>
                <div>
                  <h3 className="font-bold text-lg">System Alerts</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Important device and system notifications.
                  </p>
                </div>
              </div>
              <button className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 hover:gap-3 transition-all">
                View All <FaArrowRight />
              </button>
            </div>

            <div className="bg-white dark:bg-green-950/60 border border-gray-200 dark:border-white/10 rounded-xl p-4">
              {alerts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No alerts from backend.</p>
              ) : null}
              {alerts.slice(0, 5).map((alert: { id: number; device_id: string; device_name: string | null; moisture_level: number; alert_message: string; created_at: string }, index: number) => (
                <div
                  key={alert.id}
                  className={
                    "flex flex-wrap items-center justify-between gap-3 py-3 " +
                    (index < Math.min(alerts.length, 5) - 1 ? "border-b border-gray-100 dark:border-white/10" : "")
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className={"w-2.5 h-2.5 rounded-full " + (Number(alert.moisture_level) < 20 ? "bg-red-500" : "bg-orange-500")}></span>
                    <div>
                      <p className="text-sm font-semibold">Low Moisture - {alert.device_name || alert.device_id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {alert.alert_message} ({Number(alert.moisture_level).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
