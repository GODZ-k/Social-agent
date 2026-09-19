import type { Metadata } from "next";
import { Panel } from "@repo/ui/components/states";
import { ContactForm } from "@/components/contact-form";
import { PageIntro } from "@/components/section";
import { company } from "@/lib/content/company";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask about the product or the Managed plan. We reply within one working day.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro title="Contact" lead="Ask about the product or the Managed plan. We reply within one working day." />

      <div className="mt-10 grid gap-x-16 gap-y-10 md:mt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <dl className="grid min-w-0 content-start gap-6">
          <div>
            <dt className="type-label">Email</dt>
            <dd className="mt-1">
              <a href={`mailto:${company.email}`} className="font-medium text-tint-foreground underline-offset-4 hover:underline">
                {company.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="type-label">Where we are</dt>
            <dd className="mt-1">{company.location}</dd>
          </div>
        </dl>
        <Panel className="min-w-0" aria-label="Send us a message">
          <ContactForm />
        </Panel>
      </div>
    </>
  );
}
