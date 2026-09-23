# apps/api/scripts/dev-token.ts

- ClerkUser · type · L8-L8 — type ClerkUser = { id: string; email_addresses: { email_address: string }[] };
- secretKey · function · L10-L14 — function secretKey(): string
- clerk · function · L16-L23 — async function clerk<T>(path: string, init: RequestInit = {}): Promise<T>
- userIdFor · function · L25-L31 — async function userIdFor(who: string): Promise<string>
- mintToken · function · L33-L37 — async function mintToken(userId: string): Promise<string>
- main · function · L39-L48 — async function main(): Promise<number>
