"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { useInvite } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import { checkPassword, passwordAllowed } from "@/lib/auth/rules";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordRulesList } from "@/components/auth/password-rules-list";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { TextLink } from "@/components/auth/text-link";
import { APP_NAME } from "@/lib/utils";
import { errorCopy } from "./error-copy";
import { InviteExpired } from "./invite-expired";
import { InviteUsed } from "./invite-used";
import { useAuthSubmit } from "./use-auth-submit";

/** AUTH-5: the invite link already proves the email, so there is no code step. */
export function InviteAccept({ token, redirectTo }: { token: string | null; redirectTo: string }) {
  const router = useRouter();
  const { state, accept } = useInvite({ token, redirectTo });
  const { pending, error, setError, run } = useAuthSubmit();
  const [password, setPassword] = useState("");

  if (state.status === "loading") return <div className="skeleton h-96 w-full" role="status" aria-label="Opening your invite" />;
  if (state.status === "used" || error?.code === "invite_used") return <InviteUsed />;
  if (state.status === "expired" || error?.code === "link_expired") return <InviteExpired />;

  const { email } = state;
  const leaked = error?.code === "password_leaked" ? true : undefined;
  const rules = checkPassword(password, email, leaked);
  const passwordError = error?.code === "password_leaked" || error?.code === "password_too_short" ? error : null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordAllowed(rules)) return;
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    run(
      () => accept({ name, password }),
      (step) => {
        if (step === "set-up-two-factor") router.push(withRedirect("/two-factor/setup", redirectTo));
      },
    );
  }

  function changePassword(value: string) {
    setPassword(value);
    if (passwordError) setError(null);
  }

  return (
    <>
      <AuthHeading title="Set up your account">You were invited to {APP_NAME}. Choose a password to finish.</AuthHeading>
      {error && !passwordError ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={submit} aria-busy={pending}>
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="username"
          value={email}
          readOnly
          leading={<Mail className="size-4" aria-hidden />}
          message={
            <span className="inline-flex items-start gap-1.5">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              From your invite. You can change it in settings later.
            </span>
          }
        />
        <TextField id="name" label="Your name" autoComplete="name" required disabled={pending} />
        <PasswordField
          id="password"
          label="Choose a password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => changePassword(event.target.value)}
          disabled={pending}
          aria-invalid={passwordError ? true : undefined}
          message={passwordError ? errorCopy(passwordError.code) : undefined}
          after={<PasswordRulesList rules={rules} />}
        />
        <SubmitButton pending={pending} pendingLabel="Setting up your account">
          Create account
        </SubmitButton>
        <p className="text-[0.8125rem] leading-normal text-muted-foreground">
          By creating an account you agree to the <TextLink href="#">Terms</TextLink> and <TextLink href="#">Privacy policy</TextLink>.
        </p>
      </form>
    </>
  );
}
