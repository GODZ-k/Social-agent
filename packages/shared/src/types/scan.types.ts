import type { z } from "zod";
import type {
  newScanSchema,
  scanPageSchema,
  scanResultSchema,
  scanSchema,
  scanStatusSchema,
  scanStepIdSchema,
} from "../schema/scan.schema.js";

export type ScanStatus = z.infer<typeof scanStatusSchema>;
export type ScanStepId = z.infer<typeof scanStepIdSchema>;
export type ScanPage = z.infer<typeof scanPageSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;
export type NewScanInput = z.infer<typeof newScanSchema>;
export type Scan = z.infer<typeof scanSchema>;
