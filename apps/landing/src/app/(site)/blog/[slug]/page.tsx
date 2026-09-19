import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/section";
import { UrlForm } from "@/components/url-form";
import { POSTS, formatPostDate, getPost } from "@/lib/blog";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

// Only the posts listed in lib/blog.ts exist; any other slug is a 404.
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.date },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const { default: Article } = await import(`@/content/blog/${slug}.mdx`);

  return (
    <>
      <article className="max-w-[62ch] pt-10 md:pt-16">
        <Link href="/blog" className="type-label inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" aria-hidden />
          All posts
        </Link>
        <h1 className="type-title mt-5">{post.title}</h1>
        <p className="type-label mt-3 tabular-nums">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>, {post.minutes} minute read
        </p>
        <div className="mt-8 text-[1.0625rem] leading-[1.65]">
          <Article />
        </div>
      </article>

      <Section title="Start with your website." lead="Paste your address and see the brand kit the agent builds from it.">
        <UrlForm className="max-w-xl" />
      </Section>
    </>
  );
}
