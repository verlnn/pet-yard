"use client";

import { useThemeContext } from "@/src/providers/ThemeProvider";

export function useTheme() {
  return useThemeContext();
}
