/**
 * Stands in for an auth form while the part that depends on the URL streams in.
 * The frame around it — logo, brand panel, promise, footer — is already painted,
 * so this only has to hold the form's own space steady.
 */
export function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div role="status" aria-label="Loading">
      <div className="skeleton h-9 w-56 max-w-full rounded-full" />
      <div className="skeleton mt-3 h-4 w-72 max-w-full rounded-full" />
      <div className="skeleton mt-8 h-12 w-full rounded-[0.875rem]" />
      <div className="skeleton mx-auto mt-6 h-3 w-24 rounded-full" />
      <div className="mt-6 grid gap-4.5">
        {Array.from({ length: fields }, (_, field) => (
          <div key={field} className="grid gap-1.75">
            <div className="skeleton h-4 w-20 rounded-full" />
            <div className="skeleton h-12 w-full rounded-[0.875rem]" />
          </div>
        ))}
        <div className="skeleton h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
