import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineBugReport } from "react-icons/md";
import { TbReport } from "react-icons/tb";
import { GoAlert } from "react-icons/go";
import { CiSettings } from "react-icons/ci";
import { IoIosHelpCircleOutline } from "react-icons/io";

import "../styles/leftNav.style.css";

export default function LeftNavbar({ activePage, setActivePage }) {

    const handleNavigation = (page) => {
        setActivePage(page);
    };

    return (
        /* Using bg-green-950/60 makes it blend into your glass container while keeping your green theme */
        <div className="bg-green-950/60 border-r border-white/10 h-full p-5 w-64 flex flex-col justify-between text-white shrink-0">
            
            <div>
                {/* The heading AgriSense */}
                <div className="flex items-center gap-3 mb-8 px-2">
                    <img src="../assets/logo.png" alt="Logo Of AgriSense" className="w-8 h-8 object-contain" />
                    <span className="text-xl font-bold tracking-wide text-emerald-300">AgriSense</span>
                </div>

                {/* The navigation menus */}
                <div className="flex flex-col gap-2">
                    
                    {/* Dashboard / Main Button */}
                    <button 
                        onClick={() => handleNavigation("main")}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            activePage === "main" 
                                ? "bg-emerald-500/30 border border-emerald-400/40 font-bold text-white shadow-md" 
                                : "text-slate-300 hover:bg-white/10"
                        }`}
                    >
                        <IoHomeOutline className="text-xl" />
                        Dashboard
                    </button>
                    {/* Devices Button */}
                    <button 
                        onClick={() => handleNavigation("device")}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            activePage === "device" 
                                ? "bg-emerald-500/30 border border-emerald-400/40 font-bold text-white shadow-md" 
                                : "text-slate-300 hover:bg-white/10"
                        }`}
                    >
                        <MdOutlineBugReport className="text-xl" />
                        Devices
                    </button>

                    {/* Analytics / Reports Button */}
                    <button 
                        onClick={() => handleNavigation("analytics")}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            activePage === "analytics" 
                                ? "bg-emerald-500/30 border border-emerald-400/40 font-bold text-white shadow-md" 
                                : "text-slate-300 hover:bg-white/10"
                        }`}
                    >
                        <TbReport className="text-xl" />
                        Analytics
                    </button>
{/* Notification Button */}
                    <button
                    onClick={() => handleNavigation("notification")}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            activePage === "analytics" 
                                ? "bg-emerald-500/30 border border-emerald-400/40 font-bold text-white shadow-md" 
                                : "text-slate-300 hover:bg-white/10"
                        }`}>
Notification
                    </button>
                    {/* settings button */}
                       <button
                    onClick={() => handleNavigation("settings")}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            activePage === "analytics" 
                                ? "bg-emerald-500/30 border border-emerald-400/40 font-bold text-white shadow-md" 
                                : "text-slate-300 hover:bg-white/10"
                        }`}>
Settings
                    </button>
                    {/* help and support */}

                             <button
                    onClick={() => handleNavigation("help")}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            activePage === "analytics" 
                                ? "bg-emerald-500/30 border border-emerald-400/40 font-bold text-white shadow-md" 
                                : "text-slate-300 hover:bg-white/10"
                        }`}>
Help & Support
                    </button>


                </div>
            </div>

            {/* Bottom Menu (Settings & Help) */}
            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                <button 
                    onClick={() => handleNavigation("settings")}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        activePage === "settings" 
                            ? "bg-emerald-500/30 border border-emerald-400/40 font-bold text-white shadow-md" 
                            : "text-slate-300 hover:bg-white/10"
                    }`}
                >
                    <CiSettings className="text-xl" />
                    Settings
                </button>
            </div>

        </div>
    );
}