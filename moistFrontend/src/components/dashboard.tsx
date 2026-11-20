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
      className="relative flex w-full min-h-screen items-center justify-center overflow-hidden bg-cover bg-center p-3 md:p-4"
      style={{ backgroundImage: "url('/greens.png')" }}
    >
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{ background: "var(--app-veil)" }}
      />

      <div
        className="relative z-10 flex h-full max-h-[92vh] w-full max-w-7xl overflow-hidden rounded-[24px] backdrop-blur-[18px] transition-colors duration-300"
        style={{
          background: "var(--shell-bg)",
          border: "1px solid var(--shell-border)",
          boxShadow: "var(--shell-shadow)",
        }}
      >
        <LeftNavbar activePage={activePage} setActivePage={setActivePage} />

        <main className="relative flex-1 overflow-y-auto p-4 md:p-6 text-[var(--text)] transition-colors duration-300">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
