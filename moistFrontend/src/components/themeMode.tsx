import { useEffect } from "react";
import { sileo, Toaster } from "sileo";


export default function ThemeMode() {
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

    useEffect(() => { 
        const mode = localStorage.getItem("theme") || "white";
        
        sileo.action({
            title: "Theme Preferences",
            description: "Switch between light and dark mode.",
            fill: mode === "dark" ? "#0f172a" : "#ffffff",
            styles: {
                title: mode === "dark" ? "text-white!" : "text-gray-900!",
                description: mode === "dark" ? "text-white/75!" : "text-gray-600!",
            },
            button: {
                title: mode === "dark" ? " Switch to Light" : " Switch to Dark",
                onClick: handleThemeToggle,
            },
        }); 
    }, []);

    return (
        // Setting position to bottom-left locks the Toaster container stack to that corner
        <Toaster position="bottom-right" />
    );
}