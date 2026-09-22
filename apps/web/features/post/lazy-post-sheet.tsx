"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { PostSheet } from "./post-sheet";

// The editor pulls in react-hook-form, the date and time pickers and the
// lightbox. Nobody needs that until they open a post, so the chunk waits.
const Sheet = dynamic(() => import("./post-sheet").then((m) => m.PostSheet), { ssr: false });

/**
 * Mounts the real sheet the first time a post is opened and keeps it mounted
 * afterwards, so the close animation still runs and the chunk loads once.
 */
export function LazyPostSheet(props: ComponentProps<typeof PostSheet>) {
  const [opened, setOpened] = useState(false);
  if (props.post && !opened) setOpened(true);
  if (!opened) return null;
  return <Sheet {...props} />;
}
