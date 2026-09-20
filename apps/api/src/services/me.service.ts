import type { Me, MeOverview } from "@social-agent/shared";
import { BrandsService } from "@/services/brands.service";
import type { AuthUser } from "@/services/users.service";

/** What the signed-in person can see about themselves. */
export class MeService {
    static profile(user: AuthUser): Me {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            imageUrl: user.imageUrl,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
        };
    }

    /** `brands` is what this person owns, even for an admin. Empty means they have not onboarded yet. */
    static async overview(user: AuthUser): Promise<MeOverview> {
        const brands = await BrandsService.listOwnedBy(user.id);

        return {
            user: MeService.profile(user),
            brands,
            counts: { brands: brands.length },
        };
    }
}
