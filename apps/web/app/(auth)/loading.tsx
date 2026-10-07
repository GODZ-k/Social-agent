import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { AuthFrame } from "@/components/auth/auth-frame";
import { AuthPanel } from "@/components/auth/auth-panel";

/**
 * LD-1: the auth shell while a signed-out route resolves, shared by sign-in, sign-up,
 * forgot-password, reset-password, verify, two-factor, two-factor/lost-access and invite.
 *
 * The frame, the logo, the footer and the panel's tinted ground are real, because every one of
 * those routes draws them the same way. What differs per route is sketched: the switch link, the
 * form, the panel's card and copy, and the promise under the form. A `loading.tsx` receives no
 * parameters, so it cannot pick between eight variants — the bones are the honest answer.
 *
 * `/two-factor/setup` has its own, because its first step is a method choice rather than a form.
 */
export default function AuthLoading() {
  return (
    <AuthFrame
      top={<span className="skeleton block h-4 w-36 rounded-full" />}
      promise={<span className="skeleton block h-4 w-60 max-w-full rounded-full" />}
      panel={
        <AuthPanel
          label="Loading"
          heading={<span className="skeleton mx-auto block h-7 w-72 max-w-full rounded-full" />}
          body={<span className="skeleton mx-auto mt-3 block h-4 w-56 max-w-full rounded-full" />}
        >
          <div className="skeleton h-64 w-full rounded-[1.5rem]" />
        </AuthPanel>
      }
    >
      <AuthFormSkeleton fields={2} />
    </AuthFrame>
  );
}
