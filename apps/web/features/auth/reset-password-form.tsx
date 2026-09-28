"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePasswordReset } from "@/lib/auth/client";
import { AUTH_POLICY, checkPassword, passwordAllowed } from "@/lib/auth/rules";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordRulesList } from "@/components/auth/password-rules-list";
import { SubmitButton } from "@/components/auth/submit-button";
import { errorCopy } from "./error-copy";
import { PasswordChanged } from "./password-changed";
import { ResetLinkExpired } from "./reset-link-expired";
import { useAuthSubmit } from "./use-auth-submit";

const schema = z.object({
  password: z.string().min(AUTH_POLICY.minPasswordLength),
  signOutOthers: z.boolean(),
});
type Values = z.infer<typeof schema>;

/** AUTH-4, second half: choose the new password. Signing out other devices is on unless unticked. */
export function ResetPasswordForm({ token }: { token?: string }) {
  const { ready, email, canSetPassword, setNewPassword } = usePasswordReset({ token });
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: "", signOutOthers: true } });
  const password = useWatch({ control: form.control, name: "password" });
  const [changed, setChanged] = useState<{ signedOutOthers: boolean } | null>(null);

  if (changed) return <PasswordChanged email={email ?? ""} signedOutOthers={changed.signedOutOthers} />;
  if (!ready) return <div className="skeleton h-80 w-full" role="status" aria-label="Loading" />;
  if (!canSetPassword || error?.code === "link_expired") return <ResetLinkExpired />;

  const leaked = error?.code === "password_leaked" ? true : undefined;
  const rules = checkPassword(password, email ?? "", leaked);
  const passwordError = error?.code === "password_leaked" || error?.code === "password_too_short" ? error : null;

  function submit(values: Values) {
    if (!passwordAllowed(rules)) return;
    run(
      () => setNewPassword({ password: values.password, signOutOtherDevices: values.signOutOthers }),
      () => setChanged({ signedOutOthers: values.signOutOthers }),
    );
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
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(submit)} aria-busy={pending}>
        {/* Lets password managers save the new password against the right account. */}
        <input type="email" name="username" autoComplete="username" value={email ?? ""} readOnly hidden />
        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <PasswordField
              id="password"
              label="New password"
              autoComplete="new-password"
              autoFocus
              {...field}
              onChange={(event) => {
                field.onChange(event);
                if (passwordError) setError(null);
              }}
              disabled={pending}
              aria-invalid={passwordError ? true : undefined}
              message={passwordError ? errorCopy(passwordError.code) : undefined}
              after={<PasswordRulesList rules={rules} />}
            />
          )}
        />
        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary" {...form.register("signOutOthers")} />
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
