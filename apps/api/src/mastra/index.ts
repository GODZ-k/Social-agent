
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { DuckDBStore } from "@mastra/duckdb";
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";
import { MastraCompositeStore } from '@mastra/core/storage';
import { Observability, MastraStorageExporter, MastraPlatformExporter, SensitiveDataFilter } from '@mastra/observability';
import { accountManager, audienceResearcher, brandAnalyst, growthConsultant } from './agents/team';
import { brandScanWorkflow } from './workflows/brand-scan/workflow';
import { businessDiscoveryWorkflow } from './workflows/business-discovery/workflow';

// The team, the workflows and the rules for building them are described in ./README.md.

export const postgresStore = new PostgresStore({
  id: 'mastra-storage',
  connectionString: process.env.DATABASE_URL!,
});

export const memory = new Memory({
  storage: postgresStore,
});

export const mastra = new Mastra({
  // Register each agent and workflow here as it is built (build order: see ./README.md).
  workflows: { brandScanWorkflow, businessDiscoveryWorkflow },
  agents: { brandAnalyst, growthConsultant, audienceResearcher, accountManager },

  storage: new MastraCompositeStore({
    id: 'composite-storage',
    default: postgresStore,
    domains: {
      observability: await new DuckDBStore().getStore('observability'),
    }
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new MastraStorageExporter(), // Persists observability events to Mastra Storage
          new MastraPlatformExporter(), // Sends observability events to Mastra Platform (if MASTRA_PLATFORM_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});
