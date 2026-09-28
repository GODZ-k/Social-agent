"use client";

import { useId } from "react";
import { DropdownMenu as MenuPrimitive } from "radix-ui";
import { Monitor, Moon, Sun } from "lucide-react";
import { Segmented } from "@repo/ui/components/segmented";
import { setThemePreference, useThemePreference } from "@repo/ui/components/theme-menu";
import type { ThemePreference } from "@repo/ui/lib/theme";
import { useHeaderMenuSurface } from "./header-menu";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Device", icon: Monitor },
] as const;

function isPreference(value: string): value is ThemePreference {
  return OPTIONS.some((option) => option.value === value);
}

/**
 * Light, dark or the device's setting, inside the account menu. In the menu
 * it is a radio group of menu items, so arrow keys reach it; in the phone
 * sheet it is a plain segmented control.
 */
export function ThemeChoice() {
  const surface = useHeaderMenuSurface();
  const preference = useThemePreference();
  const labelId = useId();

  return (
    <div className="px-3 pt-1.5 pb-2.5">
      <p id={labelId} className="type-label mb-2">
        Theme
      </p>
      {surface === "menu" ? (
        <MenuPrimitive.RadioGroup
          aria-labelledby={labelId}
          value={preference}
          onValueChange={(value) => isPreference(value) && setThemePreference(value)}
          className="grid grid-cols-3 gap-0.5 rounded-full bg-secondary p-0.75"
        >
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <MenuPrimitive.RadioItem
              key={value}
              value={value}
              // Choosing a theme keeps the menu open, so the change can be seen and undone.
              onSelect={(event) => event.preventDefault()}
              aria-label={value === "system" ? "Match device" : label}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full text-[0.8125rem] font-medium text-muted-foreground outline-none data-highlighted:ring-2 data-highlighted:ring-ring data-[state=checked]:bg-card data-[state=checked]:text-foreground data-[state=checked]:shadow-raised [&_svg]:size-3.5"
            >
              <Icon aria-hidden />
              {label}
            </MenuPrimitive.RadioItem>
          ))}
        </MenuPrimitive.RadioGroup>
      ) : (
        <Segmented
          label="Theme"
          value={preference}
          onValueChange={setThemePreference}
          options={OPTIONS.map(({ value, label }) => ({ value, label }))}
          className="grid w-full grid-cols-3 [&_button]:h-10"
        />
      )}
    </div>
  );
}
