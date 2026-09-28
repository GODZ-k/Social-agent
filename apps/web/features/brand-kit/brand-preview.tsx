import type { BrandKit } from "@social-agent/shared";
import { PostArt } from "@repo/ui/components/social/post-art";

/** The sticky aside: a sample post in the kit as it is being edited, then whatever the form puts under it. */
export function BrandPreview({ brand, hook, children }: { brand: BrandKit; hook: string; children: React.ReactNode }) {
  return (
    <aside className="order-first flex items-center gap-4 lg:order-none lg:block lg:sticky lg:top-24 lg:self-start">
      <PostArt
        brand={brand}
        post={{ hook, format: "carousel", art: { variant: 0, colorIndex: 0 } }}
        className="w-36 shrink-0 shadow-floating lg:w-64 lg:max-w-none"
      />
      <div className="lg:mt-3">
        <p className="font-medium">A post in your brand</p>
        <p className="type-label mt-0.5">Changes as you edit.</p>
        {children}
      </div>
    </aside>
  );
}
