"use client";

import { useState } from "react";
import { usePasswordReset } from "@/lib/auth/client";
import { checkPassword, passwordAllowed } from "@/lib/auth/rules";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordRulesList } from "@/components/auth/password-rules-list";
import { SubmitButton } from "@/components/auth/submit-button";
import { errorCopy } from "./error-copy";
import { PasswordChanged } from "./password-changed";
import { ResetLinkExpired } from "./reset-link-expired";
import { useAuthSubmit } from "./use-auth-submit";

/** AUTH-4, second half: choose the new password. Signing out other devices is on unless unticked. */
export function ResetPasswordForm({ token }: { token?: string }) {
  const { ready, email, canSetPassword, setNewPassword } = usePasswordReset({ token });
  const { pending, error, setError, run } = useAuthSubmit();
  const [password, setPassword] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [changed, setChanged] = useState<{ signedOutOthers: boolean } | null>(null);

  if (changed) return <PasswordChanged email={email ?? ""} signedOutOthers={changed.signedOutOthers} />;
  if (!ready) return <div className="skeleton h-80 w-full" role="status" aria-label="Loading" />;
  if (!canSetPassword || error?.code === "link_expired") return <ResetLinkExpired />;

  const leaked = error?.code === "password_leaked" ? true : undefined;
  const rules = checkPassword(password, email ?? "", leaked);
  const passwordError = error?.code === "password_leaked" || error?.code === "password_too_short" ? error : null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordAllowed(rules)) return;
    run(
      () => setNewPassword({ password, signOutOtherDevices: signOutOthers }),
      () => setChanged({ signedOutOthers: signOutOthers }),
    );
  }

  function changePassword(value: string) {
    setPassword(value);
    if (passwordError) setError(null);
  }

  return (
    <>
      <AuthHeading title="Choose a new password">
        {email ? (
          <>
            For <b>{email}</b>. Use the eye button to check what you typed.
          </>
        ) : (
          "Use the eye button to check what you typed."
        )}
      </AuthHeading>
      {error && !passwordError ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={submit} aria-busy={pending}>
        {/* Lets password managers save the new password against the right account. */}
        <input type="email" name="username" autoComplete="username" value={email ?? ""} readOnly hidden />
        <PasswordField
          id="password"
          label="New password"
          autoComplete="new-password"
          required
          autoFocus
          value={password}
          onChange={(event) => changePassword(event.target.value)}
          disabled={pending}
          aria-invalid={passwordError ? true : undefined}
          message={passwordError ? errorCopy(passwordError.code) : undefined}
          after={<PasswordRulesList rules={rules} />}
        />
        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            name="signOutOthers"
            checked={signOutOthers}
            onChange={(event) => setSignOutOthers(event.target.checked)}
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary"
          />
          <span>
            Sign me out on other devices
            <small className="block text-[0.8125rem] text-muted-foreground">Recommended if you think someone else knows your old password.</small>
          </span>
        </label>
        <SubmitButton pending={pending}>Save new password</SubmitButton>
      </form>
    </>
  );
}
