import { HealthRepository } from "@/repositories/health.repository";

export interface HealthReport {
    status: "healthy" | "unhealthy";
    database: "up" | "down";
    timestamp: string;
}

export class HealthService {
    static async check(): Promise<HealthReport> {
        const databaseUp = await isDatabaseUp();

        return {
            status: databaseUp ? "healthy" : "unhealthy",
            database: databaseUp ? "up" : "down",
            timestamp: new Date().toISOString(),
        };
    }
}

async function isDatabaseUp(): Promise<boolean> {
    try {
        await HealthRepository.ping();
        return true;
    } catch (error) {
        console.error("Health check: database is unreachable", error);
        return false;
    }
}
