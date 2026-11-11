import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineBugReport } from "react-icons/md";
import { TbReport } from "react-icons/tb";
import { GoAlert } from "react-icons/go";
import { CiSettings } from "react-icons/ci";
import { IoIosHelpCircleOutline } from "react-icons/io";

import "../styles/leftNav.style.css"



export default function LeftNavbar() {
    return (
        <aside className="bg-emerald-950 w-72 h-screen p-6 flex flex-col justify-between shrink-0 select-none text-white border-r border-emerald-900/40">
            {/* Top Brand Section */}
            <div>
                <div className="flex items-center gap-3 px-2 mb-10">
                    <img src="logo.png" alt="Agri Sense Logo" className="w-10 h-10 rounded-full object-cover bg-emerald-800" />
                    <div className="text-2xl">
                        <h1 className="font-bold font-sans tracking-wide text-lg text-emerald-50 leading-tight">AgriSense</h1>
                        <p className="text-xs text-gray-400 font-medium">Smart Agriculture</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1.5 font-medium text-sm">
                    <a href="#dashboard" className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-900/50">
                        <span><IoHomeOutline /></span> Dashboard
                    </a>
                    <a href="#devices" className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-emerald-200/70 hover:bg-emerald-900/60 hover:text-white transition">
                        <span><MdOutlineBugReport /></span> Devices
                    </a>
                   
                    <a href="#reports" className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-emerald-200/70 hover:bg-emerald-900/60 hover:text-white transition">
                        <span><TbReport /></span> Reports
                    </a>
                    <a href="#notifications" className="flex items-center justify-between px-4 py-3 rounded-2xl text-emerald-200/70 hover:bg-emerald-900/60 hover:text-white transition">
                        <span className="flex items-center gap-3.5"><span><GoAlert /></span> Notifications</span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
                    </a>
                    <a href="#settings" className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-emerald-200/70 hover:bg-emerald-900/60 hover:text-white transition">
                        <span><CiSettings /></span> Settings
                    </a>
                    <a href="#help" className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-emerald-200/70 hover:bg-emerald-900/60 hover:text-white transition">
                        <span><IoIosHelpCircleOutline /></span> Help & Support
                    </a>
                </nav>
            </div>

            {/* Bottom Promo & User Profile */}
            <div className="space-y-4">
                {/* Promo Card */}
                <div className="crop-bg-image h-40 rounded-sm w-full relative">
                    <div className="overlay-behind"></div>
                 
                </div>

                {/* User Profile */}
                <div className="flex items-center justify-between pt-3 border-t border-emerald-900">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-sm text-emerald-200">
                            CN
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate">Charles Niyomugabo</h4>
                            <p className="text-[10px] text-emerald-400 truncate">Admin-Manager</p>
                        </div>
                    </div>
                    <span className="text-emerald-400 text-xs">▼</span>
                </div>
            </div>
        </aside>
    );
}