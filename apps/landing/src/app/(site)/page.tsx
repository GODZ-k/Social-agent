import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ApprovalDemo } from "@/components/approval-demo";
import { LoopSection } from "@/components/loop-section";
import { ResultsStrip } from "@/components/results-strip";
import { RetintDemo } from "@/components/retint-demo";
import { Section } from "@/components/section";
import { UrlForm } from "@/components/url-form";

export default function HomePage() {
  return (
    <>
      <section className="pt-12 md:pt-24">
        <h1 className="type-display max-w-[14ch]">Start with your website.</h1>
        <p className="mt-5 max-w-[52ch] text-[1.0625rem] text-muted-foreground md:text-lg">
          An agent reads it, learns your brand, plans your social media and drafts a month of posts. You approve the
          ones you like, and it publishes them.
        </p>
        <UrlForm className="mt-8 max-w-xl" />
        <p className="type-label mt-4 pl-5">Nothing is published until you approve it.</p>
      </section>

      <Section
        title="It becomes your brand"
        lead="The agent takes your colours and your tone of voice from your own pages. The same three posts, made for four different businesses:"
      >
        <RetintDemo />
      </Section>

      <Section
        title="How it works"
        lead="Six steps that repeat. Each time round, the agent knows a little more about what your followers respond to."
      >
        <LoopSection />
        <Button variant="secondary" asChild className="mt-8">
          <Link href="/how-it-works">See each step in detail</Link>
        </Button>
      </Section>

      <section className="mt-24 grid items-center gap-x-16 gap-y-10 md:mt-32 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="min-w-0">
          <h2 className="type-title">Nothing goes out without you</h2>
          <div className="mt-5 grid max-w-[52ch] gap-4 text-muted-foreground">
            <p>
              Drafts arrive as a stack of cards. Swipe right to approve a post, left to reject it, or open it to change
              the words, the picture or the time.
            </p>
            <p>
              Every post says why the agent made it, so you are judging the idea as well as the image. A decision can
              be undone until the moment the post is published.
            </p>
            <p>Most people clear a week of posts in a few minutes, usually from their phone.</p>
          </div>
        </div>
        <ApprovalDemo />
      </section>

      <Section
        title="It learns what works"
        lead="After a month the agent shows you what it found and the posts behind each finding, then writes the next strategy from them."
      >
        <ResultsStrip />
      </Section>

      <Section title="Start with your website." lead="It takes about a minute to read. You will see your brand kit before you decide anything.">
        <UrlForm className="max-w-xl" />
      </Section>
    </>
  );
}
