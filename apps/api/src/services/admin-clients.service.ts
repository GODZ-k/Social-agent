import type { UserRow } from "@social-agent/db";
import type { AdminClient, AdminClientDetail, Brand, InviteClientInput, NewBrandInput } from "@social-agent/shared";
import { sendInvitation } from "@/auth/clerk";
import { env } from "@/config/env";
import { UsersRepository } from "@/repositories/users.repository";
import { BrandsService } from "@/services/brands.service";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { isUuid } from "@/utils";

/** The admin's view of clients (people). Every route that reaches this is behind `requireAdmin`. */
export class AdminClientsService {
    static async list(): Promise<AdminClient[]> {
        const rows = await UsersRepository.listClients();
        return rows.map(({ user, brandCount }) => toAdminClient(user, brandCount));
    }

    static async get(id: string): Promise<AdminClientDetail> {
        const client = await findClient(id);
        const brands = await BrandsService.listOwnedBy(client.id);
        return { client: toAdminClient(client, brands.length), brands };
    }

    /**
     * Creates the person before they have an account, so the admin can set up their brand
     * straight away. The row links to their Clerk account on their first sign-in.
     */
    static async invite(admin: AuthUser, input: InviteClientInput): Promise<AdminClient> {
        const existing = await UsersRepository.findByEmail(input.email);
        if (existing) throw clientExists();

        const row = await UsersRepository.createInvited({
            email: input.email,
            name: input.name ?? null,
            phone: input.phone ?? null,
            invitedBy: admin.id,
        });
        // A concurrent invite for the same email can slip past the check above; the insert's
        // own conflict handling is what actually prevents the duplicate.
        if (!row) throw clientExists();

        try {
            await sendInvitation(row.email, `${env.CORS_ORIGINS[0]}/sign-up`);
        } catch (error) {
            // Without the email the person can never arrive, so do not leave a row behind.
            await UsersRepository.deleteInvited(row.id);
            console.error("Clerk invitation failed", error);
            throw new AppError("The invitation email could not be sent. Try again.", 502, "INVITE_FAILED");
        }

        return toAdminClient(row, 0);
    }

    /** The client owns the brand; `createdBy` records the admin. */
    static async createBrand(admin: AuthUser, clientId: string, input: NewBrandInput): Promise<Brand> {
        const client = await findClient(clientId);
        return BrandsService.create(admin, input, client.id);
    }
}

async function findClient(id: string): Promise<UserRow> {
    const client = isUuid(id) ? await UsersRepository.findClientById(id) : undefined;
    if (!client) throw new AppError("This client doesn't exist.", 404, "CLIENT_NOT_FOUND");
    return client;
}

function clientExists(): AppError {
    return new AppError("Someone with this email is already here.", 409, "CLIENT_EXISTS");
}

function toAdminClient(row: UserRow, brandCount: number): AdminClient {
    return {
        id: row.id,
        email: row.email,
        name: row.name,
        imageUrl: row.imageUrl,
        phone: row.phone,
        status: row.status,
        brandCount,
        createdAt: row.createdAt.toISOString(),
    };
}
