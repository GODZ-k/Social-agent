import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { PageIntro, Section } from "@/components/section";
import { company } from "@/lib/content/company";

export const metadata: Metadata = {
  title: "About",
  description: "Who makes the product, and what we think an agent posting on your behalf owes you.",
};

export default function AboutPage() {
  return (
    <>
      <PageIntro title="About" lead="We are an agency that built the tool we wanted for our own clients." />

      <div className="mt-10 grid max-w-[62ch] gap-5 text-[1.0625rem]">
        {company.story.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <Section title="What we hold to">
        <div className="grid max-w-[62ch] gap-8">
          {company.principles.map((principle) => (
            <div key={principle.title}>
              <h3 className="type-heading">{principle.title}</h3>
              <p className="mt-2 text-muted-foreground">{principle.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Talk to us" lead="Questions about the product, or about having our team run your accounts.">
        <Button variant="secondary" asChild>
          <Link href="/contact">Contact us</Link>
        </Button>
      </Section>
    </>
  );
}
