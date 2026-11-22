import { Routes, Route } from "react-router";
import LandingPage from "./components/landingPage";
import Dashboard from "./components/dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard initialPage="main" />} />
      <Route path="/device" element={<Dashboard initialPage="device" />} />
      <Route path="/analytics" element={<Dashboard initialPage="analytic" />} />
      <Route path="/notification" element={<Dashboard initialPage="notification" />} />
      <Route path="/setting" element={<Dashboard initialPage="setting" />} />
      <Route path="/help" element={<Dashboard initialPage="help" />} />
      <Route path="/profile" element={<Dashboard initialPage="profile" />} />
    </Routes>
  );
}