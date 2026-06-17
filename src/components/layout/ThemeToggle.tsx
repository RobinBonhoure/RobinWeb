"use client";

import { useLayoutEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // useLayoutEffect fires synchronously before paint — prevents flash on
  // locale navigation when React reconciles <html> and strips the dark class.
  useLayoutEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (!stored && prefersDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
    setDark(shouldBeDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center size-8 text-muted-foreground hover:text-foreground dark:hover:text-cyan-400 transition-colors"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
