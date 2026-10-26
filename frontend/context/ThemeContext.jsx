"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  mode: "dark",
  accent: "teal",
  toggleMode: () => {},
  setMode: () => {},
  setAccent: () => {},
});

const MODE_KEY = "aquaguard-theme";
const ACCENT_KEY = "aquaguard-accent";

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("dark");
  const [accent, setAccent] = useState("teal");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedMode = window.localStorage.getItem(MODE_KEY);
    const storedAccent = window.localStorage.getItem(ACCENT_KEY);
    if (storedMode === "light" || storedMode === "dark") setMode(storedMode);
    if (storedAccent) setAccent(storedAccent);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(MODE_KEY, mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(ACCENT_KEY, accent);
  }, [accent, hydrated]);

  function toggleMode() {
    setMode((m) => (m === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ mode, accent, toggleMode, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
