"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Smartphone } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AUTH_POLICY } from "@/lib/auth/rules";
import type { AuthenticatorSetup, AuthResult } from "@/lib/auth/types";
import { APP_NAME } from "@/lib/utils";
import { AuthHeading } from "@/components/auth/auth-heading";
import { CodeField } from "@/components/auth/code-field";
import { Notice } from "@/components/auth/notice";
import { SubmitButton } from "@/components/auth/submit-button";
import { CopyButton } from "./copy-button";
import { errorCopy } from "./error-copy";
import { SetupProgress } from "./setup-progress";
import { useAuthSubmit } from "./use-auth-submit";

const schema = z.object({ code: z.string().length(AUTH_POLICY.codeLength, "Enter the 6-digit code.") });
type Values = z.infer<typeof schema>;

/** Groups the key in fours so it is easier to type into an app by hand. */
function groupKey(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret;
}

/**
 * Step 2 with an authenticator app: add the account, then type its first code.
 * No QR code yet (it needs a QR library); the "open in app" link covers phones and the key covers the rest.
 */
export function ConnectAppStep({ setup, confirm, onConfirmed }: { setup: AuthenticatorSetup; confirm: (code: string) => Promise<AuthResult<string[]>>; onConfirmed: (codes: string[]) => void }) {
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { code: "" } });
  const code = useWatch({ control: form.control, name: "code" });

  function submit(values: Values) {
    run(() => confirm(values.code), onConfirmed);
  }

  const wrong = error?.code === "code_wrong";

  return (
    <>
      <SetupProgress step={2} />
      <AuthHeading title="Connect your authenticator app">Add {APP_NAME} to the app, then type the 6-digit code it shows.</AuthHeading>
      <div className="mt-7 grid gap-4 rounded-[1.25rem] bg-card p-4.5 shadow-raised">
        <ol className="grid list-decimal gap-2 pl-4.5 text-sm leading-[1.45] text-muted-foreground [&_b]:font-medium [&_b]:text-foreground">
          <li>
            <b>Open your authenticator app</b> and tap the add button.
          </li>
          <li>
            <b>Tap Open in authenticator app</b> on this phone, or enter the setup key below.
          </li>
          <li>
            <b>Type the 6-digit code</b> the app shows for {APP_NAME}.
          </li>
        </ol>
        <Button asChild variant="outline" size="lg" className="w-full">
          <a href={setup.uri}>
            <Smartphone />
            Open in authenticator app
          </a>
        </Button>
      </div>
      <div className="mt-4 grid gap-1.75">
        <span id="key-label" className="text-sm font-medium">
          Setup key
        </span>
        <div className="flex items-center gap-2 rounded-[0.875rem] bg-secondary py-1.5 pr-1.5 pl-3.5">
          <code aria-labelledby="key-label" className="min-w-0 flex-1 font-mono text-[0.9375rem] tracking-[0.04em] break-all select-all">
            {groupKey(setup.secret)}
          </code>
          <CopyButton text={setup.secret} label="Copy" className="h-8.5 shrink-0 px-3.5 text-[0.8125rem]" />
        </div>
        <p className="text-[0.8125rem] leading-[1.45] text-muted-foreground">Time-based, 6 digits. Keep this key private; it works like a password.</p>
      </div>
      {error && !wrong ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(submit)} aria-busy={pending}>
        <Controller
          control={form.control}
          name="code"
          render={({ field }) => (
            <CodeField
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                if (error) setError(null);
              }}
              disabled={pending}
              invalid={wrong}
              message={
                wrong
                  ? "That code didn't match. Enter the code showing now, and check that your phone sets its time automatically."
                  : "The code changes every 30 seconds. Enter the one showing now."
              }
            />
          )}
        />
        <SubmitButton pending={pending} disabled={code.length < AUTH_POLICY.codeLength}>
          Turn on two-factor
        </SubmitButton>
      </form>
    </>
  );
}
