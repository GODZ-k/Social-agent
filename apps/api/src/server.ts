import app from "./app";
import { config } from "./config/constants";
import { pool } from "./config/db";
import { env } from "./config/env";

// Neon can drop the first connection after it has been idle, so try twice.
async function checkDatabase() {
    try {
        await pool.query("select 1");
    } catch {
        await pool.query("select 1");
    }
}

async function start() {
    try {
        await checkDatabase();
        console.log("Database connected successfully");

        // No boot sweep any more. It existed because the in-process queue died with the process, so
        // every active row on start-up was certainly orphaned. Trigger.dev keeps running across our
        // restarts, so a row that is `running` here is very likely still being worked on, and
        // failing it would be wrong. `failInterrupted()` stays on the repositories for a one-off
        // clean-up of rows stranded by the old queue.
    } catch (err) {
        console.error("Database connection failed", err);
        process.exit(1);
    }

    const server = app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    });

    let isShuttingDown = false;

    // Stop taking requests, let running ones finish, then close the database.
    function shutdown(reason: string, exitCode: number) {
        if (isShuttingDown) return;
        isShuttingDown = true;
        console.log(`${reason} received, shutting down`);

        setTimeout(() => {
            console.error("Shutdown took too long, forcing exit");
            process.exit(1);
        }, config.server.SHUTDOWN_TIMEOUT_MS).unref();

        // Background work is no longer interrupted by a restart: Trigger.dev runs it in its own
        // process, so a scan or a discovery run carries on and writes its own outcome. Marking the
        // active rows failed here — which the in-process queue had to do — would now be a lie.
        server.close(async () => {
            let code = exitCode;
            try {
                await pool.end();
                console.log("Database connection closed");
            } catch (err) {
                console.error("Error closing database connection", err);
                code = 1;
            }
            process.exit(code);
        });
    }

    process.on("SIGINT", () => shutdown("SIGINT", 0)); // Ctrl+C
    process.on("SIGTERM", () => shutdown("SIGTERM", 0)); // docker stop, hosting platforms

    process.on("uncaughtException", (err) => {
        console.error("Uncaught exception", err);
        shutdown("uncaughtException", 1);
    });
    process.on("unhandledRejection", (err) => {
        console.error("Unhandled rejection", err);
        shutdown("unhandledRejection", 1);
    });
}

start();
