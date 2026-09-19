import type { Post } from "@/lib/types";
import type { TrendRow } from "@repo/ui/components/social/charts";
import type { ExampleBrand } from "./brands";

/** The three posts in the re-tint demo: same layouts every time, so only the brand changes. */
export function retintPosts(brand: ExampleBrand): Pick<Post, "hook" | "format" | "art">[] {
  return [
    { hook: brand.hooks[0], format: "image", art: { variant: 0, colorIndex: 0 } },
    { hook: brand.hooks[1], format: "carousel", art: { variant: 2, colorIndex: 1 } },
    { hook: brand.hooks[2], format: "reel", art: { variant: 1, colorIndex: 2 } },
  ];
}

/** The approval stack on the home page, written for the first example brand. Dates are fixed so server and browser agree. */
export const DEMO_POSTS: (Post & { id: string })[] = [
  {
    id: "wheel-classes",
    platform: "instagram",
    format: "image",
    hook: "New wheel classes this month",
    caption:
      "Six new evening classes on the wheel start on the 6th. Small groups, all clay and firing included, and you take home what you make.",
    hashtags: ["pottery", "wheelthrowing", "learnpottery"],
    scheduledFor: "2026-10-01T18:30:00",
    art: { variant: 0, colorIndex: 0 },
    aiNote: "Your classes page was updated last week, and posts about classes earn the most saves.",
  },
  {
    id: "glaze-day",
    platform: "instagram",
    format: "carousel",
    hook: "Glaze day, before and after",
    caption:
      "The same bowl, before the kiln and after. Swipe to see what 1,240 degrees does to a celadon glaze.",
    hashtags: ["glaze", "ceramics", "beforeandafter"],
    scheduledFor: "2026-10-03T12:00:00",
    art: { variant: 2, colorIndex: 1 },
    aiNote: "Before-and-after carousels were your best format last month, so this pillar gets one a week.",
  },
  {
    id: "lump-to-mug",
    platform: "tiktok",
    format: "reel",
    hook: "From a lump of clay to a mug",
    caption: "Forty seconds, one mug, no talking. The handle is the hard part.",
    hashtags: ["potterytok", "satisfying", "handmade"],
    scheduledFor: "2026-10-05T19:00:00",
    art: { variant: 1, colorIndex: 2 },
    durationSec: 40,
    aiNote: "Short process videos reach people who don't follow you yet. This one is planned for a Monday evening.",
  },
  {
    id: "studio-hours",
    platform: "facebook",
    format: "image",
    hook: "Open studio every Saturday",
    caption: "Members can drop in from ten until four every Saturday. Bring your own tools or borrow ours.",
    hashtags: ["openstudio", "potterystudio"],
    scheduledFor: "2026-10-07T09:00:00",
    art: { variant: 3, colorIndex: 0 },
    aiNote: "Your Facebook followers are mostly local, so practical posts about opening hours do well there.",
  },
];

/**
 * Example daily reach for the results strip: 30 days, because that is the span
 * TrendChart is built for. Computed rather than random, so server and browser
 * render the same line. Labelled as an example wherever it is shown.
 */
export const REACH_TREND: TrendRow[] = Array.from({ length: 30 }, (_, i) => {
  const day = new Date(Date.UTC(2026, 7, 22 + i));
  const growth = 3800 + i * 210;
  const weekly = Math.sin((i / 7) * Math.PI * 2) * 520;
  return {
    label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
    value: Math.round(growth + weekly),
  };
});
