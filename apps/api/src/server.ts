import app from "./app";
import { config } from "./config/constants";
import { pool } from "./config/db";
import { env } from "./config/env";
import { ScansRepository } from "@/repositories/scans.repository";
import { pendingScanCount } from "@/scan-queue";

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

        const interrupted = await ScansRepository.failInterrupted();
        if (interrupted > 0) console.log(`Marked ${interrupted} interrupted scan(s) as failed`);
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

        server.close(async () => {
            let code = exitCode;
            try {
                const pending = pendingScanCount();
                if (pending > 0) {
                    console.log(`${pending} scan(s) still running, marking them interrupted`);
                    await ScansRepository.failInterrupted();
                }
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
