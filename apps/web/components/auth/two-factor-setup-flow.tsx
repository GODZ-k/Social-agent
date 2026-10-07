"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authCapabilities, useTwoFactorSetup } from "@/lib/auth/client";
import type { AuthenticatorSetup } from "@/lib/auth/types";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { SubmitButton } from "@/components/auth/submit-button";
import { ConnectAppStep } from "./connect-app-step";
import { CreatePasskeyStep } from "./create-passkey-step";
import { errorCopy } from "./error-copy";
import { MethodChoice } from "./method-choice";
import { SaveCodesStep } from "./save-codes-step";
import { SetupProgress } from "./setup-progress";
import { StartAuthenticatorStep } from "./start-authenticator-step";
import { useAuthSubmit } from "@/hooks/use-auth-submit";

type Step = { name: "choose" } | { name: "app"; setup: AuthenticatorSetup } | { name: "passkey" } | { name: "codes"; codes: string[] };

const formSchema = z.object({ method: z.enum(["authenticator_app", "passkey"]) });
type Values = z.infer<typeof formSchema>;

/**
 * AUTH-7 setup: connect a method, then save the backup codes if the provider hands any
 * out. With one method there is nothing to choose, so step 1 explains it and waits for
 * a click instead of asking the person to pick between one thing. What finishing means
 * is the caller's: the page sends the person on to where they were going, the account
 * dialog puts them back on the security pane.
 *
 * `headingLevel` defaults to 2 because the account dialog (whose call this component
 * does not control) already titles itself with an `<h2>`; the page below overrides it
 * to 1, since it is its own top-level heading there.
 */
export function TwoFactorSetupFlow({ lede, onDone, skip, headingLevel = 2 }: { lede: string; onDone: () => void; skip?: React.ReactNode; headingLevel?: 1 | 2 }) {
  const { startAuthenticatorApp, confirmAuthenticatorApp, createPasskey } = useTwoFactorSetup();
  const { pending, error, run } = useAuthSubmit();
  const [finishing, startFinishing] = useTransition();
  const methods = authCapabilities.secondFactors;
  const hasChoice = methods.length > 1;
  const [step, setStep] = useState<Step>({ name: "choose" });
  const form = useForm<Values>({ resolver: zodResolver(formSchema), defaultValues: { method: methods[0] ?? "authenticator_app" } });

  function finish() {
    startFinishing(() => {
      onDone();
    });
  }

  function startApp() {
    run(startAuthenticatorApp, (setup) => setStep({ name: "app", setup }));
  }

  function continueWithMethod(values: Values) {
    if (values.method === "passkey") setStep({ name: "passkey" });
    else startApp();
  }

  if (step.name === "app") {
    return (
      <ConnectAppStep
        setup={step.setup}
        confirm={confirmAuthenticatorApp}
        onConfirmed={(codes) => (codes.length > 0 ? setStep({ name: "codes", codes }) : finish())}
        headingLevel={headingLevel}
      />
    );
  }
  if (step.name === "passkey") return <CreatePasskeyStep create={createPasskey} onCreated={finish} onUseApp={startApp} headingLevel={headingLevel} />;
  if (step.name === "codes") return <SaveCodesStep codes={step.codes} onDone={finish} pending={finishing} headingLevel={headingLevel} />;

  if (!hasChoice) return <StartAuthenticatorStep lede={lede} pending={pending} error={error} headingLevel={headingLevel} onStart={startApp} skip={skip} />;

  return (
    <>
      <SetupProgress step={1} />
      <AuthHeading title="Turn on two-factor sign-in" level={headingLevel}>
        {lede}
      </AuthHeading>
      {error ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(continueWithMethod)} noValidate aria-busy={pending}>
        <Controller control={form.control} name="method" render={({ field }) => <MethodChoice methods={methods} value={field.value} onValueChange={field.onChange} />} />
        <SubmitButton pending={pending}>Continue</SubmitButton>
        {skip}
      </form>
    </>
  );
}
