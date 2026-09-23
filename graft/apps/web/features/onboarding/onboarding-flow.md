# apps/web/features/onboarding/onboarding-flow.tsx

- Step · type · L12-L12 — type Step = "url" | "scanning" | "error" | "review";
- OnboardingFlow · function · L14-L47 — function OnboardingFlow({ initialUrl }: { initialUrl: string | null })
- stepFor · function · L49-L54 — function stepFor(url: string | null, status: ReturnType<typeof useScan>["status"]): Step
