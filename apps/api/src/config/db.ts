import { createDb } from "@social-agent/db";
import { env } from "@/config/env";

/** The API's single database connection. Only repositories import it. */
export const { db, pool } = createDb(env.DATABASE_URL)