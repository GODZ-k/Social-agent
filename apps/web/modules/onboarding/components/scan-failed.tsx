import Link from "next/link";
import { Globe, Pencil, RefreshCw, TriangleAlert } from "lucide-react";
import { prettyUrl } from "@/lib/utils";
import { Button } from "@repo/ui/components/button";
import { routes } from "@/config/routes";

/** The scan timed out or was blocked (S02 v3). Nothing was saved, so every option starts clean. */
export function ScanFailed({ url, onRetry, onChangeAddress }: { url: string; onRetry: () => void; onChangeAddress: () => void }) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-warning/15 text-warning">
        <TriangleAlert className="size-6" />
      </div>
      <h1 className="type-title">We couldn&apos;t read {prettyUrl(url)}</h1>
      <p className="mt-3 text-muted-foreground">
        The site didn&apos;t answer within 30 seconds. It may be down, or it may block automated visits. Nothing was saved.
      </p>

      <div className="mt-8 grid gap-3 text-left">
        <FailOption icon={RefreshCw} title="Try again" detail="Sites that are slow to wake up often work the second time.">
          <Button onClick={onRetry}>Try again</Button>
        </FailOption>
        <FailOption icon={Globe} title="Use a different address" detail="For example your shop page or a link-in-bio site.">
          <Button variant="outline" onClick={onChangeAddress}>
            Change address
          </Button>
        </FailOption>
        <FailOption icon={Pencil} title="Fill in the brand kit yourself" detail="About 5 minutes. You can add the website later.">
          <Button variant="outline" asChild>
            <Link href={routes.onboarding.manual}>Fill it in</Link>
          </Button>
        </FailOption>
      </div>
    </div>
  );
}

function FailOption({
  icon: Icon,
  title,
  detail,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 shadow-raised">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-48 flex-1">
        <p className="font-medium">{title}</p>
        <p className="type-label">{detail}</p>
      </div>
      {children}
    </div>
  );
}
