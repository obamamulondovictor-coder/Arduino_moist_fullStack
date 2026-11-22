import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const THEME_EVENT = "agrisense-theme-change";

function readTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "dark" || saved === "black" ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  const dark = theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);

  const icon = document.getElementById("relIcon") as HTMLLinkElement | null;
  if (icon) icon.href = dark ? "/agri_dark.svg" : "/agri_white.svg";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      setTheme(detail === "light" || detail === "dark" ? detail : readTheme());
    };
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: next }));
  }, [theme]);

  return { theme, isDark: theme === "dark", toggleTheme };
}
