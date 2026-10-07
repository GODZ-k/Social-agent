"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useChangePassword } from "@/lib/auth/client";
import { AUTH_POLICY } from "@/lib/auth/rules";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { PasswordField } from "@/components/auth/password-field";
import { Notice } from "@/components/auth/notice";
import { errorCopy } from "@/components/auth/error-copy";
import { useAuthSubmit } from "@/hooks/use-auth-submit";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(AUTH_POLICY.minPasswordLength, `At least ${AUTH_POLICY.minPasswordLength} characters`),
    signOutOther: z.boolean(),
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    path: ["newPassword"],
    message: "Choose a password you haven't used here before",
  });
type ChangePasswordValues = z.infer<typeof formSchema>;

/**
 * Changing a password from inside the account, without leaving for the reset
 * flow: that one is for people who cannot sign in, and sending someone who
 * already is through it logs them out of their own account to get back in.
 */
export function ChangePasswordForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { changePassword } = useChangePassword();
  const { pending, error, setError, run } = useAuthSubmit();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "", signOutOther: true },
  });

  function onValid(values: ChangePasswordValues) {
    run(() => changePassword(values), () => {
      toast.success("Password changed");
      onDone();
    });
  }

  const wrongCurrent = error?.code === "wrong_credentials";

  return (
    <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onValid)} noValidate aria-busy={pending}>
      {error && !wrongCurrent ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <Controller
        control={form.control}
        name="currentPassword"
        render={({ field, fieldState }) => (
          <PasswordField
            {...field}
            id="current-password"
            label="Current password"
            autoComplete="current-password"
            disabled={pending}
            aria-invalid={wrongCurrent || !!fieldState.error}
            message={wrongCurrent ? "That password doesn't match." : fieldState.error?.message}
            onChange={(event) => {
              field.onChange(event);
              if (wrongCurrent) setError(null);
            }}
          />
        )}
      />
      <Controller
        control={form.control}
        name="newPassword"
        render={({ field, fieldState }) => (
          <PasswordField
            {...field}
            id="new-password"
            label="New password"
            autoComplete="new-password"
            disabled={pending}
            aria-invalid={!!fieldState.error}
            message={fieldState.error?.message ?? `At least ${AUTH_POLICY.minPasswordLength} characters, not common or leaked.`}
          />
        )}
      />
      <Controller
        control={form.control}
        name="signOutOther"
        render={({ field }) => (
          <label className="flex items-start gap-3">
            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={pending} />
            <span className="type-label text-muted-foreground">
              Sign out everywhere else. Leave this on if you think someone else knows the old password.
            </span>
          </label>
        )}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <LoaderCircle className="animate-spin" />}
          {pending ? "Saving" : "Change password"}
        </Button>
      </div>
    </form>
  );
}
