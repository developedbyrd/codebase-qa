"use client";

import { useTheme } from "./contexts/ThemeContext";
import { useEffect } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export function ThemeHandler({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.add(inter.variable);
  }, [theme]);

  return <>{children}</>;
}
