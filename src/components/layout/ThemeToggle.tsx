"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { dictionary } = useLanguage();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={dictionary.nav.themeToggle}
      title={dictionary.nav.themeToggle}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground transition-colors hover:bg-muted"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
