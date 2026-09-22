import type { Client, Platform } from "@/lib/types";
import { AccountRow } from "@/features/settings/account-row";

const ALL_PLATFORMS: Platform[] = ["instagram", "facebook", "tiktok", "linkedin"];

/**
 * One row per network. The status line always says what the state means for
 * publishing, because that is the only reason anyone comes to this screen.
 */
export function SocialAccounts({ client }: { client: Client }) {
  // Networks the strategy posts to come first: those are the ones that matter.
  const platforms = [...ALL_PLATFORMS].sort(
    (a, b) => Number(client.platforms.includes(b)) - Number(client.platforms.includes(a)),
  );

  return (
    <ul className="grid gap-3">
      {platforms.map((platform) => (
        <AccountRow
          key={platform}
          clientId={client.id}
          platform={platform}
          planned={client.platforms.includes(platform)}
          account={client.accounts.find((a) => a.platform === platform) ?? null}
        />
      ))}
    </ul>
  );
}
