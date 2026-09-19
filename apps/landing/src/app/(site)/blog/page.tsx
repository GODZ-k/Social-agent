import type { Metadata } from "next";
import Link from "next/link";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { PageIntro } from "@/components/section";
import { POSTS, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on running social media with an agent: brand, approval, and learning from results.",
};

export default function BlogPage() {
  return (
    <>
      <PageIntro title="Blog" lead="Notes on running social media with an agent, from the people who build it and use it." />

      <RevealGroup as="ul" className="mt-10 max-w-3xl divide-y divide-border border-y border-border md:mt-14">
        {POSTS.map((post) => (
          <RevealItem as="li" key={post.slug} className="py-7">
            <p className="type-label tabular-nums">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>, {post.minutes} minute read
            </p>
            <h2 className="type-heading mt-2 text-[1.375rem]">
              <Link href={`/blog/${post.slug}`} className="rounded-sm underline-offset-4 hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 max-w-[62ch] text-muted-foreground">{post.summary}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </>
  );
}
