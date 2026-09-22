export function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5">
      <legend className="type-heading mb-4">{title}</legend>
      {children}
    </fieldset>
  );
}
