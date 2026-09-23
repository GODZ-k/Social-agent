import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

export async function runMigrations(url: string): Promise<void> {
  const pool = new pg.Pool({ connectionString: url });
  pool.on("error", (error) => console.error("Postgres pool error", error));
  try {
    await migrate(drizzle(pool), {
      migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
    });
  } finally {
    await pool.end();
  }
}
