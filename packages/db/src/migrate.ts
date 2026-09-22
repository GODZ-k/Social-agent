import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

/** Applies every migration in packages/db/drizzle that the database has not seen. */
export async function runMigrations(url: string): Promise<void> {
  const pool = new pg.Pool({ connectionString: url });
  // An idle client that dies (hosted Postgres closes idle connections) emits here. Without a
  // listener Node treats it as an uncaught exception and kills the process.
  pool.on("error", (error) => console.error("Postgres pool error", error));
  try {
    await migrate(drizzle(pool), {
      migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
    });
  } finally {
    await pool.end();
  }
}
