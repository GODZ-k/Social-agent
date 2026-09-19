"use client";

import { useSyncExternalStore } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY, type ThemePreference } from "../lib/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const listeners = new Set<() => void>();
const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)");

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function apply(preference: ThemePreference, animate: boolean) {
  const root = document.documentElement;
  const next = preference === "dark" || (preference === "system" && systemDark().matches) ? "dark" : "light";
  if (root.dataset.theme === next) return;
  if (animate) {
    // Colours ease across for a moment (see globals.css) instead of snapping.
    root.dataset.themeSwitching = "";
    window.setTimeout(() => delete root.dataset.themeSwitching, 320);
  }
  root.dataset.theme = next;
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Private mode: the choice still applies for this visit.
  }
  apply(preference, true);
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  // Follow the device while on "system", and other tabs when they change the setting.
  const onSystemChange = () => apply(readPreference(), true);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    apply(readPreference(), true);
    notify();
  };
  systemDark().addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    systemDark().removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useThemePreference() {
  return useSyncExternalStore<ThemePreference>(subscribe, readPreference, () => "system");
}

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Match device", icon: Monitor },
] as const;

export function ThemeMenu() {
  const preference = useThemePreference();
  const Current = OPTIONS.find((o) => o.value === preference)?.icon ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Appearance"
        className="pressable grid size-8.5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent"
      >
        <Current className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onSelect={() => setThemePreference(value)}>
            <Icon />
            <span className="flex-1">{label}</span>
            {preference === value && <Check className="text-foreground!" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
