import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PRIVACY } from "@/lib/content/legal";

export const metadata: Metadata = { title: PRIVACY.title, description: PRIVACY.lead };

export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />;
}
