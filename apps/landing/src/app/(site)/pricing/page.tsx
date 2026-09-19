import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { PricingTable } from "@/components/pricing-table";
import { PageIntro, Section } from "@/components/section";
import { PRICING_FAQ } from "@/lib/content/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Three plans, billed monthly. Every plan lets you approve, edit or reject every post.",
};

export default function PricingPage() {
  return (
    <>
      <PageIntro
        title="Pricing"
        lead="Three plans, billed monthly, with no contract. On every plan, nothing is published until you approve it."
      />
      <div className="mt-10 md:mt-14">
        <PricingTable />
      </div>
      <Section title="Pricing questions">
        <Faq items={PRICING_FAQ} />
      </Section>
    </>
  );
}
