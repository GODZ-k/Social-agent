# apps/api/src/services/users.service.ts

- Role · type · L8-L8 — type Role = "admin" | "client";
- AuthUser · interface · L11-L20 — interface AuthUser
- UsersService · class · L25-L75 — class UsersService
- findOrCreate · method · L26-L74 — static async findOrCreate(clerkId: string): Promise<AuthUser>
- refresh · function · L83-L93 — async function refresh(id: string, profile: UserProfile): Promise<UserRow | undefined>
- roleFor · function · L99-L107 — function roleFor(clerkUser: ClerkUser): Role
- toAuthUser · function · L109-L119 — function toAuthUser(row: UserRow): AuthUser
