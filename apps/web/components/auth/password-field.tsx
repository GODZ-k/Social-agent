"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { TextField } from "./text-field";

type PasswordFieldProps = Omit<React.ComponentProps<typeof TextField>, "type" | "trailing" | "autoComplete"> & {
  /** "current-password" on sign-in, "new-password" wherever a password is chosen. */
  autoComplete: "current-password" | "new-password";
};

/** A password input with a real show/hide button, so people can check what they typed. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      spellCheck={false}
      autoCapitalize="off"
      trailing={
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="mr-0.5 grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Icon className="size-4.5" aria-hidden />
        </button>
      }
    />
  );
}
