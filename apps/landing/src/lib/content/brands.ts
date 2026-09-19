import type { BrandKit } from "@/lib/types";

export interface ExampleBrand {
  id: string;
  name: string;
  /** What kind of business it is, in a few words. */
  kind: string;
  /** Primary brand colour. Tints the demo the way a real workspace is tinted. */
  accent: string;
  kit: BrandKit;
  /** On-image headlines for the three demo posts. */
  hooks: [string, string, string];
}

/**
 * Invented businesses for the demos. The set deliberately includes a pale
 * yellow and a dark navy, the two cases a brand-tinted interface has to survive.
 */
export const BRANDS: ExampleBrand[] = [
  {
    id: "kiln",
    name: "Kiln and Clay",
    kind: "Pottery studio",
    accent: "#c2603c",
    kit: {
      colors: [
        { name: "Terracotta", hex: "#c2603c" },
        { name: "Slip", hex: "#f3e6d8" },
        { name: "Glaze", hex: "#2f4a48" },
        { name: "Ash", hex: "#8a7f76" },
      ],
    },
    hooks: ["New wheel classes this month", "Glaze day, before and after", "From a lump of clay to a mug"],
  },
  {
    id: "brightside",
    name: "Brightside Dental",
    kind: "Dental practice",
    accent: "#2f6fde",
    kit: {
      colors: [
        { name: "Blue", hex: "#2f6fde" },
        { name: "Mist", hex: "#e4eefc" },
        { name: "Deep", hex: "#12305f" },
        { name: "Mint", hex: "#7fd6c2" },
      ],
    },
    hooks: ["Nervous about the dentist?", "Five myths about whitening", "What happens at a check-up"],
  },
  {
    id: "sunnyside",
    name: "Sunny Side Cafe",
    kind: "Neighbourhood cafe",
    accent: "#f2c230",
    kit: {
      colors: [
        { name: "Yolk", hex: "#f2c230" },
        { name: "Cream", hex: "#fff6d9" },
        { name: "Espresso", hex: "#3a2a1c" },
        { name: "Tomato", hex: "#e2553d" },
      ],
    },
    hooks: ["Brunch runs until three", "This week's specials board", "How we pull the first shot"],
  },
  {
    id: "harbour",
    name: "Harbour Legal",
    kind: "Law firm",
    accent: "#1b2a4e",
    kit: {
      colors: [
        { name: "Navy", hex: "#1b2a4e" },
        { name: "Paper", hex: "#e9ecf3" },
        { name: "Brass", hex: "#b8935a" },
        { name: "Slate", hex: "#56627d" },
      ],
    },
    hooks: ["Signing a lease? Read this first", "Four questions to ask a solicitor", "A contract dispute, step by step"],
  },
];
