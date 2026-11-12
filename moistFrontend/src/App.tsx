import { Routes, Route } from "react-router";
import LandingPage from "./components/landingPage";
import Dashboard from "./components/dashboard";



export default function App() {



  return (
    <>
    {/* <Toaster position="top-right"/> */}
     <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        
     </Routes>

    
    </>
  );
}