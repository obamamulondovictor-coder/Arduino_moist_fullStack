import { useState, useEffect } from "react";
import "../styles/landing.style.css";
import { Link } from "react-router";
import { FaArrowRight, FaPhoneAlt } from "react-icons/fa";
import { sileo, Toaster } from "sileo";


export default function LandingPage() {
  type ToastPosition = "bottom-left" | "top-center" | "bottom-center" | "bottom-right";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [deskTopPos, setDeskTopPos] = useState<ToastPosition>("bottom-left");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    const targetPos: ToastPosition = isMobile ? "top-center" : "bottom-right";
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
          >
            Contact Support
          </button>

          <a
            href="https://www.cropin.com/blogs/iot-in-agriculture/"
            className="text-emerald-300 transition-colors duration-150 ease-out hover:text-emerald-100 hover:underline underline-offset-4 text-sm sm:text-base"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}