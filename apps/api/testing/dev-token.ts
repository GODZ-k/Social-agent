// TESTING TOOL: a Clerk sign-in token for calling the API by hand (curl, Scalar "try it").
//
// What it does: finds the Clerk user, opens a session and prints its token. Works only in
// development, because the API skips the authorizedParties check outside production.
//
// How to use (from the repo root):
//   pnpm --filter api run --silent dev-token -- user_3J5WS7...        (a Clerk user id)
//   pnpm --filter api run --silent dev-token -- someone@example.com
//   then: curl -H "Authorization: Bearer <token>" http://localhost:<PORT>/api/v1/me   (PORT from apps/api/.env)
//
// Needs in apps/api/.env: CLERK_SECRET_KEY. The token lasts about 60 seconds: mint one per request.
//
// What you should see: one line, the token (starts with "eyJ"). Nothing else goes to stdout, so
// TOKEN=$(pnpm --filter api run --silent dev-token -- user_...) works.
// Exit code 0 = ok, 1 = Clerk error or unknown user, 2 = usage.
import "dotenv/config";

const CLERK_API = "https://api.clerk.com/v1";

type ClerkUser = { id: string; email_addresses: { email_address: string }[] };

function secretKey(): string {
    const key = process.env.CLERK_SECRET_KEY;
    if (!key) throw new Error("CLERK_SECRET_KEY is missing in apps/api/.env");
    return key;
}

async function clerk<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${CLERK_API}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json", ...init.headers },
    });
    if (!response.ok) throw new Error(`Clerk ${path} answered ${response.status}: ${(await response.text()).slice(0, 200)}`);
    return (await response.json()) as T;
}

async function userIdFor(who: string): Promise<string> {
    if (who.startsWith("user_")) return who;
    const users = await clerk<ClerkUser[]>(`/users?email_address=${encodeURIComponent(who)}&limit=1`);
    const user = users[0];
    if (!user) throw new Error(`No Clerk user has the email ${who}`);
    return user.id;
}

async function mintToken(userId: string): Promise<string> {
    const session = await clerk<{ id: string }>("/sessions", { method: "POST", body: JSON.stringify({ user_id: userId }) });
    const token = await clerk<{ jwt: string }>(`/sessions/${session.id}/tokens`, { method: "POST" });
    return token.jwt;
}

async function main(): Promise<number> {
    const who = process.argv.slice(2).find((arg) => arg !== "--");
    if (!who) {
        console.error("Usage: pnpm --filter api run dev-token -- <email or user_...>");
        return 2;
    }
    const jwt = await mintToken(await userIdFor(who));
    console.log(jwt);
    return 0;
}

main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        return 1;
    })
    .then((code) => process.exit(code));
