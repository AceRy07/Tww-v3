"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { dictionary } = useLanguage();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={dictionary.nav.themeToggle}
      title={dictionary.nav.themeToggle}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground transition-colors hover:bg-muted"
    >
      <span
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center transition-opacity",
          mounted ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      >
        {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} className="opacity-0" />}
      </span>
    </button>
  );
}
