import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineBugReport, MdOutlineAnalytics } from "react-icons/md";
import { IoIosNotificationsOutline, IoMdHelpCircleOutline } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import "../styles/leftNav.style.css";

export default function LeftNavbar({
  activePage,
  setActivePage,
}: {
  activePage: string;
  setActivePage: (page: string) => void;
}) {
  const { isDark, toggleTheme } = useTheme();

  const handleNavigation = (page: string) => {
    setActivePage(page);
  };

  const itemClass = (page: string): string => {
    if (activePage === page) {
      return "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all bg-emerald-500/30 border border-emerald-400/40 font-semibold text-white";
    }
    return "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all text-slate-300 hover:bg-white/10";
  };

  return (
    <div
      className="h-full w-64 shrink-0 overflow-y-auto overflow-x-hidden border-r p-4 text-white transition-colors duration-300"
      style={{ background: "var(--nav-bg)", borderColor: "var(--nav-border)" }}
    >
      <div>
        <div className="mb-8 flex items-center gap-3 px-1">
          <img src="/logo.png" alt="AgriSense logo" className="h-10 w-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wide text-gray-100">AgriSense</span>
            <span className="text-xs text-emerald-200/80">Smart Agriculture</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => handleNavigation("main")} className={itemClass("main")}>
            <IoHomeOutline className="text-xl" />
            Dashboard
          </button>
          <button onClick={() => handleNavigation("device")} className={itemClass("device")}>
            <MdOutlineBugReport className="text-xl" />
            Devices
          </button>
          <button onClick={() => handleNavigation("analytic")} className={itemClass("analytic")}>
            <MdOutlineAnalytics className="text-xl" />
            Reports
          </button>
          <button onClick={() => handleNavigation("notification")} className={itemClass("notification")}>
            <IoIosNotificationsOutline className="text-xl" />
            Notifications
          </button>
          <button onClick={() => handleNavigation("setting")} className={itemClass("setting")}>
            <CiSettings className="text-xl" />
            Settings
          </button>
          <button onClick={() => handleNavigation("help")} className={itemClass("help")}>
            <IoMdHelpCircleOutline className="text-xl" />
            Help & Support
          </button>
        </div>
      </div>

      <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--nav-border)" }}>
        <button
          type="button"
          onClick={toggleTheme}
          className="mb-2 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? <Sun className="text-lg text-amber-300" /> : <Moon className="text-lg text-emerald-300" />}
          <span>{isDark ? "Light theme" : "Dark theme"}</span>
        </button>

        <button onClick={() => handleNavigation("profile")} className={itemClass("profile")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/30 text-sm font-bold">
            OM
          </div>
          <div className="text-left text-sm">
            <p className="font-medium">Obama M. Victor</p>
            <p className="text-xs text-emerald-200/70">Admin</p>
          </div>
        </button>
      </div>
    </div>
  );
}
