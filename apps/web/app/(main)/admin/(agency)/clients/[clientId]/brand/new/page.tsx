import { NewBrandPage } from "@/modules/onboarding/templates/new-brand-page";

/**
 * Props come from the generated `PageProps` rather than a hand-written type: the route moved once
 * already (from `/admin/c/:brandId/brand/new`), and a hand-written `params` type agreed with the
 * old segment name while the real one had changed, which is how this page 404'd.
 */
export default function Page(props: PageProps<"/admin/clients/[clientId]/brand/new">) {
  return <NewBrandPage params={props.params} searchParams={props.searchParams} />;
}
