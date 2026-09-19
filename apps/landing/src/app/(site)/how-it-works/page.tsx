import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { PageIntro, Section } from "@/components/section";
import { StepVisual } from "@/components/step-visuals";
import { UrlForm } from "@/components/url-form";
import { FAQ } from "@/lib/content/faq";
import { LOOP_STEPS } from "@/lib/content/loop";

export const metadata: Metadata = {
  title: "How it works",
  description: "The six steps the agent repeats: read, plan, draft, your approval, publish, learn.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro
        title="How it works"
        lead="The agent works in a loop of six steps. Here is each one, shown with an example pottery studio going round it."
      />

      <ol className="mt-14 grid gap-20 md:mt-20 md:gap-28">
        {LOOP_STEPS.map((step, i) => (
          <li
            key={step.stage}
            className="grid items-center gap-x-16 gap-y-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
          >
            <div className="min-w-0">
              <p className="type-number text-3xl text-tint-foreground">{i + 1}</p>
              <h2 className="type-title mt-2">{step.title}</h2>
              <p className="mt-4 max-w-[52ch] text-muted-foreground">{step.body}</p>
            </div>
            <StepVisual stage={step.stage} />
          </li>
        ))}
      </ol>

      <Section title="Questions">
        <Faq items={FAQ} />
      </Section>

      <Section title="Start with your website." lead="It takes about a minute to read. You will see your brand kit before you decide anything.">
        <UrlForm className="max-w-xl" />
      </Section>
    </>
  );
}
