import { Check, Image as ImageIcon, X } from "lucide-react";
import { PostArt } from "@repo/ui/components/social/post-art";
import { APP_NAME } from "@/lib/utils";
import { AuthPanel } from "./auth-panel";

// A sample post, illustrative only: the same PostArt every post card uses, not a real draft.
const SAMPLE_POST = { hook: "Morning buns are back", format: "image", art: { variant: 1, colorIndex: 0 }, mediaUrl: null } as const;
const SAMPLE_BRAND = { colors: [{ name: "Base", hex: "#f2f5fa" }, { name: "Ink", hex: "#1c2433" }, { name: "Accent", hex: "#f2b441" }] };

/** The product's one hard rule, drawn as the approval card people will use every week. */
export function ApprovalPanel() {
  return (
    <AuthPanel
      label={`About ${APP_NAME}`}
      heading="You approve every post before it goes out."
      body={`${APP_NAME} reads your website, plans your week and drafts posts that sound like you.`}
    >
      <div aria-hidden className="absolute inset-x-5 -top-4 h-16 rounded-[1.375rem] bg-card/70 shadow-raised" />
      <div aria-hidden className="relative rounded-[1.5rem] bg-card p-3.5 shadow-floating">
        <div className="relative">
          <PostArt post={SAMPLE_POST} brand={SAMPLE_BRAND} fixedAspect="aspect-[5/4]" />
          <span className="absolute top-[6%] right-[6%] grid size-8 place-items-center rounded-full bg-[#1c2433]/55 text-white">
            <ImageIcon className="size-3.5" aria-hidden />
          </span>
        </div>
        <p className="mx-1 mt-3.5 flex items-center justify-between gap-2 text-[0.8125rem] text-muted-foreground">
          <span>
            <b className="font-semibold text-foreground">Instagram</b> post
          </span>
          <span>Tuesday, 8:30 AM</span>
        </p>
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <span className="inline-flex h-10 items-center justify-center gap-2 rounded-full border bg-card text-sm font-medium">
            <X className="size-4" />
            Skip
          </span>
          <span className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground">
            <Check className="size-4" />
            Approve
          </span>
        </div>
      </div>
    </AuthPanel>
  );
}
