import { useState, useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/landing.style.css";
import { Link } from "react-router";
import { FaArrowRight, FaPhoneAlt } from "react-icons/fa";
import { sileo, Toaster } from "sileo";
import TourGuide from "./tourGuide"

type ToastPosition = "bottom-left" | "top-center" | "bottom-center" | "bottom-right";

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [deskTopPos, setDeskTopPos] = useState<ToastPosition>("bottom-left");
  const [tourButton , setTourButton] = useState(false);
  const [toastOpen , setToastOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // controll the button to start tour

  useEffect(() => {
    const timer = setTimeout(() =>{setTourButton(true)} , 6000)
    
    return () => clearTimeout(timer)

  } , [])

  function handleProjectInfoClick() {
    const targetPos: ToastPosition = isMobile ? "top-center" : "bottom-right";
    setDeskTopPos(targetPos);

    const mode = localStorage.getItem("theme") || "white";

    sileo.info({
      title: "Project In Progress",
      description:
        "This is the system of the smart irrigation with soil moisture sensor project. The project is still in progress and will be updated soon.",
      position: targetPos,
      fill: mode === "dark" ? "#0f172a" : "#ffffff",
      styles: {
        title: mode === "dark" ? "text-white!" : "text-gray-900!",
        description: mode === "dark" ? "text-white/75! break-words!" : "text-gray-600! break-words!",
        // container: "w-[92vw]! max-w-[400px]! mx-auto!",
      },
    });
  }

  function handleContactSupportClick() {
    const targetPos: ToastPosition = "top-center";
    setDeskTopPos(targetPos);

    const mode = localStorage.getItem("theme") || "white";

    sileo.success({
      title: "Contact Information",
      icon: <FaPhoneAlt className="size-3.5" />,
      position: targetPos,
      fill: mode === "dark" ? "#0f172a" : "#ffffff",
      styles: {
        title: mode === "dark" ? "text-white!" : "text-gray-900!",
        // container: "w-[92vw]! max-w-[400px]! mx-auto!",
      },
      description: (
        <span className="text-emerald-600 dark:text-emerald-400 font-medium wrap-brak">
          For support, please contact us at: <br />
          <a
            href="mailto:obamamulondo6@gmail.com"
            className="text-sky-500 hover:text-sky-400 underline"
          >
            obamamulondo6@gmail.com
          </a>{" "}
          <br />
          or call us at: <br />
          <a
            href="tel:+250787880064"
            className="text-sky-500 hover:text-sky-400 underline"
          >
            +250 787 880 064
          </a>
        </span>
      ),
    });
  }

  const handleNavigation = () =>{
    const driverObj = driver({
      showProgress:true,
      steps : [
            {
      element: "#goToDash",
      popover: {
        title: "Navigate To The Main Dashboard",
        description: "Access All of the main dashboard content such and device management , and soil analytics",
        side: "bottom",
      },
    },
    {
      element: "#projectInfo",
      popover : {
        title : "See all detail of the project information",
        description : `This has a small project information all of the detail will be found on my Github Profile
        <a href="https://github.com/obamamulondovictor-coder/Arduino_moist_fullStack" target="_blank" rel="noopener noreferrer" 
                 style="display: inline-block; padding: 6px 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                 Visit My GitHub Profile
              </a>`,
        side: "bottom"
      }
    },
    {
      element : "#contactMe",
      popover : {
        title : "Contact The Developer of the system",
        description: "Be able to contact the owner of the system and talk all in all for improvement or suggestion",
        side : "bottom"
      }
    },
  {
     element : "#learnMore" ,
     popover : {
      title : "See more detail on this kind of projects",
      description : "Other existing system like this project",
      side : "bottom"
     }
  }

      ]
    })

    driverObj.drive();
  }

  return (
    <div
      className="
        flex flex-col
        gap-6 sm:gap-8 lg:gap-10
        p-6 sm:p-10 lg:p-15
        bg-image
        min-h-screen w-full
      "
    >
      {/* Renders the active toast position dynamically */}
      <Toaster position={isMobile ? "top-center" : deskTopPos} />

      <div className="overlay-behind"></div>

      {/* Main Heading */}
      <div
        className="
          text-4xl sm:text-5xl lg:text-6xl
          font-sans font-medium text-white
          leading-wide
        "
      >
        <p>Smart Agriculture</p>
        <p>
          for a <span className="text-green-500 font-bold">Better</span>
        </p>
        <p className="text-green-500 font-bold">Tomorrow</p>
      </div>

      {/* Description */}
      <div>
        <p
          className="
            p-2 sm:p-5
            w-full max-w-md
            text-white
            tracking-wider
            firjar-font
            text-base sm:text-lg
            font-normal leading-relaxed
          "
        >
          Innovative agriTech solutions to increase productivity,
          sustainability, and profitability.
        </p>
      </div>

      {/* Dashboard Button */}
      <div>
        <Link
          to="/dashboard"
          className="
            group
            inline-flex items-center gap-2
            text-white hover:text-shadow-amber-50
            border-2 border-transparent hover:border-gray-300
            transition-all ease-in duration-300
            hover:gap-2.5
            font-bold
            font-roboto
            button-color
            px-5 py-4 sm:p-5
            rounded-2xl
            text-sm sm:text-base
            hover:shadow-lg hover:shadow-emerald-500/30
          "
          id="goToDash"
        >
          Get to The Dashboard
          <span className="text-white inline-block group-hover:text-gray-200 transition-colors duration-300">
            <FaArrowRight />
          </span>
        </Link>
      </div>

      {/* Additional Information */}
      <div className="w-full max-w-3xl">
        <p
          className="
            text-gray-300
            text-xs sm:text-sm
            leading-relaxed
            max-w-2xl
          "
        >
          Get More Experience By Exploring Our Features and Understanding How
          They Can Benefit Your Farming Operations
        </p>

        {/* Action Buttons */}
        <div
          className="
            flex flex-wrap
            gap-3 sm:gap-5
            mt-5
            justify-start items-center
          "
        >
          <button
            className="
              px-4 sm:px-6 py-3
              rounded-2xl font-semibold
              border-2 border-slate-300 dark:border-slate-700
              bg-white dark:bg-slate-900
              text-slate-800 dark:text-slate-200
              hover:border-emerald-500
              hover:bg-emerald-50 dark:hover:bg-emerald-950/40
              hover:text-emerald-600 dark:hover:text-emerald-400
              transition-all duration-200 shadow-sm
              text-sm sm:text-base cursor-pointer
            "
            onClick={handleProjectInfoClick}
            id="projectInfo"
          >
            Project Information
          </button>

          <button
            className="
              px-4 sm:px-6 py-3
              rounded-2xl font-semibold
              bg-emerald-950/90 hover:bg-emerald-900
              border border-emerald-700/60
              text-emerald-100
              hover:shadow-lg hover:shadow-emerald-500/25
              transition-all duration-200
              text-sm sm:text-base cursor-pointer
            "
            onClick={handleContactSupportClick}
            id="contactMe"
          >
            Contact Support
          </button>

          <a
            href="https://www.cropin.com/blogs/iot-in-agriculture/"
            className="text-emerald-300 transition-colors duration-150 ease-out hover:text-emerald-100 hover:underline underline-offset-4 text-sm sm:text-base"
            target="_blank"
            rel="noopener noreferrer"
            id="learnMore"
          >
            Learn More
          </a>
        </div>
      </div>


      {/* 👉 ADD THIS BOTTOM-LEFT TOUR BUTTON HERE */}
      {tourButton && (
        <button
          onClick={handleNavigation}
          className="
            fixed bottom-5 right-5 z-40
            inline-flex items-center gap-2
            px-4 py-2.5 rounded-full
            bg-emerald-950/90 hover:bg-emerald-900
            backdrop-blur-md
            border border-emerald-400/40
            text-emerald-200 hover:text-white
            text-sm font-medium
            shadow-xl shadow-black/40
            transition-all duration-300
            cursor-pointer
          "
        >
          Take a Quick Tour
        </button>
      )}

    </div>
  );
}


    
