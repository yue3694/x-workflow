"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "auto";

const STORAGE_KEY = "x-workflow-theme";
const AUTO_KEY = "x-workflow-auto-theme";

export function useAutoTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [isAuto, setIsAuto] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const storedAuto = localStorage.getItem(AUTO_KEY);

    if (storedTheme) {
      setThemeMode(storedTheme);
      setIsAuto(storedAuto === "true");
    }
    setIsHydrated(true);
  }, []);

  const localHour = new Date().getHours();
  const isNightTime = localHour < 6 || localHour >= 18;

  const activeTheme = isAuto ? (isNightTime ? "dark" : "light") : themeMode;

  // Apply theme to document
  useEffect(() => {
    if (!isHydrated) return;

    if (activeTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [activeTheme, isHydrated]);

  const toggleTheme = () => {
    const newTheme = activeTheme === "dark" ? "light" : "dark";
    setThemeMode(newTheme);
    setIsAuto(false);
    localStorage.setItem(STORAGE_KEY, newTheme);
    localStorage.setItem(AUTO_KEY, "false");
  };

  const setIsAutoTheme = (auto: boolean) => {
    setIsAuto(auto);
    localStorage.setItem(AUTO_KEY, String(auto));
  };

  return {
    themeMode,
    setThemeMode,
    isAutoTheme: isAuto,
    setIsAutoTheme,
    activeTheme,
    toggleTheme,
    isNightTime,
    isHydrated,
  };
}