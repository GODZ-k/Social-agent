"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { useAuthSubmit } from "./use-auth-submit";

type Step = { name: "choose" } | { name: "app"; setup: AuthenticatorSetup } | { name: "passkey" } | { name: "codes"; codes: string[] };

const formSchema = z.object({ method: z.enum(["authenticator_app", "passkey"]) });
type Values = z.infer<typeof formSchema>;

/**
 * AUTH-7 setup: choose a method, connect it, save backup codes. Admins must
 * finish it before their area opens; clients reach it from their account and get `skip`.
 */
export function TwoFactorSetup({ lede, redirectTo, skip }: { lede: string; redirectTo: string; skip?: React.ReactNode }) {
  const router = useRouter();
  const { startAuthenticatorApp, confirmAuthenticatorApp, createPasskey } = useTwoFactorSetup();
  const { pending, error, run } = useAuthSubmit();
  const [finishing, startFinishing] = useTransition();
  const methods = authCapabilities.secondFactors;
  const [step, setStep] = useState<Step>({ name: "choose" });
  const form = useForm<Values>({ resolver: zodResolver(formSchema), defaultValues: { method: methods[0] ?? "authenticator_app" } });

  function finish() {
    startFinishing(() => {
      router.push(redirectTo);
      router.refresh();
    });
  }

  function startApp() {
    run(startAuthenticatorApp, (setup) => setStep({ name: "app", setup }));
  }

  function continueWithMethod(values: Values) {
    if (values.method === "passkey") setStep({ name: "passkey" });
    else startApp();
  }

  if (step.name === "app") return <ConnectAppStep setup={step.setup} confirm={confirmAuthenticatorApp} onConfirmed={(codes) => setStep({ name: "codes", codes })} />;
  if (step.name === "passkey") return <CreatePasskeyStep create={createPasskey} onCreated={finish} onUseApp={startApp} />;
  if (step.name === "codes") return <SaveCodesStep codes={step.codes} onDone={finish} pending={finishing} />;

  return (
    <>
      <SetupProgress step={1} />
      <AuthHeading title="Turn on two-factor sign-in">{lede}</AuthHeading>
      {error ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <form className="mt-8 grid gap-4.5" onSubmit={form.handleSubmit(continueWithMethod)} noValidate aria-busy={pending}>
        <Controller control={form.control} name="method" render={({ field }) => <MethodChoice methods={methods} value={field.value} onValueChange={field.onChange} />} />
        <SubmitButton pending={pending}>Continue</SubmitButton>
        {skip}
      </form>
    </>
  );
}
