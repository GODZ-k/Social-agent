import { Globe } from "lucide-react";
import { prettyUrl } from "@/lib/utils";
import { TextLink } from "./text-link";
import { routes } from "@/config/routes";

/** The website typed on the landing page, carried into sign-up so nobody types it twice. */
export function SiteCarry({ url }: { url: string }) {
  return (
    <div className="mt-5 flex items-center gap-2.5 rounded-lg bg-card py-2.5 pr-3 pl-3.5 text-sm shadow-raised">
      <Globe className="size-4 shrink-0 text-primary" aria-hidden />
      <span className="min-w-0 flex-1 break-words">
        We&apos;ll read <b className="font-medium">{prettyUrl(url)}</b> once your account is ready.
      </span>
      <TextLink href={routes.auth.signUp}>Change</TextLink>
    </div>
  );
}
