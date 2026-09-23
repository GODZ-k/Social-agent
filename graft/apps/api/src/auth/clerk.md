# apps/api/src/auth/clerk.ts

- getClerkUserId · function · L14-L16 — function getClerkUserId(req: Request): string | null
- ClerkUser · interface · L18-L24 — interface ClerkUser
- fetchClerkUser · function · L26-L39 — async function fetchClerkUser(clerkId: string): Promise<ClerkUser>
- sendInvitation · function · L45-L47 — async function sendInvitation(email: string, redirectUrl: string): Promise<void>
