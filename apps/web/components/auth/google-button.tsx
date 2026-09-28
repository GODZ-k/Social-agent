import { Button } from "@repo/ui/components/button";
import { OrDivider } from "./or-divider";

// Google's own mark; its colours are part of the brand, not our palette.
const GOOGLE_MARK = (
  <svg viewBox="0 0 24 24" aria-hidden className="size-4.5">
    <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.9a5.05 5.05 0 0 1-2.2 3.3v2.75h3.55c2.08-1.92 3.25-4.74 3.25-8.08z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.75c-.99.66-2.25 1.06-3.73 1.06-2.87 0-5.3-1.94-6.16-4.54H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1a11 11 0 0 0-9.82 6.06L5.84 9.9C6.7 7.3 9.13 5.38 12 5.38z" />
  </svg>
);

/** The optional Google button with the "or with email" divider under it. */
export function GoogleButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="grid gap-3">
      <Button type="button" variant="outline" size="lg" className="w-full" onClick={onClick} disabled={disabled}>
        {GOOGLE_MARK}
        {label}
      </Button>
      <OrDivider>or with email</OrDivider>
    </div>
  );
}
