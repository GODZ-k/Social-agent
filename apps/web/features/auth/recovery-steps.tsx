const STEPS = [
  { title: "A short video call", body: "Support checks who you are. We email you within 1 working day to book it." },
  { title: "24 hours' notice", body: "We email you before two-factor is turned off. If you didn't ask for this, cancel from that email." },
  { title: "Set it up again", body: "You sign in with your password and turn on two-factor again. Every other session is signed out." },
];

/** The recovery sequence, numbered because the order matters. */
export function RecoverySteps() {
  return (
    <ol className="mt-7 grid gap-3.5 rounded-xl bg-card p-5 shadow-raised">
      {STEPS.map(({ title, body }, index) => (
        <li key={title} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 text-sm leading-[1.45] text-muted-foreground">
          <span aria-hidden className="grid size-7 place-items-center rounded-full bg-tint text-[0.8125rem] font-semibold text-tint-foreground">
            {index + 1}
          </span>
          <span>
            <b className="block font-medium text-foreground">{title}</b>
            {body}
          </span>
        </li>
      ))}
    </ol>
  );
}
