import { useState } from "react";
import LeftNavbar from "./leftNavbar";
import HelpPage from "./pages/helpSupport";
import SettingPage from "./pages/setting";
import NotificationPage from "./pages/notification";
import Analytics from "./pages/analytics";
import Device from "./pages/device";
import Main from "./pages/mainDash";
import ProfilePage from "./pages/profile";

export default function Dashboard({ initialPage }: { initialPage: string }) {
  const [activePage, setActivePage] = useState<string>(initialPage || "main");

  const renderPage = () => {
    if (activePage === "main") {
      return <Main />;
    } else if (activePage === "analytic") {
      return <Analytics />;
    } else if (activePage === "device") {
      return <Device />;
    } else if (activePage === "notification") {
      return <NotificationPage />;
    } else if (activePage === "setting") {
      return <SettingPage />;
    } else if (activePage === "help") {
      return <HelpPage />;
    } else if (activePage === "profile") {
      return <ProfilePage />;
    } else {
      return <Main />;
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center p-3 md:p-4 overflow-hidden"
      style={{ backgroundImage: "url('/greens.png')" }}
    >
      <div className="absolute inset-0 bg-emerald-950/55 backdrop-blur-[3px]"></div>

      <div className="relative z-10 w-full h-full max-w-7xl max-h-[92vh] flex overflow-hidden rounded-[24px] bg-white/[0.04] backdrop-blur-[40px] border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <LeftNavbar activePage={activePage} setActivePage={setActivePage} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 text-white">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}