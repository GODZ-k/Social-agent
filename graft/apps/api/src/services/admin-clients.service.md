# apps/api/src/services/admin-clients.service.ts

- AdminClientsService · class · L12-L59 — class AdminClientsService
- list · method · L13-L16 — static async list(): Promise<AdminClient[]>
- get · method · L18-L22 — static async get(id: string): Promise<AdminClientDetail>
- invite · method · L28-L52 — static async invite(admin: AuthUser, input: InviteClientInput): Promise<AdminClient>
- createBrand · method · L55-L58 — static async createBrand(admin: AuthUser, clientId: string, input: NewBrandInput): Promise<Brand>
- findClient · function · L61-L65 — async function findClient(id: string): Promise<UserRow>
- clientExists · function · L67-L69 — function clientExists(): AppError
- toAdminClient · function · L71-L82 — function toAdminClient(row: UserRow, brandCount: number): AdminClient
