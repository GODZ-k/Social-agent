"use client";

import { Download } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { APP_NAME } from "@/lib/utils";
import { CopyButton } from "./copy-button";

function downloadCodes(codes: string[]) {
  const text = `${APP_NAME} backup codes\n\n${codes.join("\n")}\n\nEach code works once.\n`;
  const file = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${APP_NAME.toLowerCase()}-backup-codes.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Backup codes, shown once, with copy and download so they end up somewhere safe. */
export function BackupCodesList({ codes }: { codes: string[] }) {
  return (
    <div>
      <ul aria-label="Your backup codes" className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-[1.25rem] bg-card px-4.5 py-4 shadow-[0_0_0_1px_var(--border)] sm:gap-x-6 sm:px-6 sm:py-5">
        {codes.map((code) => (
          <li key={code} className="font-mono text-base tracking-[0.06em] tabular-nums select-all sm:text-[1.0625rem]">
            {code}
          </li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <CopyButton text={codes.join("\n")} label="Copy all" />
        <Button type="button" variant="outline" onClick={() => downloadCodes(codes)}>
          <Download />
          Download
        </Button>
      </div>
    </div>
  );
}
