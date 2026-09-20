import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

export function createDb(url: string) {
  const pool = new pg.Pool({ connectionString: url });
  pool.on("error", (error) => console.error("Postgres pool error", error));
  const db = drizzle(pool, { schema });
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];
