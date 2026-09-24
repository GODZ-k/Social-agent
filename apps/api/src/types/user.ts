import type { UserRow } from "@social-agent/db";

/** The fields we copy from Clerk. */
export type UserProfile = Pick<UserRow, "email" | "name" | "imageUrl" | "role">;

export interface ClientWithBrandCount {
    user: UserRow;
    brandCount: number;
}
