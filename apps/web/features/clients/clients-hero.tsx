import { UrlForm } from "@/features/onboarding/url-form";

export function ClientsHero({ isAdmin }: { isAdmin: boolean }) {
  return (
    <section className="max-w-3xl">
      <h1 className="type-display">{isAdmin ? "Start with a website." : "Start with your website."}</h1>
      <p className="mt-5 max-w-[52ch] text-[1.0625rem] text-muted-foreground">
        {isAdmin
          ? "Paste a client's URL. The agent reads the site, works out the brand, plans the month and drafts the posts. Nothing goes out until you approve it."
          : "Paste your URL. The agent reads your site, works out your brand, plans the month and drafts the posts. Nothing goes out until you approve it."}
      </p>
      <div className="mt-8 max-w-xl">
        <UrlForm />
      </div>
    </section>
  );
}
