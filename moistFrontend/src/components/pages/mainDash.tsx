import { useState } from "react";
import { LuSunMoon } from "react-icons/lu";
import { IoMdMoon } from "react-icons/io";
import { IoSearch, IoNotificationsOutline } from "react-icons/io5";

export default function MainDash() {
    const [isOnline, setIsOnline] = useState(false);
    
    const getCurrentTheme = localStorage.getItem("theme") || 'white';

    const handleThemeToggle = () => {
        const currentMode = localStorage.getItem("theme") || "white";
        const newMode = currentMode === "dark" ? "white" : "dark";
        
        localStorage.setItem("theme", newMode);
        
        // Update DOM classes & favicon immediately
        const relImage = document.getElementById("relIcon") as HTMLLinkElement | null;
        if (newMode === "dark") {
            document.documentElement.classList.add("dark");
            if (relImage) relImage.href = "./agri_dark.svg";
        } else {
            document.documentElement.classList.remove("dark");
            if (relImage) relImage.href = "./agri_white.svg";
        }

        // Quick reload to sync app-wide state seamlessly
        window.location.reload();
    };

    return (
        <>
        <div className="w-full">
            <nav className="flex items-center justify-between p-4 gap-4">
                
                {/* Search device by name */}
                <div className="relative flex items-center w-full max-w-md">
                    <IoSearch className="absolute left-3.5 text-white/60 text-lg pointer-events-none" />
                    <input
                        type="search"
                        name="device"
                        id="deviceName"
                        placeholder="Search devices, reports..."
                        className="
                            w-full pl-10 pr-4 py-2.5 rounded-xl
                            bg-white/10 backdrop-blur-md
                            border border-white/20
                            text-white placeholder-white/50 text-sm
                            focus:outline-none focus:border-emerald-400/60 focus:bg-white/15
                            transition-all
                        "
                    />
                </div>

                {/* Theme, Notification Panel & Database Status Group */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    
                    {/* Theme Mode Toggle */}
                    <button 
                        onClick={handleThemeToggle}
                        className="p-2 rounded-xl text-emerald-300 hover:bg-white/10 transition-all cursor-pointer text-lg"
                        title="Toggle Theme"
                    >
                        {getCurrentTheme === 'white' ? <LuSunMoon /> : <IoMdMoon />}
                    </button>

                    {/* Notification Panel Button
                    <button 
                        className="relative p-2 rounded-xl text-emerald-300 hover:bg-white/10 transition-all cursor-pointer text-lg"
                        title="Notifications"
                    >
                        <IoNotificationsOutline />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-400 rounded-full"></span>
                    </button> */}

                    {/* Divider Line */}
                    <div className="h-4 w-[1px] bg-white/20"></div>

                    {/* Backend Status Connection */}
                    <div className="flex items-center gap-2 text-xs font-medium text-white/80 px-2 py-1">
                        <span className="relative flex h-2 w-2">
                            {isOnline && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                        <span className={isOnline ? "text-emerald-300" : "text-red-300"}>
                            {isOnline ? "Online" : "Offline"}
                        </span>
                    </div>

                </div>

            </nav>
        </div>
        <div className="w-full flex gap-auto justify-between p-2">
            <div className="w-fit h-fit p-3 bg-gray-200/20 rounded-xl">Device total active</div>
            <div className="w-fit h-fit p-3 bg-gray-200/20 rounded-xl">soild moist on latest data</div>
            <div className="w-fit h-fit p-3 bg-gray-200/20 rounded-xl">Water level in pump</div>

        </div>

        </>
    );
}