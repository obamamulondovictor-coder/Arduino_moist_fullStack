import { useState, useEffect, useRef } from "react";
import { LuSunMoon } from "react-icons/lu";
import { IoMdMoon } from "react-icons/io";
import { MdDeviceUnknown, MdAutoDelete, MdWarning } from "react-icons/md";
import { BsMoisture } from "react-icons/bs";
import { FaArrowUpFromWaterPump } from "react-icons/fa6";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import { CiWifiOn, CiWifiOff } from "react-icons/ci";
import { VscDebugRestart } from "react-icons/vsc";
import { IoSettingsOutline, IoSearch } from "react-icons/io5";
import LineChart from "../chartComp";
export default function MainDash() {
  const [isOnline] = useState<boolean>(true);
  const [wantedData, setWantedData] = useState<string>("days");
  const [searchValue, setSearchValue] = useState<string>("");
  const [theme, setTheme] = useState<string>(localStorage.getItem("theme") || "white");
  const searchRef = useRef<HTMLInputElement>(null);

  const handleWantedData = (data: string) => {
    setWantedData(data);
  };

  const handleThemeToggle = () => {
    const newMode: string = theme === "dark" ? "white" : "dark";
    setTheme(newMode);
    localStorage.setItem("theme", newMode);

    const relImage = document.getElementById("relIcon") as HTMLLinkElement | null;
    if (newMode === "dark") {
      document.documentElement.classList.add("dark");
      if (relImage) relImage.href = "/agri_dark.svg";
    } else {
      document.documentElement.classList.remove("dark");
      if (relImage) relImage.href = "/agri_white.svg";
    }
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

  return (
    <>
      {/* ================= MAIN DASHBOARD ================= */}

      <div className="w-full min-h-screen p-3 md:p-5  text-gray-900 dark:text-white transition-colors duration-300">
        {/* ================= TOP NAVIGATION ================= */}

        <div className="w-full mb-7">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            {/* SEARCH DEVICE */}

            <div className="relative flex items-center w-full max-w-md group">
              {/* SEARCH ICON */}
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

              {/* SEARCH INPUT */}
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

              {/* KEYBOARD SHORTCUT */}
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

            {/* THEME AND BACKEND STATUS */}

            <div
              className="flex items-center gap-3 p-2 rounded-xl
              bg-white dark:bg-green-950/60
              border border-gray-200 dark:border-white/10 shadow-sm"
            >
              {/* THEME TOGGLE */}

              <button
                onClick={handleThemeToggle}
                className="p-2.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/10 transition-all cursor-pointer text-xl"
                title="Toggle Theme"
              >
                {theme === "white" ? <LuSunMoon /> : <IoMdMoon />}
              </button>

              {/* DIVIDER */}

              <div className="h-6 w-px bg-gray-200 dark:bg-white/10"></div>

              {/* BACKEND CONNECTION */}

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

        {/* ================= DASHBOARD OVERVIEW ================= */}

        <div className="mb-7">
          <div className="mb-5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor your smart agriculture system and devices.
            </p>
          </div>

          {/* ================= STATISTICS CARDS ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* TOTAL DEVICES */}

            <div className="bg-white dark:bg-green-950/40 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Device Total Active
                  </p>

                  <h2 className="text-3xl font-bold mt-3">--</h2>

                  <p className="text-xs text-gray-400 mt-2">
                    Connected devices
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-3xl">
                  <MdDeviceUnknown />
                </div>
              </div>
            </div>

            {/* SOIL MOISTURE */}

            <div className="bg-white dark:bg-green-950/40 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Soil Moisture
                  </p>

                  <h2 className="text-3xl font-bold mt-3">--</h2>

                  <p className="text-xs text-gray-400 mt-2">
                    Latest sensor reading
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-3xl">
                  <BsMoisture />
                </div>
              </div>
            </div>

            {/* PUMP STATUS */}

            <div className="bg-white dark:bg-green-950/40 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pump Status
                  </p>

                  <h2 className="text-3xl font-bold mt-3">--</h2>

                  <p className="text-xs text-gray-400 mt-2">
                    Irrigation system
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-3xl">
                  <FaArrowUpFromWaterPump />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DEVICE MANAGEMENT ================= */}

        <div className="bg-white dark:bg-green-950/40 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm mb-7">
          {/* DEVICE MANAGEMENT HEADER */}

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Device Management
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage and monitor your connected agricultural devices.
              </p>
            </div>

            <button className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:gap-3 transition-all">
              View All <FaArrowRight />
            </button>
          </div>

          {/* DEVICE INFORMATION CARD */}

          <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-4 md:p-5 bg-gray-50 dark:bg-[#031b10]">
            {/* DEVICE NAME AND STATUS */}

            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-2xl">
                  <MdDeviceUnknown />
                </div>

                <div>
                  <h3 className="font-bold text-base">ESP32-Agri-001</h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Smart Agriculture Controller
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isOnline
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                }`}
              >
                {isOnline ? (
                  <CiWifiOn className="text-lg" />
                ) : (
                  <CiWifiOff className="text-lg" />
                )}

                {isOnline ? "Online" : "Offline"}
              </div>
            </div>

            {/* DEVICE LOCATION AND LAST SEEN */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-white/10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Device Location
                </p>

                <p className="text-sm font-semibold">Main Farm Field</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Last Seen
                </p>

                <p className="text-sm font-semibold">Nov 11, 2026 09:45 AM</p>
              </div>
            </div>

            {/* DEVICE ACTION BUTTONS */}

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

          {/* ================= SENSOR TREND CHART ================= */}

          <div className="mt-7 bg-gray-50 dark:bg-[#031b10] p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-white/10">
            {/* CHART HEADER */}

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg tracking-wide">
                  Sensor Trend
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Monitor historical sensor measurements.
                </p>
              </div>

              {/* CHART PERIOD BUTTONS */}

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

            {/* CHART DISPLAY */}

            <div className="w-full overflow-hidden">
              <LineChart wantedData={wantedData} />
            </div>
          </div>

          {/* ================= SYSTEM ALERTS ================= */}

          <div className="bg-gray-50 dark:bg-[#031b10] p-4 md:p-5 mt-7 rounded-2xl border border-gray-200 dark:border-white/10">
            {/* ALERT HEADER */}

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

            {/* ALERT CONTAINER */}

            <div className="bg-white dark:bg-green-950/60 border border-gray-200 dark:border-white/10 rounded-xl p-4">
              {/* DEVICE ONLINE ALERT */}

              <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>

                  <div>
                    <p className="text-sm font-semibold">Device Online</p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ESP32-Agri-001 is back online
                    </p>
                  </div>
                </div>

                <span className="text-xs text-gray-400">5 min ago</span>
              </div>

              {/* LOW WATER LEVEL ALERT */}

              <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>

                  <div>
                    <p className="text-sm font-semibold">Low Water Level</p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Water level is below 20% at Main Farm Field
                    </p>
                  </div>
                </div>

                <span className="text-xs text-gray-400">2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
