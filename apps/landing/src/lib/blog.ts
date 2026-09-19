export interface PostMeta {
  /** Also the file name: src/content/blog/<slug>.mdx */
  slug: string;
  title: string;
  summary: string;
  /** yyyy-MM-dd */
  date: string;
  minutes: number;
}

/**
 * The list of posts, newest first. To publish one, add the .mdx file and an
 * entry here. A typed list keeps the index and sitemap from reading the disk.
 */
export const POSTS: PostMeta[] = [
  {
    slug: "how-the-loop-learns",
    title: "Four weeks of posts, then what: how the loop learns",
    summary: "What the agent measures after a month, how it turns numbers into findings, and why every finding has to point at its evidence.",
    date: "2026-09-15",
    minutes: 4,
  },
  {
    slug: "your-website-already-contains-your-brand",
    title: "Your website already contains your brand",
    summary: "You don't need a brand book to start. The colours, the tone and the offer are already on your pages, and an agent can read them.",
    date: "2026-09-08",
    minutes: 3,
  },
  {
    slug: "never-post-without-asking",
    title: "What an agent should never post without asking",
    summary: "The short answer is anything. Here is why approval is the one step we refuse to automate, and how to make it take minutes.",
    date: "2026-09-01",
    minutes: 4,
  },
];

export const getPost = (slug: string) => POSTS.find((post) => post.slug === slug);

/** "Tue 15 Sep 2026", computed in UTC so the server and the browser agree. */
export function formatPostDate(date: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(new Date(`${date}T00:00:00Z`));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
}
