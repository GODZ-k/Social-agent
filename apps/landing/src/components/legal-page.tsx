import { PageIntro } from "./section";
import type { LegalDoc } from "@/lib/content/legal";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageIntro title={doc.title} lead={doc.lead} />
      {/* Remove the notice from lib/content/legal.ts once the text has been reviewed. */}
      {doc.draftNotice && (
        <p className="mt-6 max-w-[62ch] rounded-md bg-warning/14 px-4 py-3 text-warning">{doc.draftNotice}</p>
      )}
      <p className="type-label mt-6 tabular-nums">Last updated {doc.updated}</p>
      <div className="mt-10 grid max-w-[62ch] gap-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="type-heading">{section.heading}</h2>
            <div className="mt-3 grid gap-3 text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
