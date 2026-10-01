"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authCapabilities, BotCheck, useSignUpFlow } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import { AUTH_POLICY, checkPassword, passwordAllowed, passwordErrorFrom } from "@/lib/auth/rules";
import { APP_NAME } from "@/lib/utils";
import { AuthHeading } from "@/components/auth/auth-heading";
import { GoogleButton } from "@/components/auth/google-button";
import { Notice } from "@/components/auth/notice";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordRulesList } from "@/components/auth/password-rules-list";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { TextLink } from "@/components/auth/text-link";
import { errorCopy } from "./error-copy";
import { useAuthSubmit } from "./use-auth-submit";

const formSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  email: z.string().trim().min(1, "Enter your email").pipe(z.email("Enter a valid email")),
  password: z.string().min(AUTH_POLICY.minPasswordLength, "At least 10 characters"),
});
type SignUpValues = z.infer<typeof formSchema>;

/**
 * AUTH-2. Always continues to the code step, even for an email that already has
 * an account, so the page never tells anyone which emails are registered.
 */
export function SignUpForm({ redirectTo, site }: { redirectTo: string; site?: React.ReactNode }) {
  const router = useRouter();
  const { signUpWithPassword, signUpWithGoogle } = useSignUpFlow({ redirectTo });
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<SignUpValues>({ resolver: zodResolver(formSchema), defaultValues: { name: "", email: "", password: "" } });
  const email = useWatch({ control: form.control, name: "email" });
  const password = useWatch({ control: form.control, name: "password" });

  const passwordError = passwordErrorFrom(error);
  const leaked = passwordError?.code === "password_leaked" ? true : undefined;
  const rules = checkPassword(password, email, leaked);
  const emailTaken = error?.code === "email_in_use";

  function onValid(values: SignUpValues) {
    if (!passwordAllowed(rules)) return;
    run(
      () => signUpWithPassword(values),
      () => router.push(withRedirect("/verify", redirectTo)),
    );
  }

  const passwordRules = <PasswordRulesList rules={rules} />;

  return (
    <>
      <AuthHeading title="Create your account">Next you paste your website, and {APP_NAME} drafts a brand kit you can edit.</AuthHeading>
      {site}
      {error && !passwordError && !emailTaken ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(onValid)} noValidate aria-busy={pending}>
        {authCapabilities.google ? <GoogleButton label="Sign up with Google" onClick={() => run(signUpWithGoogle)} disabled={pending} /> : null}
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              id="name"
              label="Your name"
              autoComplete="name"
              {...field}
              disabled={pending}
              aria-invalid={!!fieldState.error || undefined}
              message={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              id="email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              autoCapitalize="off"
              {...field}
              disabled={pending}
              aria-invalid={emailTaken || !!fieldState.error || undefined}
              message={
                emailTaken ? (
                  <>
                    This email already has an account. <TextLink href={withRedirect("/sign-in", redirectTo)}>Sign in</TextLink> or{" "}
                    <TextLink href={withRedirect("/forgot-password", redirectTo)}>reset your password</TextLink>.
                  </>
                ) : (
                  fieldState.error?.message
                )
              }
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordField
              id="password"
              label="Password"
              autoComplete="new-password"
              {...field}
              onChange={(event) => {
                field.onChange(event);
                if (passwordError) setError(null);
              }}
              disabled={pending}
              aria-invalid={!!passwordError || !!fieldState.error || undefined}
              message={passwordError ? errorCopy(passwordError.code) : fieldState.error?.message}
              after={passwordRules}
            />
          )}
        />
        {/* Empty until Clerk needs a challenge; without this it still claims a full gap on both sides and doubles the space before the button. */}
        <div className="-my-2.25">
          <BotCheck />
        </div>
        <SubmitButton pending={pending} pendingLabel="Creating your account">
          Create account
        </SubmitButton>
        <p className="text-[0.8125rem] leading-normal text-muted-foreground">
          By creating an account you agree to the <TextLink href="#">Terms</TextLink> and <TextLink href="#">Privacy policy</TextLink>.
        </p>
      </form>
    </>
  );
}
