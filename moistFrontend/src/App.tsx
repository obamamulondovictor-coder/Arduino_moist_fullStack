import { sileo, Toaster } from "sileo";
import LandingPage from "./components/landingPage";
import { useEffect } from "react";

export default function App() {


useEffect(() => { sileo.info({
title: "Project In Progress",
description: "This is the system of the smart irrigation with soil moisture sensor project. The project is still in progress and will be updated soon.",
fill: "black",
styles: {
title: "text-white!",
description: "text-white/75!"
}}) }, [])


  return (
    <>
      <Toaster position="top-left" />

      <LandingPage />
    </>
  );
}