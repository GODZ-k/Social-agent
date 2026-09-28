const WINDOW_MINUTES = 30;
const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A ring that shrinks as the 30-minute auto-start window runs out. */
export function CountdownRing({ minutes }: { minutes: number }) {
  const fraction = Math.min(1, minutes / WINDOW_MINUTES);
  const dash = fraction * CIRCUMFERENCE;

  return (
    <div
      role="timer"
      aria-label={`${minutes} minute${minutes === 1 ? "" : "s"} until it starts`}
      className="relative grid size-15 shrink-0 place-items-center sm:size-18"
    >
      <svg viewBox="0 0 60 60" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="30" cy="30" r={RADIUS} fill="none" stroke="var(--tint-strong)" strokeWidth="6" />
        <circle
          cx="30"
          cy="30"
          r={RADIUS}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
        />
      </svg>
      <b className="absolute flex flex-col items-center text-base font-semibold tabular-nums sm:text-lg">
        {minutes}
        <small className="text-[0.625rem] font-medium text-muted-foreground">min</small>
      </b>
    </div>
  );
}
