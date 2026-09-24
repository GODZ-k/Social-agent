import type { BrandKit } from "@social-agent/shared";
import { PostArt } from "@repo/ui/components/social/post-art";

/** The sticky aside: a sample post in the kit as it is being edited, then whatever the form puts under it. */
export function BrandPreview({ brand, hook, children }: { brand: BrandKit; hook: string; children: React.ReactNode }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <p className="type-label mb-2.5">A post in this brand</p>
      <PostArt
        brand={brand}
        post={{ hook, format: "carousel", art: { variant: 0, colorIndex: 0 } }}
        className="max-w-64 shadow-floating lg:max-w-none"
      />
      {children}
    </aside>
  );
}
