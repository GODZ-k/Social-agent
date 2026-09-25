import type { z } from "zod";
import type { brandContextSchema } from "../schema/brand-context.schema.js";

export type BrandContext = z.infer<typeof brandContextSchema>;
