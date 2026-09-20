import { sql } from "drizzle-orm";
import { db } from "@/config/db";

export class HealthRepository {
    static async ping(): Promise<void> {
        await db.execute(sql`select 1`);
    }
}
