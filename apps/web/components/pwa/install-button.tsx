"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Appears only when the browser offers installation (Chromium desktop and
 * Android). Safari has no such event, so iOS users install from the share
 * sheet and never see this button.
 */
export function InstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    const installed = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!prompt) return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setPrompt(null);
  }

  return (
    <Button variant="ghost" size="sm" onClick={install} className="max-sm:size-8.5 max-sm:px-0">
      <Download />
      <span className="max-sm:sr-only">Install app</span>
    </Button>
  );
}
