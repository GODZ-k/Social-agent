import { SkeletonRows } from "@repo/ui/components/states";

// The top bar needs the viewer, which is not known yet; only the content skeleton shows.
export default function ClientsLoading() {
  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-5xl px-4 pt-14 md:px-6 md:pt-24">
        <SkeletonRows rows={3} className="[&>*]:h-24" />
      </main>
    </div>
  );
}
