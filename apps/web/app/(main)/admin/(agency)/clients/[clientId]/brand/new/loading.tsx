import { OnboardingLoadingSkeleton } from "@/modules/onboarding/templates/onboarding-loading-skeleton";

/* The bar and the nav come from the `(agency)` layout, so only this route's own column is sketched. */
export default function NewBrandLoading() {
  return <OnboardingLoadingSkeleton />;
}
