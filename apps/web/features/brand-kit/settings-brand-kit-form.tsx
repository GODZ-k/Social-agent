"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { updateClient } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { Client } from "@/lib/types";
import { brandStyle } from "@/lib/utils";
import { brandKitSchema, toPatch, toValues, type Values } from "@/features/brand-kit/schema";
import { BrandKitFields } from "@/features/brand-kit/brand-kit-fields";
import { BrandPreview } from "@/features/brand-kit/brand-preview";
import { useLiveBrand } from "@/features/brand-kit/use-live-brand";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";

/** Settings: change the kit of an existing client. The button wakes up only once something has changed. */
export function SettingsBrandKitForm({ client }: { client: Client }) {
  const form = useForm<Values>({
    resolver: zodResolver(brandKitSchema),
    defaultValues: toValues(client, client.platforms),
    mode: "onTouched",
  });
  const preview = useLiveBrand(form, client.brand);
  const save = useServerAction(updateClient, {
    success: "Changes saved",
    failure: "Couldn't save those changes.",
    // The saved values become the new baseline, so the button sleeps again until the next edit.
    onSuccess: (saved) => form.reset(toValues(saved, saved.platforms)),
  });

  return (
    <div className="brand-scope" style={brandStyle(preview.brand.colors[0]!.hex)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => save.run(client.id, toPatch(values)))} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <BrandKitFields form={form} platformsHint="The strategy plans posts for these. Connect each one under Social accounts so it can publish." />
          <BrandPreview brand={preview.brand} hook={preview.hook}>
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={save.isPending || !form.formState.isDirty}>
              {save.isPending && <LoaderCircle className="animate-spin" />}
              {save.isPending ? "Saving changes" : "Save changes"}
            </Button>
            <p className="type-label mt-2.5 text-center">New posts use the updated kit. Posts already drafted keep their wording.</p>
          </BrandPreview>
        </form>
      </Form>
    </div>
  );
}
