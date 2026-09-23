# apps/api/src/repositories/users.repository.ts

- UserProfile · type · L6-L6 — type UserProfile = Pick<UserRow, "email" | "name" | "imageUrl" | "role">;
- ClientWithBrandCount · interface · L8-L11 — interface ClientWithBrandCount
- UsersRepository · class · L14-L106 — class UsersRepository
- findByClerkId · method · L15-L18 — static async findByClerkId(clerkId: string): Promise<UserRow | undefined>
- update · method · L20-L27 — static async update(id: string, profile: Partial<UserProfile>): Promise<UserRow | undefined>
- findInvitedByEmail · method · L30-L37 — static async findInvitedByEmail(email: string): Promise<UserRow | undefined>
- linkInvited · method · L43-L48 — static async linkInvited(id: string, clerkId: string, profile: UserProfile): Promise<void>
- createIfMissing · method · L54-L59 — static async createIfMissing(clerkId: string, profile: UserProfile): Promise<void>
- findByEmail · method · L61-L64 — static async findByEmail(email: string): Promise<UserRow | undefined>
- findClientById · method · L67-L74 — static async findClientById(id: string): Promise<UserRow | undefined>
- listClients · method · L77-L85 — static async listClients(): Promise<ClientWithBrandCount[]>
- createInvited · method · L88-L100 — static async createInvited(values: { email: string; name: string | null; phone: string | null; invitedBy: string; }): Promise<UserRow | undefined>
- deleteInvited · method · L103-L105 — static async deleteInvited(id: string): Promise<void>
