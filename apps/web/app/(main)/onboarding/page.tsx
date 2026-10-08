import { OnboardingPage } from "@/modules/onboarding/templates/onboarding-page";

export default function Page(props: PageProps<"/onboarding">) {
  return <OnboardingPage searchParams={props.searchParams} />;
}
