import { Logo } from "@/components/shell/logo";

/** Shared frame for the sign-in and sign-up screens. */
export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 pt-10 pb-16 md:pt-16">
      <Logo />
      <h1 className="type-title mt-10 text-center">{title}</h1>
      <p className="mt-2 mb-8 max-w-[40ch] text-center text-muted-foreground">{description}</p>
      {children}
    </main>
  );
}

/** Holds the form's place while Clerk's UI loads, so a slow connection doesn't show an empty page. */
export function AuthFormFallback() {
  return (
    <div className="grid w-full max-w-[25rem] gap-4 rounded-xl bg-card p-8 shadow-raised" role="status" aria-label="Loading the form">
      <div className="skeleton h-10" />
      <div className="skeleton h-10" />
      <div className="skeleton h-11 rounded-full" />
    </div>
  );
}
