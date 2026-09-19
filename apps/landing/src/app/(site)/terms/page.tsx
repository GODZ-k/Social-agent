import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { TERMS } from "@/lib/content/legal";

export const metadata: Metadata = { title: TERMS.title, description: TERMS.lead };

export default function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
