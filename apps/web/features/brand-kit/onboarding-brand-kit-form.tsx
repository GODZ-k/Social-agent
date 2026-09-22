"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { ScanResult } from "@/lib/types";
import { brandStyle } from "@/lib/utils";
import { brandKitSchema, toInput, toValues, type Values } from "@/features/brand-kit/schema";
import { BrandKitFields } from "@/features/brand-kit/brand-kit-fields";
import { BrandPreview } from "@/features/brand-kit/brand-preview";
import { useLiveBrand } from "@/features/brand-kit/use-live-brand";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";

/** Onboarding's review step: correct what the agent found, then create the client. */
export function OnboardingBrandKitForm({ url, scan }: { url: string; scan: ScanResult }) {
  const router = useRouter();
  const form = useForm<Values>({
    resolver: zodResolver(brandKitSchema),
    defaultValues: toValues(scan, ["instagram"]),
    mode: "onTouched",
  });
  const preview = useLiveBrand(form, scan.brand);
  const save = useServerAction(createClient, {
    success: (client) => `${client.name} added`,
    failure: "Couldn't save the client.",
    onSuccess: (client) => router.push(`/c/${client.id}/strategy`),
  });

  return (
    <div className="brand-scope" style={brandStyle(preview.brand.colors[0]!.hex)}>
      <div className="mb-8 max-w-[60ch]">
        <h1 className="type-title">Here&apos;s what the agent found</h1>
        <p className="mt-2 text-muted-foreground">
          Every post it writes starts from this. Correct anything that&apos;s off before it plans the strategy.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => save.run(toInput(values, url)))} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <BrandKitFields form={form} platformsHint="You'll connect the accounts after the strategy is ready." />
          <BrandPreview brand={preview.brand} hook={preview.hook}>
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={save.isPending}>
              {save.isPending && <LoaderCircle className="animate-spin" />}
              {save.isPending ? "Saving the brand kit" : "Save and plan the strategy"}
            </Button>
          </BrandPreview>
        </form>
      </Form>
    </div>
  );
}
