"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

// Light/dark toggle in the header. First visit follows the system
// preference (next-themes); a click pins an explicit choice that
// persists in localStorage.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Theme is unknown until mounted (SSR) — render a placeholder to avoid
  // a hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
      title={isDark ? "Byt till ljust tema" : "Byt till mörkt tema"}
      aria-label={isDark ? "Byt till ljust tema" : "Byt till mörkt tema"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
