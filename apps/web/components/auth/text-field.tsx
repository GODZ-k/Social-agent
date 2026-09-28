import { cn } from "@/lib/utils";
import { FieldNote } from "./field-note";

export const controlClass =
  "flex min-h-12 items-center rounded-[0.875rem] bg-card shadow-[0_0_0_1px_var(--input)] transition-shadow duration-150 focus-within:shadow-[0_0_0_2px_var(--brand),0_0_0_6px_var(--tint-strong)] has-[input[aria-invalid=true]]:shadow-[0_0_0_2px_var(--destructive),0_0_0_6px_color-mix(in_srgb,var(--destructive)_12%,transparent)] has-[input:read-only]:bg-secondary has-[input:read-only]:shadow-none has-[input:disabled]:opacity-60 motion-reduce:transition-none";

export const inputClass =
  "h-12 min-w-0 flex-1 rounded-[inherit] bg-transparent px-4 text-base text-foreground outline-none placeholder:text-muted-foreground/80 read-only:text-muted-foreground";

type TextFieldProps = Omit<React.ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  /** Sits at the end of the label row, like "Forgot password?". */
  labelAside?: React.ReactNode;
  /** Shown under the field; an error when `aria-invalid` is set. */
  message?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  after?: React.ReactNode;
};

/** A labelled input whose message is tied to it with aria-describedby. */
export function TextField({ id, label, labelAside, message, leading, trailing, after, className, ...props }: TextFieldProps) {
  const messageId = message ? `${id}-msg` : undefined;
  const invalid = props["aria-invalid"] === true;
  return (
    <div className="grid min-w-0 gap-1.75">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {labelAside ? <span className="text-[0.8125rem]">{labelAside}</span> : null}
      </div>
      <div className={controlClass}>
        {leading ? <span className="ml-4 flex text-muted-foreground">{leading}</span> : null}
        <input id={id} name={id} aria-describedby={messageId} className={cn(inputClass, leading && "pl-2.5", className)} {...props} />
        {trailing}
      </div>
      {message ? (
        <FieldNote id={messageId} error={invalid}>
          {message}
        </FieldNote>
      ) : null}
      {after}
    </div>
  );
}
