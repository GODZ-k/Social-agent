/** Which brands a query may touch: all of them (admins) or one owner's. The service decides. */
export type BrandScope = "all" | { ownerId: string };

/** Which scans a query may touch: all of them (admins) or one requester's. The service decides. */
export type ScanScope = "all" | { requestedBy: string };
