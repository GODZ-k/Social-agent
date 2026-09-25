"use client";

import { useRef } from "react";
import { ImageUp, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { readImage } from "@/lib/image";
import { Button } from "@repo/ui/components/button";

export function MediaPicker({
  mediaUrl,
  onPick,
  onReset,
}: {
  mediaUrl: string | null;
  onPick: (dataUrl: string) => void;
  onReset: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  async function pickImage(file: File | undefined) {
    if (!file) return;
    try {
      const url = await readImage(file);
      onPick(url);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      // Lets the same file be chosen again after going back to the generated artwork.
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0])} />
      <Button type="button" variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
        <ImageUp /> {mediaUrl ? "Replace image" : "Use your own image"}
      </Button>
      {mediaUrl && (
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw /> Use generated artwork
        </Button>
      )}
    </div>
  );
}
