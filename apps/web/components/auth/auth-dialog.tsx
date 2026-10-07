"use client";

import { Dialog } from "radix-ui";

/**
 * The centred dialog used on the two-factor account page. `role="alertdialog"`
 * for confirmations that change how someone signs in.
 */
export function AuthDialog({
  open,
  onOpenChange,
  title,
  description,
  alert,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  alert?: boolean;
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <Dialog.Content
          role={alert ? "alertdialog" : "dialog"}
          className="fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-popover shadow-floating outline-none"
        >
          <div className="grid gap-4 p-6">
            <div>
              <Dialog.Title className="type-heading">{title}</Dialog.Title>
              <Dialog.Description className="mt-1.5 text-sm text-foreground">{description}</Dialog.Description>
            </div>
            {children}
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-4">{footer}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
