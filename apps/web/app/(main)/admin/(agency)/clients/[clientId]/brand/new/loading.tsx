import { OnboardingLoadingSkeleton } from "@/components/onboarding/onboarding-loading-skeleton";

/* The bar and the nav come from the `(agency)` layout, so only this route's own column is sketched. */
export default function NewBrandLoading() {
  return <OnboardingLoadingSkeleton />;
}
