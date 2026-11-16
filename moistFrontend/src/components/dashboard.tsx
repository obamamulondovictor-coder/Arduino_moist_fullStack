import { useState } from "react";
import LeftNavbar from "./leftNavbar";

// Import the page components
import HelpPage from "./pages/helpSupport";
import SettingPage from "./pages/setting";
import NotificationPage from "./pages/notification";
import Analytics from "./pages/analytics";
import Device from "./pages/device";
import Main from "./pages/mainDash";

export default function Dashboard() {
    const [activePage, setActivePage] = useState("main");

    //const a , setA

    // Your page switcher
    const renderPage = () => {
        if (activePage === "main") {
            return <Main />;
        }
        else if (activePage === "analytic") {
            return <Analytics />;
        }
        else if (activePage === "device") {
            return <Device />;
        }
        else if (activePage === "notification" ){
            return <NotificationPage />
        }
        else if (activePage === "setting"){
            return <SettingPage />
        }
        else if (activePage === "help"){
            return <HelpPage />
        }
        else {
            return <div className="p-8 text-white">Settings Page</div>;
        }
    };

    return (
        /* 1. Outermost container with the crop/irrigation background image */
        <div className="relative w-full h-screen bg-cover bg-center flex items-center justify-center p-4 md:p-8 overflow-hidden"
             style={{ backgroundImage: "url('./greens.png')" }}>
            
            {/* Dark green overlay so the glass containers pop out clearly */}
            <div className="absolute inset-0 bg-emerald-950/50 backdrop-blur-[3px]"></div>

            {/* 2. Main Dashboard Glass Wrapper (Holds both navbar and content) */}
            <div className="relative z-10 w-full h-full max-w-7xl max-h-[90vh] flex overflow-hidden rounded-[24px] bg-white/[0.04] backdrop-blur-[40px] border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
                
                {/* Left Sidebar */}
                <LeftNavbar activePage={activePage} setActivePage={setActivePage} />

                {/* Main Content Area on the right */}
                <main className="flex-1 overflow-y-auto p-6 text-white">
                    {renderPage()}
                </main>
            </div>
            
        </div>
    );
}