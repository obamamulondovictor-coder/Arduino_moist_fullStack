import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineBugReport } from "react-icons/md";
import { MdOutlineAnalytics } from "react-icons/md";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import "../styles/leftNav.style.css";

export default function LeftNavbar({
  activePage,
  setActivePage,
}: {
  activePage: string;
  setActivePage: (page: string) => void;
}) {
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
    <div className="bg-green-950/70 border-r border-white/10 h-full overflow-y-auto p-4 w-64 flex flex-col justify-between text-white shrink-0">
      <div>
        <div className="flex items-center gap-3 mb-8 px-1">
          <img src="/logo.png" alt="AgriSense logo" className="w-10 h-10 object-contain" />
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

      <div className="border-t border-white/10 pt-4 mt-4">
        <button onClick={() => handleNavigation("profile")} className={itemClass("profile")}>
          <div className="w-9 h-9 rounded-full bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-sm font-bold">
            OM
          </div>
          <div className="text-sm text-left">
            <p className="font-medium">Obama M. Victor</p>
            <p className="text-xs text-emerald-200/70">Admin</p>
          </div>
        </button>
      </div>
    </div>
  );
}