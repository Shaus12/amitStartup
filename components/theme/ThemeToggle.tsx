"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: "dark",   icon: Moon,    label: "כהה" },
  { value: "light",  icon: Sun,     label: "בהיר" },
  { value: "system", icon: Monitor, label: "מערכת" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center gap-0.5 p-1 rounded-lg"
      style={{ backgroundColor: "var(--bv-surface-elevated)", border: "1px solid var(--bv-border)" }}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className="p-1.5 rounded-md transition-all duration-150"
          style={{
            backgroundColor: theme === value ? "var(--bv-border)" : "transparent",
            color: theme === value ? "var(--bv-text-1)" : "var(--bv-text-3)",
          }}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
