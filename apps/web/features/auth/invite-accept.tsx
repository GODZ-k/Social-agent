"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail } from "lucide-react";
import { useInvite } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import { AUTH_POLICY, checkPassword, passwordAllowed, passwordErrorFrom } from "@/lib/auth/rules";
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

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  password: z.string().min(AUTH_POLICY.minPasswordLength),
});
type Values = z.infer<typeof schema>;

/** AUTH-5: the invite link already proves the email, so there is no code step. */
export function InviteAccept({ token, redirectTo }: { token: string | null; redirectTo: string }) {
  const router = useRouter();
  const { state, accept } = useInvite({ token, redirectTo });
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", password: "" } });
  const password = useWatch({ control: form.control, name: "password" });

  if (state.status === "loading") return <div className="skeleton h-96 w-full" role="status" aria-label="Opening your invite" />;
  if (state.status === "used" || error?.code === "invite_used") return <InviteUsed />;
  if (state.status === "expired" || error?.code === "link_expired") return <InviteExpired />;

  const { email } = state;
  const passwordError = passwordErrorFrom(error);
  const leaked = passwordError?.code === "password_leaked" ? true : undefined;
  const rules = checkPassword(password, email, leaked);

  function submit(values: Values) {
    if (!passwordAllowed(rules)) return;
    run(
      () => accept({ name: values.name, password: values.password }),
      (step) => {
        if (step === "set-up-two-factor") router.push(withRedirect("/two-factor/setup", redirectTo));
      },
    );
  }

  return (
    <>
      <AuthHeading title="Set up your account">You were invited to {APP_NAME}. Choose a password to finish.</AuthHeading>
      {error && !passwordError ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(submit)} aria-busy={pending}>
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
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              id="name"
              label="Your name"
              autoComplete="name"
              disabled={pending}
              {...field}
              aria-invalid={!!fieldState.error || undefined}
              message={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <PasswordField
              id="password"
              label="Choose a password"
              autoComplete="new-password"
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
