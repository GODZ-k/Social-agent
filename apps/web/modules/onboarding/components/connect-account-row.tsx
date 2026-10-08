"use client";

import { LoaderCircle } from "lucide-react";
import type { Platform, SocialAccount } from "@social-agent/shared";
import { connectAccount } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@/lib/utils";

const NEEDS: Partial<Record<Platform, string>> = {
  instagram: "Needs an Instagram business or creator account.",
  facebook: "Posts to your Facebook Page.",
};

/** Each network's own brand colour, so the badge reads at a glance. */
const BRAND_BG: Partial<Record<Platform, string>> = {
  instagram: "bg-[#d6336c] text-white",
  facebook: "bg-[#1877f2] text-white",
};

/**
 * One network to connect during onboarding (S17b). Connecting lets approved posts go out on
 * their own. `primary` marks the one filled call-to-action; the rest stay outline.
 */
export function ConnectAccountRow({
  brandId,
  platform,
  account,
  primary,
  onConnected,
}: {
  brandId: string;
  platform: Platform;
  account: SocialAccount | null;
  primary: boolean;
  onConnected: (account: SocialAccount) => void;
}) {
  const name = PLATFORM_LABEL[platform];
  const connect = useServerAction(connectAccount, {
    success: `${name} connected`,
    onSuccess: (brand) => {
      const connected = brand.accounts.find((a) => a.platform === platform);
      if (connected) onConnected(connected);
    },
  });
  const connected = account?.status === "connected";

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-card p-4 shadow-raised md:p-5">
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-md", BRAND_BG[platform] ?? "bg-tint text-tint-foreground")}>
        <PlatformIcon platform={platform} className="size-5" />
      </span>
      <div className="min-w-48 flex-1">
        <p className="font-medium">{name}</p>
        <p className="type-label">{NEEDS[platform] ?? `Posts to ${name}.`}</p>
      </div>
      {connected ? (
        <Badge variant="success" className="ml-auto">
          Connected as {account.handle}
        </Badge>
      ) : (
        <Button
          className="ml-auto max-[560px]:w-full"
          variant={primary ? "default" : "outline"}
          disabled={connect.isPending}
          onClick={() => connect.run(brandId, platform)}
        >
          {connect.isPending && <LoaderCircle className="animate-spin" />}
          {connect.isPending ? `Opening ${name}` : `Connect ${name}`}
        </Button>
      )}
    </div>
  );
}
