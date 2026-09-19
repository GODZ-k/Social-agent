import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Reveal } from "@/components/reveal";
import { PageIntro, Section } from "@/components/section";
import { SERVICES } from "@/lib/content/services";
import { signUpUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: "What the agent does for your business, and what our team adds on the Managed plan.",
};

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        title="Services"
        lead="Everything it takes to run a business's social media, done by an agent that asks before it posts. Use it yourself, or have our team run it with you."
      />

      <div className="mt-14 grid gap-14 md:mt-20 md:gap-16">
        {SERVICES.map((service) => (
          <Reveal key={service.id}>
          <section
            id={service.id}
            className="grid scroll-mt-24 gap-x-16 gap-y-5 border-t border-border pt-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
          >
            <div className="min-w-0">
              <h2 className="type-heading">{service.title}</h2>
              <p className="mt-3 max-w-[56ch] text-muted-foreground">{service.body}</p>
            </div>
            <ul className="grid min-w-0 content-start gap-2.5 md:pt-1">
              {service.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </section>
          </Reveal>
        ))}
      </div>

      <Section
        title="Not sure which suits you?"
        lead="Start on your own and see the brand kit the agent builds. If you would rather hand the whole thing over, tell us about your business and we will suggest a plan."
      >
        <div className="flex flex-wrap gap-2.5">
          <Button asChild>
            <a href={signUpUrl()}>Get started</a>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
